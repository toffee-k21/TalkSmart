"use client"
import { createContext, useContext, useEffect, useState } from "react";
import config from "../utils.json";
import { useRouter } from "next/navigation";

const WS_URL = config.WS_URL;
const SocketContext = createContext<WebSocket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
            
        if (!token) {
            router.push("/auth");
            return;
        }
        console.log("token",token)

        const ws = new WebSocket(`${WS_URL}/?token=${token}`);
        ws.onopen = () => setSocket(ws);
        return () => ws.close();
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
