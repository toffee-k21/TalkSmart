'use client';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import NotificationItem from './NotificationItem';

const NotificationSection = () => {
    const { socket, isConnected, userId }: any = useSocket();
    // userId must come from your socket context (decoded from JWT)

    const {notifications} = useNotification();
    const router = useRouter();

    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            // 🎥 Join the room
            if (message.type === "join-room") {
                const { roomId, callerId, receiverId } = message;

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


    const handleAccept = (callerId:string) => {
        if (!socket || !callerId) return;

        socket.send(JSON.stringify({
            type: "accept-request",
            callerId
        }));
    };

    if (!isConnected) return null;

    return (
        <div>
            <motion.aside
                className="lg:sticky lg:top-32 lg:self-start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="border-t border-[#E6E6E6] pt-8 pb-8">
                    <h3 className="text-[1.125rem] font-[300] tracking-[-0.01em]">
                        Notifications
                    </h3>
                </div>

                {/* Floating notification panel with partial borders */}
                <div className="bg-[#F9F9F9] border-l-[0.5px] border-[#E6E6E6] pl-8 pr-6">
                    {notifications.length > 0 ? (
                        notifications.map((notification:any) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onAccept={handleAccept}
                                // onIgnore={handleIgnore}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-[0.875rem] font-[200] text-[#9B9B9B]">
                                No new notifications
                            </p>
                        </div>
                    )}
                </div>

                {/* Additional info */}
                <div className="mt-12 pt-8 border-t border-[#E6E6E6]">
                    <p className="text-[0.8125rem] font-[200] text-[#9B9B9B] leading-relaxed">
                        Interview requests expire after 24 hours. Respond promptly to maintain your rating.
                    </p>
                </div>
            </motion.aside>
            {/* {callerId ? (
                <div>
                    Incoming call from: {callerId}
                    <button onClick={handleAcceptRequest}>Accept</button>
                </div>
            ) : (
                <div>No notification</div>
            )} */}
        </div>
    );
};

export default NotificationSection;