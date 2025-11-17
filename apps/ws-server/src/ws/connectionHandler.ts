import { authenticateUser } from "../config/auth";
import { addOrUpdateUser, users } from "../services/userService";
import { deliverPending } from "../services/pendingService";
import { broadcastUserStatus } from "../utils/broadcast";
import { handleMessage } from "./messageHandler";
import { handleClose } from "./closeHandler";

export function handleConnection(ws: any, req: any) {
  const userId = authenticateUser(req.url);
  if (!userId) return ws.close();

  addOrUpdateUser(userId, ws);

  ws.send(
    JSON.stringify({
      type: "online-users",
      users: users.filter(u => u.isOnline).map(u => u.userId)
    })
  );

  broadcastUserStatus(userId, true);

  deliverPending(userId, ws);

  ws.on("message", (msg: any) => {
    const parsed = JSON.parse(msg.toString());
    handleMessage(ws, userId, parsed);
  });

  ws.on("close", () => handleClose(ws, userId));
}
