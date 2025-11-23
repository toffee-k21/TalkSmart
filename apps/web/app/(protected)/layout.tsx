"use client";

import { SocketProvider } from "../context/SocketContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {backend_url} from "../utils.json";
import { UserProvider } from "../context/UserContext";
import { NotificationProvider } from "../context/NotificationContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const verifyToken = async () => {
        console.log("verify token");
        try {
            const res = await fetch(`${backend_url}/auth/verifyToken`, {
                method: "GET",
                credentials: "include", 
            });

            if (!res.ok) {
                router.push("/auth");
                return;
            }

            const data = await res.json();
            console.log("data.valid :", data.valid);

            if (data.valid) {
                setIsAuthorized(true);
            } else {
                router.push("/auth");
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            router.push("/auth");
        }
    };

    useEffect(() => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            router.push("/auth");
        } else {
            verifyToken(); // call backend to verify token
        }
    }, [router]);

    if (!isAuthorized) {
        return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
    }

    return (
    <SocketProvider>
        <UserProvider>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </UserProvider>
    </SocketProvider>
    )
}
