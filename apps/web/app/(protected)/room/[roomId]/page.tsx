'use client'
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const Room = () => {
    const searchParams = useSearchParams();
    const role: string = searchParams.get("role")!;
    const roomId: any = useParams().roomId;
    const router = useRouter();

    const { socket, isConnected }: any = useSocket();
    const [connected, setConnected] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    let peerConnection: RTCPeerConnection | null = null;

    // 🧠 Core: start WebRTC + signaling
    const startConnection = async (selectedRole: string) => {

        const ws = socket;
        if (!ws) return console.error("WebSocket not available");

        wsRef.current = ws;
        console.log("Starting meeting as:", selectedRole);

        // Notify backend that meeting started
        // ws.send(JSON.stringify({ type: "startMeeting", details: roomId }));

        // Create peer connection
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerRef.current = peer;

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(
                    JSON.stringify({ type: "iceCandidate", candidate: event.candidate, details: roomId })
                );
            }
        };

        // When remote peer sends media
        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]!;
            }
        };

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        // Handle messages (only once)
        ws.onmessage = async (event: any) => {
            const message = JSON.parse(event.data);
            console.log("Received:", message);

            switch (message.type) {
                case "createOffer":
                    await handleReceiveOffer(message.sdp);
                    break;
                case "createAnswer":
                    await handleReceiveAnswer(message.sdp);
                    break;
                case "iceCandidate":
                    if (message.candidate) {
                        await peerRef.current?.addIceCandidate(message.candidate);
                    }
                    break;
                case "peer-disconnected":
                    alert("Your peer disconnected. Please start again.");
                    peerRef.current?.close();
                    setConnected(false);
                    router.push("/home");
                    break;
            }
        };

        // If sender, create and send offer
        if (selectedRole === "sender") {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "createOffer", sdp: offer, details: roomId}));
        }

        setConnected(true);
    };

    // 🧩 When we get an offer (receiver)
    const handleReceiveOffer = async (sdp: any) => {
        const peer = peerRef.current!;
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        wsRef.current?.send(JSON.stringify({ type: "createAnswer", sdp: answer, details: roomId }));
    };

    // 🧩 When we get an answer (sender)
    const handleReceiveAnswer = async (sdp: any) => {
        const peer = peerRef.current!;
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    // 🪄 Auto-start connection when socket is ready
    useEffect(() => {
        if (!isConnected || !socket || !role || !roomId) return;

        // 🔒 Prevent multiple runs
        if (peerRef.current) {
            console.log("Peer already exists, skipping startConnection");
            return;
        }

        startConnection(role);

        // 🧹 Cleanup on unmount or dependency change
        return () => {
            console.log("Cleaning up WebRTC connection...");
            if (peerRef.current) {
                peerRef.current.close();
                peerRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.onmessage = null;
            }
        };
    }, [isConnected, socket, role, roomId]);


    return (
        <div className="flex flex-col items-center p-4 space-y-4">
            <p className="text-gray-700">
                {connected ? `Connected as ${role}` : "Connecting..."}
            </p>

            <div className="grid grid-cols-2 gap-4">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-64 h-48 bg-black" />
                <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
            </div>
        </div>
    );
};

export default Room;
