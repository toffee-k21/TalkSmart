import { WebSocket } from "ws";

export interface User {
  userId: string;
  ws: WebSocket;
  available: boolean;
  isOnline: boolean;
  role?: string;
}

export let users: User[] = [];

export function addOrUpdateUser(userId: string, ws: WebSocket) {
  let user = users.find(u => u.userId === userId);

  if (user) {
    user.ws = ws;
    user.isOnline = true;
    return user;
  }

  const newUser: User = { userId, ws, available: true, isOnline: true };
  users.push(newUser);

  return newUser;
}

export function getUserById(id: string) {
  return users.find(u => u.userId === id);
}

export function removeUser(ws: WebSocket) {
  users = users.filter(u => u.ws !== ws);
}
