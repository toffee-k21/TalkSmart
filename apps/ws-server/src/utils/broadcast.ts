import { redis } from "../config/redis";

export async function broadcastUserStatus(userId: string, isOnline: boolean) {
  const msg = JSON.stringify({
    type: "user-status",
    userId,
    isOnline
  });

  // broadcast across all instances
  await redis.publish("global:broadcast", msg);
}
