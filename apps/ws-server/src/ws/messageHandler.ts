import { pub } from "../config/redis";
import { getRoom, createRoom } from "../services/roomService";
import { storePending } from "../services/pendingService";
import { getUserNode } from "../services/userService";

export async function handleMessage(ws:any, userId:any, parsed:any) {

  switch (parsed.type) {
    case "request-call": {
      const callerId = userId;
      const receiverId = parsed.receiverId;

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
      const receiverId = parsed.receiverId;
      const callerId = parsed.callerId;

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
      const { roomId, sdp } = parsed;

      // Get room data
      const room = await getRoom(roomId);
      if (!room) return;

      // Determine the other peer
      const to = userId === room.callerId
          ? room.receiverId
          : room.callerId;

      const node = await getUserNode(to);

      const msg = {
          type: "createOffer",
          roomId,
          sdp,
          to
      };

      if (!node) {
          return storePending(to, msg);
      }

      await pub.publish(`signal:${node}`, JSON.stringify(msg));
      break;
    }

    case "createAnswer": {
      const { roomId, sdp } = parsed;

      const room = await getRoom(roomId);
      if (!room) return;

      const to = userId === room.callerId
          ? room.receiverId
          : room.callerId;

      const node = await getUserNode(to);

      const msg = {
          type: "createAnswer",
          roomId,
          sdp,
          to
      };

      if (!node) {
          return storePending(to, msg);
      }

      await pub.publish(`signal:${node}`, JSON.stringify(msg));
      break;
    }

    case "iceCandidate": {
      const { roomId, candidate } = parsed;

      const room = await getRoom(roomId);
      if (!room) return;

      const to = userId === room.callerId
          ? room.receiverId
          : room.callerId;

      const node = await getUserNode(to);

      const msg = {
          type: "iceCandidate",
          roomId,
          candidate,
          to
      };

      await pub.publish(`signal:${node}`, JSON.stringify(msg));
      break;
    }
  }
}
