// src/wsServer.ts
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5001 });

wss.on("connection", (ws) => {
  console.log("WS client connected on port 5001");

  ws.on("message", (msg) => {
    console.log("Message:", msg.toString());
    ws.send("Message received on WS server!");
  });
});
