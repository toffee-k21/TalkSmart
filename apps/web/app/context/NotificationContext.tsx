"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useUsers } from "./UserContext";

const NotificationContext = createContext<{
    notifications: any;
} | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<any>([]);
    const { socket, isConnected } = useSocket();
    const {users} = useUsers();

    useEffect(() => {
        if (!isConnected || !socket) return;
        socket.onmessage = async (event: any) => {
            const message = JSON.parse(event.data);
            // console.log("Received:", message);

            // 📞 Incoming call
            if (message.type === "request-call") {
                // const callerInfo = users.find()
                const fromUserDetails = users.includes(message.calledId);
                setNotifications((prev:any) => {
                    return [...prev, { id: message.callerId, fromUserDetails }];
                })
            }
        };
    }, [socket, isConnected]);

    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
};
