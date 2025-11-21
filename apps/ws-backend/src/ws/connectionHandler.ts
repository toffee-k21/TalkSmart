import { authenticateUser } from "../config/auth";
import { addOrUpdateUser, getOnlineUsers, getUserNode } from "../services/userService";
// import { deliverPending } from "../services/pendingService";
import { broadcastUserStatus } from "../utils/broadcast";
import { handleMessage } from "./messageHandler";
import { handleClose } from "./closeHandler";
import { localConnections } from "./local";
import { nodeId } from "../index";
import { pub, redis } from "../config/redis";
import { findRoomWhereUserIsReceiver } from "../services/roomService";

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

  const pending = await redis.hGetAll(`pending:${userId}`);

  if (pending.offer) {
    ws.send(pending.offer);
  }

  if (pending.answer) {
    ws.send(pending.answer);
  }

  if (pending.iceCandidates) {
    JSON.parse(pending.iceCandidates).forEach((c:any) =>
        ws.send(JSON.stringify({ type: "iceCandidate", ...c }))
    );
  }

  // Clear after delivering
  await redis.del(`pending:${userId}`);

  // flush buffered messages
  for (const msg of ws.buffer) {
    const parsed = JSON.parse(msg.toString());
    handleMessage(ws, userId, parsed);
  }
  ws.buffer = [];

  //  Find any active room where this user is receiver
const room = await findRoomWhereUserIsReceiver(userId);

if (room) {
  const callerId = room.callerId;

  // is caller online? 
  const callerNode = await getUserNode(callerId);

  if (callerNode) {
    // route to the caller through pub/sub
    await pub.publish(`signal:${callerNode}`, JSON.stringify({
      type: "resend-offer",
      roomId: room.roomId,
      to: callerId
    }));
  }
}


  ws.on("close", async () => {
    await handleClose(userId);
    await broadcastUserStatus(userId, false);
  });
}

