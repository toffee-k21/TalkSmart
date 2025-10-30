import React from 'react'
import { useSocket } from '../context/SocketContext';

const Contact = () => {
    const userList:any = [];
    const {socket}:any = useSocket();
    const handleSendRequest = (userId: string) => {
        socket.send(JSON.stringify({ type: "request-call", participants:[userId]}));
    }
  return (
    <div>
        {userList.map((e:any)=>{
            <div>{e.username} - {e.userId}
                <button onClick={() => handleSendRequest(e.userId)}></button>
            </div>
        })}
    </div>
  )
}

export default Contact