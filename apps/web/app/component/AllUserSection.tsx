import { motion } from 'framer-motion'
import React from 'react'
import UserTile from './UserTitle'
import { useSocket } from '../context/SocketContext';
import { useUsers } from '../context/UserContext';

const AllUserSection = () => {
    const {socket, isConnected}: any = useSocket();
    const {users, onlineUsers} = useUsers();
    const handleSendRequest = (receiverId: string) => {
        socket?.send(JSON.stringify({ type: "request-call", receiverId }));
    }
  return (
    <div>
          <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
              <div className="border-t border-[#E6E6E6] pt-8 pb-12">
                  <h2 className="text-[1.5rem] font-[200] tracking-[-0.02em] mb-2">
                      All Users
                  </h2>
                  <p className="text-[0.9375rem] font-[200] text-[#6B6B6B]">
                      Browse and send requests
                  </p>
              </div>

              <div className="bg-white border border-[#E6E6E6] divide-y divide-[#E6E6E6]">
                  {users.map((user:any , index:any) => (
                      <motion.div
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      >
                          <div className="px-8">
                              <UserTile
                                  user={user}
                                  onRequest={handleSendRequest}
                                  variant="list"
                              />
                          </div>
                      </motion.div>
                  ))}
              </div>
          </motion.section>
    </div>
  )
}

export default AllUserSection