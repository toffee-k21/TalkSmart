import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/common-backend/config";
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 5001 });

interface User {
  userId: string,
  ws: WebSocket,
  available: boolean,
  isOnline?: boolean,
  role?: string
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

interface PendingMessage {
  type: string;
  sdp?: any;
  candidate?: any;
  from: string;
}

let pendingMessages: Record<string, PendingMessage[]> = {}; // key = userId

function authenticateUser(url:string){
  try {
    const queryParam = new URLSearchParams(url?.split('?')[1]);
    const token = queryParam.get('token');
    if(!token){
      console.log("token not found"); //todo: write code -> send to client 
      return null;
    }
    const payload: any = jwt.verify(token, JWT_SECRET);
    if(!payload){
      wss.close();
    }
    return payload.id;
  }
    catch(e){
      console.log(e);
      return null;
    }
}

let users: User[] = [];
let rooms: Room[] = [];

function broadcastUserStatus(userId: string, isOnline: boolean) {
  const payload = {
    type: "user-status",
    userId,
    isOnline,
  };

  users.forEach(u => {
    if (u.isOnline && u.ws.readyState === WebSocket.OPEN) {
      u.ws.send(JSON.stringify(payload));
    }
  });
}

wss.on("connection", (ws, request) => {
  console.log(users.filter(u => u.isOnline).map(u => u.userId));
  let userId = null;
  const url = request.url;
  if(!url){
    wss.close();
    return;
  }
  userId =  authenticateUser(url);
  if(!userId) return;

   // Check if user already exists (maybe reconnecting)
  let existingUser = users.find(u => u.userId === userId);
  if (existingUser) {
    existingUser.ws = ws;
    existingUser.isOnline = true;
  } else {
    console.log("uid",userId);
    users.push({ userId, ws, available: true, isOnline: true });
  }
  ws.send(JSON.stringify({
    type: "online-users",
    users: users.filter(u => u.isOnline).map(u => u.userId)
  }));


  // Notify everyone about the updated online list
  broadcastUserStatus(userId, true);

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
          // if(!user?.available)return;
          if(!user)return;
          if(!user.ws) return;
          user.ws.send(JSON.stringify({type:"request-call", details:userId, msg:`calling  request from ${userId}`}));
          user!.role = "sender"; 
          const nativeUser = users.find(u => u.userId == userId);
          nativeUser!.role = "receiver";
          break;
        }
        case "accept-request":{
          parsedData.participants.push(userId); // parsedData.participants = ['a'];
          let participants = parsedData.participants;//expected: participants = ["a","uid"]
          const roomId = uuidv4();
          rooms.push({
            roomId:roomId,
            participants : [...participants] // i want to push multiple in this array
          })
          const usersAtCall:User[] = users.filter(u => participants.includes(u.userId));
          usersAtCall.forEach(u => u.ws.send(JSON.stringify({
            type:"join-room",
            details: roomId,
            participants: [...participants],
            role: u.role
          })));
          break;
        }
        case "startMeeting": {
          const user = users.find(u => u.ws === ws);
          if (!user) return;

          // Send pending messages only now
          if (pendingMessages[user.userId] && pendingMessages[user.userId]!.length > 0) {
            console.log(`Delivering ${pendingMessages[user.userId]!.length} pending messages to ${user.userId}`);
            pendingMessages[user.userId]!.forEach(msg =>
              ws.send(JSON.stringify(msg))
            );
            delete pendingMessages[user.userId]; // Clear them after sending
          }
          break;
        }
        case "createOffer": {
          const room = rooms.find(r => r.roomId === parsedData.details);// details="roomId"
          const receiverId = room?.participants.find(p => p !== userId);
          const receiver = users.find(u => u.userId === receiverId);

          const message = {
            type: "createOffer",
            sdp: parsedData.sdp,
            from: userId
          };

          if (receiver) {
            receiver.ws.send(JSON.stringify(message));
          } else {
            // Receiver not connected yet → store the message
            if(!receiverId) console.log("no receiver id", receiverId);
            if (!pendingMessages[receiverId!]) pendingMessages[receiverId!] = [];
            pendingMessages[receiverId!]!.push(message);
            console.log(`Stored pending offer for ${receiverId}`);
          }
          break;
          //availabilty set false
        }
        case "createAnswer": {
          const room = rooms.find(r => r.roomId === parsedData.details);
          const callerId = room?.participants.find(p => p !== userId);
          const caller = users.find(u => u.userId === callerId);
          const message = {
            type: "createAnswer",
            sdp: parsedData.sdp,
            from: userId
          };
          if (caller) {
            caller.ws.send(JSON.stringify(message));
          } else {
            if (!pendingMessages[callerId!]) pendingMessages[callerId!] = [];
            pendingMessages[callerId!]!.push(message);
            console.log(`Stored pending answer for ${callerId}`);
          }
          break;
          //availabilty set false
        }
        case "iceCandidate" : {
          const room = rooms.find(r => r.roomId === parsedData.details);// details="roomId"
          const receiverId = room?.participants.find(p => p !== userId);
          const receiver = users.find(u => u.userId === receiverId);
          // const target = parsedData.participants;
          receiver?.ws?.send(JSON.stringify({ type: 'iceCandidate', candidate: parsedData.candidate }));
        }
      }
  });
  ws.on("close", () => {
  const disconnectedUser = users.find(u => u.ws === ws);
  if (!disconnectedUser) return;

  const userId = disconnectedUser.userId;
  // console.log(`User ${userId} disconnected`);
  
  console.log(`User ${disconnectedUser.userId} went offline`);
  disconnectedUser.isOnline = false;

    // Notify others
    broadcastUserStatus(disconnectedUser.userId, false);


  // Remove user
  users = users.filter(u => u.ws !== ws);

  // Notify the other participant if in a room
  const room = rooms.find(r => r.participants.includes(userId));
  if (room) {
    const otherUserId = room.participants.find(p => p !== userId);
    const otherUser = users.find(u => u.userId === otherUserId);
    if (otherUser) {
      otherUser.ws.send(JSON.stringify({ type: "peer-disconnected" }));
    }

    // Clean up room
    rooms = rooms.filter(r => r.roomId !== room.roomId);
  }
});

});

// room -> list of rooms with id and partcipation name , etc