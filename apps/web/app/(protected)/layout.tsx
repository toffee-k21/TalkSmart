"use client";

import { SocketProvider } from "../context/SocketContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
        if (!token) {
            router.push("/auth"); // redirect if not authenticated
        }
    }, []);

    return (
        <SocketProvider>
            {children}
        </SocketProvider>
    );
}
