import { pub } from "../config/redis";
import { getRoom, createRoom } from "../services/roomService";
import { storePending } from "../services/pendingService";
import { getUserNode } from "../services/userService";

export async function handleMessage(ws:any, userId:any, parsed:any) {
  switch (parsed.type) {

    case "request-call": {
      const targetUserId = parsed.participants[0];

      const targetNode = await getUserNode(targetUserId);

      const message = {
        type: "request-call",
        from: userId,
        to: targetUserId
      };

      if (!targetNode) {
        await storePending(targetUserId, message);
        return;
      }

      await pub.publish(`signal:${targetNode}`, JSON.stringify(message));
      break;
    }

    case "accept-request": {
      parsed.participants.push(userId);
      const room = await createRoom(parsed.participants);

      for (const pid of parsed.participants) {
        const targetNode = await getUserNode(pid);

        await pub.publish(`signal:${targetNode}`, JSON.stringify({
          type: "join-room",
          roomId: room.roomId,
          participants: parsed.participants
        }));
      }
      break;
    }

    case "createOffer": {
      const room = await getRoom(parsed.details);
      const targetUserId = room.participants.find((p:any) => p !== userId);
      const targetNode = await getUserNode(targetUserId);

      const msg = {
        type: "createOffer",
        sdp: parsed.sdp,
        from: userId,
        to: targetUserId
      };

      if (!targetNode) return storePending(targetUserId, msg);

      await pub.publish(`signal:${targetNode}`, JSON.stringify(msg));
      break;
    }

    case "createAnswer": {
      const room = await getRoom(parsed.details);
      const targetUserId = room.participants.find((p:any) => p !== userId);
      const targetNode = await getUserNode(targetUserId);

      const msg = {
        type: "createAnswer",
        sdp: parsed.sdp,
        from: userId,
        to: targetUserId
      };

      if (!targetNode) return storePending(targetUserId, msg);

      await pub.publish(`signal:${targetNode}`, JSON.stringify(msg));
      break;
    }

    case "iceCandidate": {
      const room = await getRoom(parsed.details);
      const targetUserId = room.participants.find((p:any) => p !== userId);
      const targetNode = await getUserNode(targetUserId);

      const msg = {
        type: "iceCandidate",
        candidate: parsed.candidate,
        from: userId,
        to: targetUserId
      };

      await pub.publish(`signal:${targetNode}`, JSON.stringify(msg));
      break;
    }
  }
}
