import { v4 as uuid } from "uuid";
import { redis } from "../config/redis";

export async function createRoom(callerId: string, receiverId: string) {
  const roomId = uuid();
  const room = { roomId, callerId, receiverId };

  await redis.set(`receiver-to-room:${receiverId}`, roomId);
  await redis.set(`caller-to-room:${callerId}`, roomId);

  await redis.set(`room:${roomId}`, JSON.stringify(room));
  return room;
}

export async function getRoom(roomId: string) {
  const data = await redis.get(`room:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function getRoomByUser(userId: string) {
  const keys = await redis.keys("room:*");

  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    const room = JSON.parse(data);

    if (room.callerId === userId || room.receiverId === userId) {
      return room;
    }
  }

  return null;
}

export async function removeRoom(roomId: string) {
  await redis.expire(`room:${roomId}`, 60);
}

export async function removeCallerAndReceiverToRoom( receiverId:string, callerId:string){
  await redis.expire(`receiver-to-room:${receiverId}`, 60);
  await redis.expire(`caller-to-room:${callerId}`, 60);
}

export async function findRoomWhereUserIsReceiver(receiverId:any) {
  const roomId = await redis.get(`receiver-to-room:${receiverId}`);
  if (!roomId) return null;

  const roomData = await redis.get(`room:${roomId}`);
  return roomData ? JSON.parse(roomData) : null;
}
