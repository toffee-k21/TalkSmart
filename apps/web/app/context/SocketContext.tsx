"use client"
import { createContext, useContext, useEffect, useState } from "react";
import config from "../utils.json";

const WS_URL = config.WS_URL;
const SocketContext = createContext<WebSocket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => setSocket(ws);
        return () => ws.close();
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
