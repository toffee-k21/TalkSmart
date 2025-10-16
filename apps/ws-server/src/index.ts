import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "@repo/common-backend/config";

const wss = new WebSocketServer({ port: 5001 });

interface User {
  userId: string,
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

    return id;
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
  if(!userId) return;
  users.push({userId, ws, available: true});
  // console.log("WS client connected on port 5001");

  ws.on("message", (msg) => {

    // parsedData = {
    //   type
    //   details
    //   msg
    // }

    let parsedData;
      
      parsedData = JSON.parse(msg.toString());
      switch(parsedData.type){
        case "switch-availability" :{
           const user = users.find(u => u.ws == ws);
           user!.available = !user?.available;
           ws.send("switched-availibilty");
           break;
        }
        case "request-call" :{
          const toUserId = parsedData.userId;
          const user = users.find(u => u.userId == toUserId);
          user!.ws.send(JSON.stringify({type:"notification", details:userId, msg:`calling  request from ${userId}`}));
          break;
        }
        case "answer-request":{

        }
      }
  });
});
