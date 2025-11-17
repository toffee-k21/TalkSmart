import { redis } from "../config/redis";

export async function storePending(userId: string, message: any) {
  await redis.rPush(`pending:${userId}`, JSON.stringify(message));
}

export async function deliverPending(userId: string, ws: any) {
  const msgs = await redis.lRange(`pending:${userId}`, 0, -1);

  msgs.forEach((m) => ws.send(m));

  if (msgs.length) await redis.del(`pending:${userId}`);
}
