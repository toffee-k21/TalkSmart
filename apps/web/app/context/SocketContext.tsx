"use client";
import { createContext, useContext, useEffect, useState } from "react";
import config from "../utils.json";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const WS_URL = config.WS_URL;

interface DecodedToken {
    id: string; // or _id based on your backend
    name?: string;
    exp?: number;
}

const SocketContext = createContext<{
    socket: WebSocket | null;
    isConnected: boolean;
    userId: string | null;
} | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            router.push("/auth");
            return;
        }

        // 🔑 Decode JWT and store userId
        const decoded = jwtDecode<DecodedToken>(token);
        setUserId(decoded.id);

        const ws = new WebSocket(`${WS_URL}/?token=${token}`);

        ws.onopen = () => {
            setSocket(ws);
            setIsConnected(true);
        };

        ws.onclose = () => setIsConnected(false);
        ws.onerror = console.error;

        return () => ws.close();
    }, []);

    if (!isConnected) {
        return <div className="flex h-screen items-center justify-center">Connecting…</div>;
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, userId }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
};
