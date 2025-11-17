import { pub } from "../config/redis";
import { getRoom, createRoom } from "../services/roomService";
import { storePending } from "../services/pendingService";
import { getUserNode } from "../services/userService";

export async function handleMessage(ws:any, userId:any, parsed:any) {
    console.log(parsed);
  switch (parsed.type) {

    case "request-call": {
  const { callerId, receiverId } = parsed;

  const node = await getUserNode(receiverId);

  const msg = {
    type: "request-call",
    callerId,
    receiverId,
    to: receiverId
  };

  if (!node) {
    return storePending(receiverId, msg);
  }

  await pub.publish(`signal:${node}`, JSON.stringify(msg));
  break;
}


    case "accept-request": {
  const { callerId, receiverId } = parsed;

  const room = await createRoom(callerId, receiverId);

  // Notify caller
  const callerNode = await getUserNode(callerId);
  await pub.publish(`signal:${callerNode}`, JSON.stringify({
    type: "join-room",
    roomId: room.roomId,
    callerId,
    receiverId,
    to: callerId
  }));

  // Notify receiver
  const receiverNode = await getUserNode(receiverId);
  await pub.publish(`signal:${receiverNode}`, JSON.stringify({
    type: "join-room",
    roomId: room.roomId,
    callerId,
    receiverId,
    to: receiverId
  }));

  break;
}


    case "createOffer": {
  const { roomId, from, to, sdp } = parsed;

  const node = await getUserNode(to);

  const msg = { type: "createOffer", roomId, from, to, sdp };

  if (!node) return storePending(to, msg);

  await pub.publish(`signal:${node}`, JSON.stringify(msg));
  break;
}


    case "createAnswer": {
  const { roomId, from, to, sdp } = parsed;

  const node = await getUserNode(to);

  const msg = { type: "createAnswer", roomId, from, to, sdp };

  if (!node) return storePending(to, msg);

  await pub.publish(`signal:${node}`, JSON.stringify(msg));
  break;
}


    case "iceCandidate": {
  const { roomId, from, to, candidate } = parsed;

  const node = await getUserNode(to);

  const msg = { type: "iceCandidate", roomId, from, to, candidate };

  await pub.publish(`signal:${node}`, JSON.stringify(msg));
  break;
}

  }
}
