import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

export function authenticateUser(url: string) {
  try {
    const query = new URLSearchParams(url.split("?")[1]);
    const token = query.get("token");

    if (!token) return null;

    const payload: any = jwt.verify(token, JWT_SECRET);
    return payload?.id || null;
  } catch (err) {
    console.log("Auth Error:", err);
    return null;
  }
}
