import React, { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useRouter } from 'next/navigation';

const NotificationSection = () => {
    const {socket}:any = useSocket();
    const [callBy, setCallBy] = useState();
    const router = useRouter();
    socket.onmessage = async (event:any) => {
        const message = JSON.parse(event.data);
        console.log("Received:", message);
        if(message.type == "request-call"){
            alert("An Request for call arrived!");
            setCallBy(message.details);
        }
        if (message.type == "join-room"){
            const roomId = message.details;
            router.push(`room/${roomId}`);
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