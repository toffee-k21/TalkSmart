import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/common-backend/config";
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 5001 });

interface User {
  userId: string,
  ws: WebSocket,
  available: boolean
}

interface Room {
  roomId: string,
  participants: string[]
}

interface parsedData {
  type : string,
  participants : string[],
  details: string
  sdp?: string,
  candidate?: string;
}

function authenticateUser(url:string){
  try {
    const queryParam = new URLSearchParams(url?.split('?')[1]);
    const token = queryParam.get('token');
    if(!token){
      console.log("token not found"); //todo: write code -> send to client 
      return null;
    }
    const id:string = jwt.verify(token, JWT_SECRET) as string;
    if(!id){
      wss.close();
    }

    return id;
  }
    catch(e){
      console.log(e);
      return null;
    }
}

let users: User[] = [];
let rooms: Room[] = [];

wss.on("connection", (ws, request) => {
  let userId = null;
  const url = request.url;
  if(!url){
    wss.close();
    return;
  }
  userId =  authenticateUser(url);
  if(!userId) return;
  users.push({userId, ws, available: true});
  // console.log("WS client connected on port 5001");

  ws.on("message", (msg) => {

    let parsedData:parsedData;
      
      parsedData = JSON.parse(msg.toString());
      switch(parsedData.type){
        case "switch-availability" :{
           const user = users.find(u => u.ws == ws);
           user!.available = !user?.available;
           ws.send("switched-availibilty");
           break;
        }
        case "request-call" :{
          const toUserId = parsedData.participants[0]; // details directly contains userId
          const user = users.find(u => u.userId == toUserId);
          if(!user?.available)return;
          user!.ws.send(JSON.stringify({type:"notification", details:userId, msg:`calling  request from ${userId}`}));
          break;
        }
        case "join-calling":{
          let participants = parsedData.participants;//expected: participants = ["a", "b"]
          const roomId = uuidv4();
          rooms.push({
            roomId:roomId,
            participants : [...participants] // i want to push multiple in this array
          })
          const usersAtCall:User[] = users.filter(u => participants.includes(u.userId));
          usersAtCall.forEach(u => u.ws.send(JSON.stringify({
            type:"joined-room",
            details: roomId,
            participants: [...participants]
          })));
        }
        case "createOffer": {
          const room = rooms.find(r => r.roomId === parsedData.details);// details="roomId"
          const receiverId = room?.participants.find(p => p !== userId);
          const receiver = users.find(u => u.userId === receiverId);
          receiver?.ws.send(JSON.stringify({
            type: "createOffer",
            sdp: parsedData.sdp
          }));
          break;
          //availabilty set false
        }
        case "createAnswer": {
          const room = rooms.find(r => r.roomId === parsedData.details);
          const callerId = room?.participants.find(p => p !== userId);
          const caller = users.find(u => u.userId === callerId);
          caller?.ws.send(JSON.stringify({
            type: "createAnswer",
            sdp: parsedData.sdp
          }));
          break;
          //availabilty set false
        }
        case "iceCandidate" : {
          const room = rooms.find(r => r.roomId === parsedData.details);// details="roomId"
          const receiverId = room?.participants.find(p => p !== userId);
          const receiver = users.find(u => u.userId === receiverId);
          const target = parsedData.participants;
          receiver?.ws?.send(JSON.stringify({ type: 'iceCandidate', candidate: parsedData.candidate }));
        }
      }
  });
});

// room -> list of rooms with id and partcipation name , etc