'use client';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'next/navigation';

const NotificationSection = () => {
    const { socket, isConnected, userId }: any = useSocket();
    // userId must come from your socket context (decoded from JWT)

    const [callerId, setCallerId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("WS Received:", message);

            // 📞 Incoming call
            if (message.type === "request-call") {
                setCallerId(message.callerId);
            }

            // 🎥 Join the room
            if (message.type === "join-room") {
                const { roomId, callerId, receiverId } = message;
                console.log("callerid", callerId, "receiver", receiverId);

                // determine my role
                const role = userId === callerId ? "caller" : "receiver";

                router.push(`/room/${roomId}?role=${role}`);
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket, isConnected, router, userId]);


    const handleAcceptRequest = () => {
        if (!socket || !callerId) return;

        socket.send(JSON.stringify({
            type: "accept-request",
            callerId
        }));
    };

    if (!isConnected) return null;

    return (
        <div>
            {callerId ? (
                <div>
                    Incoming call from: {callerId}
                    <button onClick={handleAcceptRequest}>Accept</button>
                </div>
            ) : (
                <div>No notification</div>
            )}
        </div>
    );
};

export default NotificationSection;
