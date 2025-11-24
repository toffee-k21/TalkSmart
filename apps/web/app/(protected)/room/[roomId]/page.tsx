'use client'
import React, { useEffect, useRef } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useParams, useSearchParams } from "next/navigation";

const Room = () => {
    const searchParams = useSearchParams();
    const role = searchParams.get("role"); // caller / receiver
    const roomId = useParams().roomId;

    const { socket, isConnected } = useSocket();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (!socket) return;
        wsRef.current = socket;

        let pc: RTCPeerConnection | null = null;

        const handleMessage = async (event: any) => {
            const msg = JSON.parse(event.data);
            pc = pcRef.current;
            if (!pc) return;

            if (msg.type === "createOffer") {
                await pc.setRemoteDescription(msg.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.send(JSON.stringify({
                    type: "createAnswer",
                    sdp: answer,
                    roomId
                }));
            }

            if (msg.type === "createAnswer") {
                await pc.setRemoteDescription(msg.sdp);
            }

            if (msg.type === "iceCandidate") {
                if (!msg.candidate) return;
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }

            if (msg.type === "resend-offer") {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.send(JSON.stringify({
                    type: "createOffer",
                    roomId,
                    sdp: offer
                }));
            }
        };

        // 👇 Attach listener BEFORE starting WebRTC
        socket.addEventListener("message", handleMessage);

        // 👇 Start WebRTC only after listener is attached
        const start = async () => {
            if (!isConnected) return;

            const _pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            pcRef.current = _pc;

            _pc.ontrack = (e) => {
                remoteVideoRef.current.srcObject = e.streams[0];
            };

            _pc.onicecandidate = (ev) => {
                if (!ev.candidate) return;
                socket.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: ev.candidate.toJSON(),
                    roomId
                }));
            };

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach(t => _pc.addTrack(t, stream));

            if (role === "caller") {
                const offer = await _pc.createOffer();
                await _pc.setLocalDescription(offer);

                socket.send(JSON.stringify({
                    type: "createOffer",
                    sdp: offer,
                    roomId
                }));
            }
        };

        start();

        return () => {
            socket.removeEventListener("message", handleMessage);
            pcRef.current?.close();
        };
    }, [socket, isConnected]); // dependencies kept minimal

    return (
        <div className="flex flex-col items-center">
            <p>{role}</p>

            <div className="grid grid-cols-2 gap-4">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <video ref={remoteVideoRef} autoPlay playsInline />
            </div>
        </div>
    );
};

export default Room;
