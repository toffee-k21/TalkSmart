import { WebSocketServer } from "ws";
import { connectionHandler } from "./ws/connectionHandler";
import { redis, pub, subPattern, subGlobal } from "./config/redis";
import { localConnections } from "./ws/local";
import { randomUUID } from "crypto";

export const nodeId = randomUUID();
console.log("Running WS Node:", nodeId);

async function bootstrap() {
  console.log("🔌 Connecting Redis...");

  await redis.connect();
  await pub.connect();
  await subPattern.connect();  // for pSubscribe
  await subGlobal.connect();   // for subscribe

  console.log("✔ All Redis Clients Connected");

  const wss = new WebSocketServer({ port: 5001 });

  wss.on("connection", connectionHandler);

  // Pattern-based subscription (signal routing)
  await subPattern.pSubscribe(`signal:${nodeId}`, (message, channel) => {
    const parsed = JSON.parse(message);
    // console.log("msg ", message);
    const ws = localConnections.get(parsed.to);
    if (ws) ws.send(JSON.stringify(parsed));
  });

  // Normal subscription (global broadcast)
  await subGlobal.subscribe("global:broadcast", (message, channel) => {
    const parsed = JSON.parse(message);
    for (const ws of localConnections.values()) {
      ws.send(JSON.stringify(parsed));
    }
  });

  console.log("WS Server running on ws://localhost:5001");
}

bootstrap().catch(console.error);
