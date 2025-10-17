import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    if (message.type === 'sender') senderSocket = ws;
    else if (message.type === 'receiver') receiverSocket = ws;
    else if (message.type === 'createOffer' && ws === senderSocket)
      receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    else if (message.type === 'createAnswer' && ws === receiverSocket)
      senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    else if (message.type === 'iceCandidate') {
      const target = ws === senderSocket ? receiverSocket : senderSocket;
      target?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
    }
  });
});