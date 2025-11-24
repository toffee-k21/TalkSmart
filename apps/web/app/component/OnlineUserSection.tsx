import { motion } from 'framer-motion'
import React from 'react'
import UserTile from './UserTitle';
import { useSocket } from '../context/SocketContext';
import { useUsers } from '../context/UserContext';

const OnlineUserSection = () => {
    const {socket, isConnected}: any = useSocket();
        const {users, onlineUsers} = useUsers();
        console.log(users, onlineUsers);
    const handleSendRequest = (receiverId: string) => {
        socket?.send(JSON.stringify({ type: "request-call", receiverId }));
    }
  return (
    <div>
          <motion.section
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
              <div className="border-t border-[#E6E6E6] pt-8 pb-12">
                  <h2 className="text-[1.5rem] font-[200] tracking-[-0.02em] mb-2">
                      Available Now
                  </h2>
                  <p className="text-[0.9375rem] font-[200] text-[#6B6B6B]">
                      Connect instantly with online users
                  </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {users.filter((u:any) => onlineUsers.includes(u._id)).map((user:any, index:any) => (
                      <motion.div
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                          <UserTile
                              user={user}
                              onRequest={handleSendRequest}
                              variant="grid"
                          />
                      </motion.div>
                  ))}
              </div>
          </motion.section>
    </div>
  )
}

export default OnlineUserSection