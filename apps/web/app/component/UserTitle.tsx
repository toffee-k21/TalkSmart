import { motion } from "framer-motion";
import { useUsers } from "../context/UserContext";

interface UserTileProps {
    user: {
        _id: string;
        username: string;
        bio: string;
        isOnline: boolean;
    };
    onRequest: (userId: string) => void;
    variant?: "grid" | "list";
}

export default function UserTile({ user, onRequest, variant = "grid" }: UserTileProps) {
    const {onlineUsers} = useUsers();
    if (variant === "list") {
        return (
            <motion.div
                className="group py-6 border-b border-[#E6E6E6] flex items-center justify-between hover:bg-[#FAFAFA] transition-colors duration-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="flex items-center gap-4">
                    {onlineUsers.includes(user._id) && (
                        <div className="w-2 h-2 bg-[#00D26B] flex-shrink-0" />
                    )}
                    <div>
                        <h4 className="text-[0.9375rem] font-[300] tracking-[-0.005em] mb-1">
                            {user.username}
                        </h4>
                        <p className="text-[0.8125rem] font-[200] text-[#6B6B6B]">
                            {user.bio}
                        </p>
                    </div>
                </div>
                {onlineUsers.includes(user._id) ? <button
                    onClick={() => onRequest(user._id)}
                    className="text-[0.8125rem] font-[300] text-black opacity-0 group-hover:opacity-100 border-b border-black pb-0.5 transition-all duration-500"
                >
                    Request Call
                </button> : <></>}
            </motion.div>
        );
    }

    return (
        <motion.div
            className="group bg-white border border-[#E6E6E6] p-8 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h4 className="text-[1rem] font-[300] tracking-[-0.005em] mb-2">
                        {user.username}
                    </h4>
                    <p className="text-[0.875rem] font-[200] text-[#6B6B6B]">
                        {user.bio}
                    </p>
                </div>
                {user.isOnline && (
                    <div className="w-2 h-2 bg-[#00D26B] flex-shrink-0 mt-1" />
                )}
            </div>
            <button
                onClick={() => onRequest(user._id)}
                className="text-[0.8125rem] font-[300] text-black border-b border-black pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            >
                Request Call
            </button>
        </motion.div>
    );
}
