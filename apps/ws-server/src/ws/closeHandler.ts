import { localConnections } from "./local";
import { setUserOffline } from "../services/userService";
import { removeRoom, getRoomByUser } from "../services/roomService";
import { pub, redis } from "../config/redis";

export async function handleClose(userId: string) {
  localConnections.delete(userId);
  await setUserOffline(userId);

  const room = await getRoomByUser(userId);

  if (room) {
    for (const pid of room.participants) {
      if (pid !== userId) {
        const node = await redis.hGet("user:nodes", pid);
        pub.publish(`signal:${node}`, JSON.stringify({
          type: "peer-disconnected",
          from: userId
        }));
      }
    }
    await removeRoom(room.roomId);
  }
}
