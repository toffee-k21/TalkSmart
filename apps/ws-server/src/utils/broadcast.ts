import { WebSocket } from "ws";
import { users } from "../services/userService";

export function broadcastUserStatus(userId: string, isOnline: boolean) {
  const payload = { type: "user-status", userId, isOnline };

  users.forEach(u => {
    if (u.isOnline && u.ws.readyState === WebSocket.OPEN) {
      u.ws.send(JSON.stringify(payload));
    }
  });
}
