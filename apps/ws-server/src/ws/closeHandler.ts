import { localConnections } from "./local";
import { getUserNode, removeUser } from "../services/userService";
import { removeRoom, getRoomByUser, removeCallerAndReceiverToRoom } from "../services/roomService";
import { pub, redis } from "../config/redis";

export async function handleClose(userId: string) {
  // Remove from local WS map
  localConnections.delete(userId);
  
  // Update status in Redis
  await removeUser(userId);
  
  // Check if user is inside any room
  const room = await getRoomByUser(userId);
  if (!room) return;
  
  const { callerId, receiverId, roomId } = room;

  // Find the other user
  const otherUserId = userId === callerId ? receiverId : callerId;
  
  //check that otherUser is live or not , if not live set ttl for room , else keep room intact
  let node = await getUserNode(otherUserId);
  
  if(node) return;
  
  await removeRoom(roomId);
  await removeCallerAndReceiverToRoom(receiverId, callerId);
  
  // Find where the other user is connected
  // const otherNode = await redis.hGet("user:nodes", otherUserId);

  // if (otherNode) {
  //   // Notify the other user
  //   await pub.publish(`signal:${otherNode}`, JSON.stringify({
  //     type: "peer-disconnected",
  //     from: userId,
  //     to: otherUserId
  //   }));
  // }

  // Clean up room from Redis
}
