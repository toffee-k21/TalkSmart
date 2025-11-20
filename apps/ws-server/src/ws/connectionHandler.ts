import { authenticateUser } from "../config/auth";
import { addOrUpdateUser, getOnlineUsers } from "../services/userService";
// import { deliverPending } from "../services/pendingService";
import { broadcastUserStatus } from "../utils/broadcast";
import { handleMessage } from "./messageHandler";
import { handleClose } from "./closeHandler";
import { localConnections } from "./local";
import { nodeId } from "../index";

export async function connectionHandler(ws:any, req:any) {
  const userId = authenticateUser(req.url);
  if (!userId) return ws.close();

  ws.isReady = false;
  ws.buffer = [];

  // Buffer incoming messages
  ws.on("message", (msg:any) => {
    if (!ws.isReady) {
      ws.buffer.push(msg);
      return;
    }

    const parsed = JSON.parse(msg.toString());
    handleMessage(ws, userId, parsed);
  });

  localConnections.set(userId, ws);

  await addOrUpdateUser(userId, nodeId);

  ws.send(JSON.stringify({
    type: "online-users",
    users: await getOnlineUsers()
  }));

  await broadcastUserStatus(userId, true);

  ws.isReady = true;

  // flush buffered messages
  for (const msg of ws.buffer) {
    const parsed = JSON.parse(msg.toString());
    handleMessage(ws, userId, parsed);
  }
  ws.buffer = [];

  ws.on("close", async () => {
    await handleClose(userId);
    await broadcastUserStatus(userId, false);
  });
}

