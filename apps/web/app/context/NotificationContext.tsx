"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useUsers } from "./UserContext";

// Define a type for clarity
type NotificationType = {
    id: string; // The ID of the caller
    fromUserDetails: any; // The full user object of the caller
};

const NotificationContext = createContext<{
    notifications: NotificationType[];
    removeNotification: (id: string) => void; // Added a helper to clear notifications
} | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const { socket, isConnected } = useSocket();
    const { users } = useUsers();

    // Helper to remove a notification (e.g., when user accepts/declines)
    const removeNotification = (callerId: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== callerId));
    };

    useEffect(() => {
        if (!isConnected || !socket) return;

        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            if (message.type === "request-call") {
                console.log("Call Request Received:", message);

                // 1. FIX: Use .find() to match the ID inside the user objects
                // 2. FIX: Look for the 'callerId' (the person calling YOU)
                const fromUserDetails = users.find((u: any) => u._id === message.callerId);

                console.log("Caller Details Found:", fromUserDetails);

                if (fromUserDetails) {
                    setNotifications((prev) => {
                        // Optional: Prevent duplicate notifications from same user
                        // if (prev.some(n => n.id === message.callerId)) return prev;
                        return [...prev, { id: message.callerId, fromUserDetails }];
                    });
                }
            }
        };

        // 3. FIX: Use addEventListener so we don't overwrite other socket listeners
        socket.addEventListener("message", handleMessage);

        // Cleanup function to remove listener when component unmounts or deps change
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket, isConnected, users]); // 'users' dependency ensures we have latest list

    return (
        <NotificationContext.Provider value={{ notifications, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    // 4. FIX: Correct error message
    if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
    return ctx;
};