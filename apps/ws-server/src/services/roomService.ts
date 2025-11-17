import { v4 as uuid } from "uuid";
import { redis } from "../config/redis";

export async function createRoom(participants: string[]) {
  const roomId = uuid();
  await redis.hSet("rooms", roomId, JSON.stringify({ roomId, participants }));
  return { roomId, participants };
}

export async function getRoom(roomId: string) {
  const data = await redis.hGet("rooms", roomId);
  return data ? JSON.parse(data) : null;
}

export async function getRoomByUser(userId: string) {
  const all = await redis.hGetAll("rooms");
  for (let r of Object.values(all)) {
    const room = JSON.parse(r);
    if (room.participants.includes(userId)) return room;
  }
  return null;
}

export async function removeRoom(roomId: string) {
  await redis.hDel("rooms", roomId);
}
