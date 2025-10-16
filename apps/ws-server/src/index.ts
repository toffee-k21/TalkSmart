// src/wsServer.ts
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/common-backend/config";

const wss = new WebSocketServer({ port: 5001 });

interface User {
  userId: String,
  ws: WebSocket,
  available: boolean
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
    // const user =  await prisma.user.findUnique({ where: { id } }); //to-do : resolve it ! if user is deleted but if token is there for user then the user can access even if he/she is removed from db
    return id;
    // else wss.close()
  }
    catch(e){
      console.log(e);
      return null;
    }
}

let users: User[] = [];


wss.on("connection", (ws, request) => {
  let userId = null;
  const url = request.url;
  if(!url){
    wss.close();
    return;
  }
  userId =  authenticateUser(url);
  // console.log("WS client connected on port 5001");

  ws.on("message", (msg) => {
    console.log("Message:", msg.toString());
    if(msg.toString() == "ping") ws.send("pong");
    // ws.send("Message received on WS server!");
  });
});
