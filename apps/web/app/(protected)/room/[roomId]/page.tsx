'use client'
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useParams, useSearchParams } from "next/navigation";

const Room = () => {
    const searchParams = useSearchParams();
    const role = searchParams.get("role");          // caller / receiver
    const roomId = useParams().roomId;

    const { socket, isConnected } = useSocket();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    // const [wsReady, setWsReady] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (!socket) return;
        wsRef.current = socket;

        socket.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            const pc = pcRef.current;

            if (!pc) return;

            if (msg.type === "createOffer") {
                await pc.setRemoteDescription(msg.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                wsRef.current?.send(JSON.stringify({
                    type: "createAnswer",
                    sdp: answer,
                    roomId,
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
    }, [socket]);

    // console.log("wsReady",wsReady);

    useEffect(() => {
        if (!isConnected) return;
        console.log("ws ready h !", isConnected)

        const start = async () => {
            // 1. CREATE PEER
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            pcRef.current = pc;

            // 2. ON TRACK
            pc.ontrack = (e) => {
                remoteVideoRef.current.srcObject = e.streams[0];
            };

            // 3. SEND ICE
            pc.onicecandidate = (ev) => {
                if (!ev.candidate) return;
                wsRef.current?.send(JSON.stringify({
                    type: "iceCandidate",
                    candidate: ev.candidate.toJSON(),
                    roomId,
                }));
            };

            // 4. LOCAL MEDIA
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            // 5. OFFER IF CALLER
            if (role === "caller") {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer); // this starts icecandidates gathering
                wsRef.current?.send(JSON.stringify({
                    type: "createOffer",
                    sdp: offer,
                    roomId,
                }));
            }
        };

        start();

        return () => pcRef.current?.close();
    }, [isConnected]);


    return (
        <div className="flex flex-col items-center">
            <p>{role}</p>

            <div className="grid grid-cols-2 gap-4">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <video ref={remoteVideoRef} autoPlay playsInline />
            </div>
        </div>
    )
}

export default Room;
