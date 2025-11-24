"use client";
import { createContext, useContext, useEffect, useState } from "react";
import config from "../utils.json";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { backend_url } from "../utils.json";
import { useSocket } from "./SocketContext";

const UserContext = createContext<{
    users: any;
    onlineUsers: string[];
} | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const {socket, isConnected} = useSocket();

    useEffect(()=>{
        const handleFetchAllUsers = async ( ) => {
            const res = await fetch(`${backend_url}/users/`);
            const usersList = await res.json();
            setUsers(usersList);
        }
        handleFetchAllUsers();
    },[]);

    useEffect(()=>{
        if(!isConnected || !socket) return;
        const handleMessage = async (event: any) => {
            const message = JSON.parse(event.data);
            // console.log("Received:", message);

            switch (message.type) {
                case "user-status": {
                    console.log(`${message.userId} is now ${message.isOnline ? "online" : "offline"}`);
                    setOnlineUsers(prev => {
                        if (message.isOnline) {
                            // Add user if not already in list
                            if (!prev.includes(message.userId)) {
                                return [...prev, message.userId];
                            }
                            return prev;
                        } else {
                            // Remove user if they went offline
                            return prev.filter(id => id !== message.userId);
                        }
                    });

                    break;
                }
                case "online-users": {
                    setOnlineUsers(message.users);
                }
            }
        };
        socket.addEventListener("message", handleMessage);
    },[socket, isConnected]);

    return (
        <UserContext.Provider value={{ users, onlineUsers}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
};
