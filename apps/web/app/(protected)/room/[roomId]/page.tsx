'use client'
import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Room = () => {
    const searchParams = useSearchParams();
    const role = searchParams.get("role"); // caller / receiver
    const roomId = useParams().roomId;
    const router = useRouter();

    const { socket, isConnected } = useSocket();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev:any) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
            <motion.header
                className="bg-white border-b border-[#E6E6E6] px-8 h-16 flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="flex items-center gap-8">
                    <div className="text-[0.8125rem] font-[300] tracking-[0.15em] uppercase text-[#6B6B6B]">
                        PRAXIS
                    </div>
                    <div className="h-4 w-px bg-[#E6E6E6]" />
                    <div className="text-[0.8125rem] font-[200] text-[#6B6B6B]">
                        Room: <span className="text-black font-[300]">demo-room</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-[0.8125rem] font-[200] text-[#6B6B6B]">
                        {formatDuration(callDuration)}
                    </div>
                    <button
                        onClick={handleEndCall}
                        className="text-[0.8125rem] font-[300] text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity duration-500"
                    >
                        End Call
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-2 gap-4">
                <video ref={localVideoRef} autoPlay playsInline muted />
                <video ref={remoteVideoRef} autoPlay playsInline />
            </div>

            {/* Bottom Controls */}
            <motion.div
                className="bg-white border-t border-[#E6E6E6] px-8 h-20 flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="flex items-center gap-6">
                    {/* Microphone */}
                    <button
                        onClick={() => setIsMicOn(!isMicOn)} // Changed to use your handler
                        className={`w-12 h-12 border transition-all duration-500 flex items-center justify-center group ${isMicOn
                            ? 'border-[#E6E6E6] hover:bg-[#F5F5F5]'
                            : 'border-black bg-black'
                            }`}
                    >
                        {isMicOn ? (
                            // Mic On Icon
                            <svg className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                                <line x1="8" x2="16" y1="22" y2="22" />
                            </svg>
                        ) : (
                            // Mic Off Icon
                            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" x2="23" y1="1" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                                <line x1="15" x2="15.01" y1="9.34" y2="9.34" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                                <line x1="8" x2="16" y1="22" y2="22" />
                            </svg>
                        )}
                    </button>

                    {/* Camera */}
                    <button
                        onClick={() => setIsCameraOn(!isCameraOn)} // Changed to use your handler
                        className={`w-12 h-12 border transition-all duration-500 flex items-center justify-center group ${isCameraOn
                            ? 'border-[#E6E6E6] hover:bg-[#F5F5F5]'
                            : 'border-black bg-black'
                            }`}
                    >
                        {isCameraOn ? (
                            // Camera On Icon
                            <svg className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        ) : (
                            // Camera Off Icon
                            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" x2="23" y1="1" y2="23" />
                                <path d="M21 21l-5.13-4.27" />
                                <path d="M15 15l-7-7" />
                                <path d="M6.13 6.13A2 2 0 0 0 4 8v8a2 2 0 0 0 2 2h10a2 2 0 0 0 1.49-.63" />
                                <path d="M23 7l-7 5 7 5V7z" />
                            </svg>
                        )}
                    </button>

                    {/* Screen Share */}
                    <button
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className={`w-12 h-12 border transition-all duration-500 flex items-center justify-center group ${isScreenSharing
                            ? 'border-black bg-black'
                            : 'border-[#E6E6E6] hover:bg-[#F5F5F5]'
                            }`}
                    >
                        <svg className={`w-5 h-5 group-hover:scale-110 transition-transform duration-500 ${isScreenSharing ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" x2="16" y1="21" y2="21" />
                            <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                    </button>

                    {/* Chat */}
                    {/* <button
                        onClick={() => setShowChat(!showChat)}
                        className={`w-12 h-12 border transition-all duration-500 flex items-center justify-center group ${showChat
                            ? 'border-black bg-black'
                            : 'border-[#E6E6E6] hover:bg-[#F5F5F5]'
                            }`}
                    >
                        <svg className={`w-5 h-5 group-hover:scale-110 transition-transform duration-500 ${showChat ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button> */}

                    {/* Divider */}
                    <div className="h-8 w-px bg-[#E6E6E6] mx-2" />

                    {/* End Call */}
                    <button
                        onClick={handleEndCall}
                        className="w-12 h-12 bg-black border border-black hover:opacity-80 transition-opacity duration-500 flex items-center justify-center group"
                    >
                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="23" x2="1" y1="1" y2="23" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Room;
