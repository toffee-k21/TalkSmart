import { redis } from "../config/redis";

export async function addOrUpdateUser(userId: string, nodeId: string) {
  await redis.hSet("user:nodes", userId, nodeId);
}

export async function getUserNode(userId: string) {
  return await redis.hGet("user:nodes", userId);
}

export async function removeUser(userId: string) {
  await redis.hDel("user:nodes", userId);
}

export async function getOnlineUsers() {
  const onlineUsers = await redis.hKeys("user:nodes");
  return onlineUsers;
}
