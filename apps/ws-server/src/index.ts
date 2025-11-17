import { WebSocketServer } from "ws";
import { handleConnection } from "./ws/connectionHandler";

const wss = new WebSocketServer({ port: 5001 });

wss.on("connection", handleConnection);

console.log("WS server running on ws://localhost:5001");
