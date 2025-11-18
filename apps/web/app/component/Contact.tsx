'use client'
import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext';
import {backend_url} from "../utils.json"

const Contact = () => {
    const [users, setUsers]: any = useState([]);
    const {socket, isConnected}: any = useSocket();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    console.log("socket",socket);
    if(!isConnected) return null;

    const handleFetchUsers = async () =>{
        const res = await fetch(`${backend_url}/users/`);
        const usersList = await res.json();
        console.log("usersList",usersList);
        setUsers(usersList);
    }

    useEffect(() =>{
        handleFetchUsers();
    },[]);

    socket.onmessage = async (event: any) => {
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
                console.log("Currently online:", message.users);
                setOnlineUsers(message.users);
            }
        }
    };
    console.log("ou",onlineUsers);

    // console.log("ws",ws); // it is comming out to be null
    // const socket = ws?.socket;
    const handleSendRequest = (receiverId: string) => {
        socket.send(JSON.stringify({ type: "request-call", receiverId}));
    }

  return (
    <div>
        online users:
        {users.filter((u:any)=>{
            return onlineUsers.includes(u.id)
        }).map((e:any)=>{
           return <div key={e.id}>
            {e.username} - {e.id}
                <button onClick={() => handleSendRequest(e.id)}>request call</button>
            </div>
        })}
        offline users:
        {users.filter((u:any) =>{
        return !onlineUsers.includes(u.id)
        }).map((u: any) => {
            return <div key={u.id}>{u.username} - {u.id}
                {/* <button onClick={() => handleSendRequest(u.id)}>request call</button> */}
            </div>
        })} 
        {/* offline request call is made here available because to build notification queue and send if person is available and is offline , the message will sent to email */}
    </div>
  )
}

export default Contact