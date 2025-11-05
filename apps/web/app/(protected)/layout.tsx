"use client";

import { SocketProvider } from "../context/SocketContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {backend_url} from "../utils.json";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const verifyToken = async () => {
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

            if (!data.valid) {
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

    return <SocketProvider>
        {children}
    </SocketProvider>;
}
