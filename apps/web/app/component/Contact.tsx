'use client'
import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext';
import {backend_url} from "../utils.json"

const Contact = () => {
    const [users, setUsers]: any = useState([]);
    const {socket, isConnected}: any = useSocket();
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

    // console.log("ws",ws); // it is comming out to be null
    // const socket = ws?.socket;
    const handleSendRequest = (userId: string) => {
        socket.send(JSON.stringify({ type: "request-call", participants:[userId]}));
    }

  return (
    <div>
        {users.map((e:any)=>{
           return <div>{e.username} - {e.id}
                <button onClick={() => handleSendRequest(e.id)}>request call</button>
            </div>
        })}
    </div>
  )
}

export default Contact