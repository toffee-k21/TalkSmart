import React, { useEffect, useRef, useState } from "react";

/**
 * This component creates a simple WebRTC video calling app between two peers
 * using WebSockets as a signaling server.
 */
const App = ({ role }: any) => {
    // Role of the user: either "sender" or "receiver"
    // const [role, setRole] = useState<"sender" | "receiver" | null>(null);

    // Indicates if the connection setup (signaling) is done
    const [connected, setConnected] = useState(false);

    // References to local (self) and remote (peer) video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Reference to the WebSocket connection
    const wsRef = useRef<WebSocket | null>(null);

    // Reference to the RTCPeerConnection (core WebRTC object)
    const peerRef = useRef<RTCPeerConnection | null>(null);

    /**
     * Function to start the WebRTC and signaling process.
     * Runs when user clicks "Join as Sender" or "Join as Receiver".
     */
    const startConnection = async (selectedRole: "sender" | "receiver") => {
        // setRole(selectedRole);

        // Connect to the signaling server (backend WebSocket)
        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws;

        // Once the WebSocket connects
        ws.onopen = () => {
            console.log("Connected to signaling server");

            // Tell the server our role — either sender or receiver
            ws.send(JSON.stringify({ type: selectedRole }));
        };

        // Handle incoming WebSocket messages (signaling data)
        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log("Received:", message);

            // Handle messages based on type
            switch (message.type) {
                // When receiver gets offer from sender
                case "createOffer":
                    await handleReceiveOffer(message.sdp);
                    break;

                // When sender gets answer from receiver
                case "createAnswer":
                    await handleReceiveAnswer(message.sdp);
                    break;

                // When either side receives ICE candidate from the other peer
                case "iceCandidate":
                    if (message.candidate) {
                        await peerRef.current?.addIceCandidate(message.candidate);
                    }
                    break;
            }
        };

        // Create a new peer connection (core WebRTC connection)
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, // Use Google STUN server to discover public IPs
            ],
        });
        peerRef.current = peer;

        /**
         * When ICE candidates (network paths) are found,
         * send them to the other peer via signaling server.
         */
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                ws.send(
                    JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
                );
            }
        };

        /**
         * When remote peer adds a media track,
         * set it as the `srcObject` of the remote video.
         */
        peer.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]!;
            }
        };

        /**
         * Request access to webcam and microphone.
         * This returns a MediaStream with video + audio tracks.
         */
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        // Display your own camera feed in the local video element
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // Add all tracks (audio + video) to the peer connection
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        /**
         * If user is the sender:
         * - Create an SDP offer describing how we want to connect.
         * - Set it as our local description.
         * - Send it to the receiver via the signaling server.
         */
        if (selectedRole === "sender") {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "createOffer", sdp: offer }));
        }

        // Mark as connected in UI
        setConnected(true);
    };

    /**
     * Handle the offer SDP from sender (when we're receiver):
     * - Set it as remote description.
     * - Create an answer SDP in response.
     * - Send the answer back to sender via signaling.
     */
    const handleReceiveOffer = async (sdp: any) => {
        const peer = peerRef.current!;
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        wsRef.current?.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
    };

    /**
     * Handle the answer SDP from receiver (when we're sender):
     * - Set it as remote description so peer connection completes.
     */
    const handleReceiveAnswer = async (sdp: any) => {
        const peer = peerRef.current!;
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    /**
     * UI section
     */
    return (
        <div className="flex flex-col items-center p-4 space-y-4">
            {/* Show role selection buttons before connecting */}
            {!connected ? (
                <div className="space-x-4">
                    <button
                        onClick={() => startConnection(role)}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Start Meeting
                    </button>
                </div>
            ) : (
                // Once connected, show the user’s role
                <p className="text-gray-700">Connected as {role}</p>
            )}

            {/* Display local and remote video side-by-side */}
            <div className="grid grid-cols-2 gap-4">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-64 h-48 bg-black"
                />
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-64 h-48 bg-black"
                />
            </div>
        </div>
    );
};

export default App;
