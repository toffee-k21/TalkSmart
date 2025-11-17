import { v4 as uuid } from "uuid";
import { redis } from "../config/redis";

export async function createRoom(callerId: string, receiverId: string) {
  const roomId = uuid();
  const room = { roomId, callerId, receiverId };

  await redis.hSet("rooms", roomId, JSON.stringify(room));
  return room;
}

export async function getRoom(roomId: string) {
  const data = await redis.hGet("rooms", roomId);
  return data ? JSON.parse(data) : null;
}

export async function getRoomByUser(userId: string) {
  const all = await redis.hGetAll("rooms");

  for (const r of Object.values(all)) {
    const room = JSON.parse(r);
    if (room.callerId === userId || room.receiverId === userId) return room;
  }

  return null;
}

export async function removeRoom(roomId: string) {
  await redis.hDel("rooms", roomId);
}