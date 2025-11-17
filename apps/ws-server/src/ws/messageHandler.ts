import { WebSocket } from "ws";
import { getUserById, users } from "../services/userService";
import { createRoom, getRoomById } from "../services/roomService";
import { storePending } from "../services/pendingService";

export function handleMessage(ws: WebSocket, userId: string, data: any) {
  switch (data.type) {
    case "switch-availability": {
      const user = getUserById(userId);
      if (!user) return;

      user.available = !user.available;
      ws.send("switched-availability");
      break;
    }

    case "request-call": {
      const toId = data.participants[0];
      const target = getUserById(toId);
      if (!target) return;

      target.ws.send(
        JSON.stringify({
          type: "request-call",
          details: userId,
          msg: `Call request from ${userId}`
        })
      );

      const caller = getUserById(userId);
      caller!.role = "sender";
      target.role = "receiver";

      break;
    }

    case "accept-request": {
      data.participants.push(userId);

      const room = createRoom(data.participants);

      users
        .filter(u => data.participants.includes(u.userId))
        .forEach(u =>
          u.ws.send(
            JSON.stringify({
              type: "join-room",
              details: room.roomId,
              participants: data.participants,
              role: u.role
            })
          )
        );
      break;
    }

    case "createOffer": {
      const room = getRoomById(data.details);
      const receiverId = room?.participants.find(p => p !== userId);
      const receiver = getUserById(receiverId!);

      const msg = { type: "createOffer", sdp: data.sdp, from: userId };

      receiver ? receiver.ws.send(JSON.stringify(msg)) : storePending(receiverId!, msg);
      break;
    }

    case "createAnswer": {
      const room = getRoomById(data.details);
      const callerId = room?.participants.find(p => p !== userId);
      const caller = getUserById(callerId!);

      const msg = { type: "createAnswer", sdp: data.sdp, from: userId };

      caller ? caller.ws.send(JSON.stringify(msg)) : storePending(callerId!, msg);
      break;
    }

    case "iceCandidate": {
      const room = getRoomById(data.details);
      const receiverId = room?.participants.find(p => p !== userId);
      const receiver = getUserById(receiverId!);

      receiver?.ws.send(
        JSON.stringify({ type: "iceCandidate", candidate: data.candidate })
      );
      break;
    }
  }
}
