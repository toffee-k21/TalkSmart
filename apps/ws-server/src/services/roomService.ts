import { v4 as uuid } from "uuid";

export interface Room {
  roomId: string;
  participants: string[];
}

export let rooms: Room[] = [];

export function createRoom(participants: string[]) {
  const room = { roomId: uuid(), participants };
  rooms.push(room);
  return room;
}

export function getRoomById(id: string) {
  return rooms.find(r => r.roomId === id);
}

export function getRoomByUser(userId: string) {
  return rooms.find(r => r.participants.includes(userId));
}

export function removeRoom(id: string) {
  rooms = rooms.filter(r => r.roomId !== id);
}
