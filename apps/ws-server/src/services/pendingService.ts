export interface PendingMessage {
  type: string;
  sdp?: any;
  candidate?: any;
  from: string;
}

export let pending: Record<string, PendingMessage[]> = {};

export function storePending(userId: string, msg: PendingMessage) {
  if (!pending[userId]) pending[userId] = [];
  pending[userId].push(msg);
}

export function deliverPending(userId: string, ws: any) {
  if (!pending[userId]) return;

  pending[userId].forEach(m => ws.send(JSON.stringify(m)));
  delete pending[userId];
}
