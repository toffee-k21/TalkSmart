import { authenticateUser } from "../config/auth";
import { addOrUpdateUser, getOnlineUsers } from "../services/userService";
import { deliverPending } from "../services/pendingService";
import { broadcastUserStatus } from "../utils/broadcast";
import { handleMessage } from "./messageHandler";
import { handleClose } from "./closeHandler";
import { localConnections } from "./local";
import { nodeId } from "../index";

export async function connectionHandler(ws:any, req:any) {
  const userId = authenticateUser(req.url);
  if (!userId) return ws.close();

  localConnections.set(userId, ws);

  await addOrUpdateUser(userId, nodeId);

  ws.send(JSON.stringify({
    type: "online-users",
    users: await getOnlineUsers()
  }));

  await broadcastUserStatus(userId, true);

  await deliverPending(userId, ws);

  ws.on("message", (msg:any) => {
    const parsed = JSON.parse(msg.toString());
    handleMessage(ws, userId, parsed);
  });

  ws.on("close", async () => {
    await handleClose(userId);
    await broadcastUserStatus(userId, false);
  });
}
