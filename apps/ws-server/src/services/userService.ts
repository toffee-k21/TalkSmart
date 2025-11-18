import { redis } from "../config/redis";

export async function addOrUpdateUser(userId: string, nodeId: string) {
  await redis.hSet("user:nodes", userId, nodeId);

  await redis.hSet("users", userId, JSON.stringify({
    userId,
    nodeId,
    available: true,
    isOnline: true
  }));
}

export async function getUser(userId: string) {
  const data = await redis.hGet("users", userId);
  return data ? JSON.parse(data) : null;
}

export async function getUserNode(userId: string) {
  return await redis.hGet("user:nodes", userId);
}

export async function setUserOffline(userId: string) {
  console.log("setUserOffline userId: ",userId);
  const usr = await getUser(userId);
  if (!usr) return;

  usr.isOnline = false;
  await redis.hSet("users", userId, JSON.stringify(usr));
  await redis.hDel("user:nodes", userId);
}

export async function getOnlineUsers() {
  const all = await redis.hGetAll("users");
  return Object.values(all)
    .map((u: any) => JSON.parse(u))
    .filter((u) => u.isOnline)
    .map((u) => u.userId);
}
