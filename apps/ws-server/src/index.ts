import { WebSocketServer } from "ws";
import { connectionHandler } from "./ws/connectionHandler";
import { sub } from "./config/redis";
import { localConnections } from "./ws/local";
import { randomUUID } from "crypto";

export const nodeId = randomUUID();
console.log("Running WS Node:", nodeId);

async function bootstrap() {
  const wss = new WebSocketServer({ port: 5001 });

  wss.on("connection", connectionHandler);

  // LISTEN TO SIGNALS FOR THIS NODE
  await sub.pSubscribe(`signal:${nodeId}`, (message: string, channel: string) => {
    const parsed = JSON.parse(message);

    const ws = localConnections.get(parsed.to);
    if (ws) ws.send(JSON.stringify(parsed));
  });

  // GLOBAL BROADCAST SUBSCRIBE
  await sub.subscribe("global:broadcast", (message: string, channel: string) => {
    const parsed = JSON.parse(message);

    // broadcast to all local WebSocket connections
    for (const ws of localConnections.values()) {
      ws.send(JSON.stringify(parsed));
    }
  });

  console.log("WS Server running on ws://localhost:5001");
}

bootstrap().catch(console.error);
