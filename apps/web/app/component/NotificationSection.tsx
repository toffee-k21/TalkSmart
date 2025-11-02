import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useRouter } from 'next/navigation'

const NotificationSection = () => {
    const { socket, isConnected }: any = useSocket()
    const [callBy, setCallBy] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!isConnected || !socket) return

        // Define handler
        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data)
            console.log("Received:", message)

            if (message.type === "request-call") {
                alert("A request for call arrived!")
                setCallBy(message.details)
            }
            if (message.type === "join-room") {
                const roomId = message.details
                router.push(`room/${roomId}/?role=${message.role}`)
            }
        }

        // Attach listener
        socket.addEventListener("message", handleMessage)

        // Cleanup listener when component unmounts
        return () => {
            socket.removeEventListener("message", handleMessage)
        }
    }, [socket, isConnected, router])

    const handleAcceptRequest = (callBy: string) => {
        if (!socket) return
        socket.send(JSON.stringify({ type: "accept-request", participants: [callBy] }))
    }

    if (!isConnected) return null

    return (
        <div>
            {callBy ? (
                <div>
                    {callBy} - <button onClick={() => handleAcceptRequest(callBy)}>Accept</button>
                </div>
            ) : (
                <div>No notification</div>
            )}
        </div>
    )
}

export default NotificationSection
