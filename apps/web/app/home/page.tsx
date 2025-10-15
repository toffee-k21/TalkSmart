"use client"
import React, { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
// import { Button } from '@repo/ui/button';

const Home = () => {
    // const {socket}:any = useSocket();
    const socket = useSocket();
    // console.log(s);

    const handleMessage = (data: any) => {
        console.log(data);
    }

    useEffect(() => {
        if (!socket) return;
        socket?.addEventListener("message", handleMessage);
    }, [socket])

    const handleclick = () => {
        socket?.send("ping");
    }

    return (
        <div>
            <button onClick={handleclick}>ping</button>
        </div>
    )
}

export default Home