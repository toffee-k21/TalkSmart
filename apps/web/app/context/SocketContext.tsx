"use client"
import { createContext, useContext, useEffect, useState } from "react";
import config from "../utils.json";
import { useRouter } from "next/navigation";

const WS_URL = config.WS_URL;
const SocketContext = createContext<{ socket: WebSocket | null; isConnected: boolean }>({
    socket: null,
    isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
            
        if (!token) {
            router.push("/auth");
            return;
        }
        console.log("token",token)

        const ws = new WebSocket(`${WS_URL}/?token=${token}`);
        ws.onopen = () => {
            setSocket(ws)
            setIsConnected(true);
        };
        ws.onclose = () => setIsConnected(false);
        ws.onerror = console.error;

        return () => ws.close();
    }, []);
    if (!isConnected) {
        return <div className="flex h-screen items-center justify-center">Connecting…</div>;
    }

    return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;               // { socket, isConnected }
};
