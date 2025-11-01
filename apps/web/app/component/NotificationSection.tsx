import React, { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useRouter } from 'next/navigation';

const NotificationSection = () => {
    const {socket, isConnected}: any= useSocket();
    console.log("socket", socket);
    const [callBy, setCallBy] = useState();
    const router = useRouter();
    if(!isConnected) return null;
    socket.onmessage = async (event:any) => {
        const message = JSON.parse(event.data);
        console.log("Received:", message);
        if(message.type == "request-call"){
            alert("An Request for call arrived!");
            setCallBy(message.details);
        }
        if (message.type == "join-room"){
            const roomId = message.details;
            router.push(`room/${roomId}/?role=${message.role}`);
        }
    }
    const handleAcceptRequest = (callBy:string) => {
        socket.send(JSON.stringify({ type:"accept-request", participants:[callBy]}));
    }



    return (
    <div>
        {callBy ? <div>
            {callBy} - <button onClick={() => handleAcceptRequest(callBy)}>accept</button>
        </div> : <div>no notification</div>}
        
    </div>
  )
}

export default NotificationSection;