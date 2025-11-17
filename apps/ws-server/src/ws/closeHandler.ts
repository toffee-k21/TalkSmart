import { getUserById, removeUser } from "../services/userService";
import { getRoomByUser, removeRoom } from "../services/roomService";
import { broadcastUserStatus } from "../utils/broadcast";

export function handleClose(ws: any, userId: string) {
  const user = getUserById(userId);
  if (!user) return;

  user.isOnline = false;
  broadcastUserStatus(userId, false);

  removeUser(ws);

  const room = getRoomByUser(userId);
  if (!room) return;

  const otherId = room.participants.find(p => p !== userId);
  const otherUser = getUserById(otherId!);

  if (otherUser) otherUser.ws.send(JSON.stringify({ type: "peer-disconnected" }));

  removeRoom(room.roomId);
}
