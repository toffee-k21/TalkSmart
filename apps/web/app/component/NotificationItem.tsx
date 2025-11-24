import { motion } from "framer-motion";

interface NotificationItemProps {
    notification: {
        id: string;
        fromUserDetails: any;
        // from: string;
        // message: string;
        // timestamp: string;
    };
    onAccept: (id: string) => void;
    // onIgnore: (id: string) => void;
}

export default function NotificationItem({ notification, onAccept }: NotificationItemProps) {
    console.log("notif", notification);
    return (
        <motion.div
            className="py-6 border-b border-[#E6E6E6] last:border-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="mb-4">
                <p className="text-[0.9375rem] font-[300] tracking-[-0.005em] mb-2">
                    {notification.fromUserDetails.username}
                </p>
                {/* <p className="text-[0.875rem] font-[200] text-[#6B6B6B] leading-relaxed mb-2">
                    {notification.message}
                </p> */}
                {/* <p className="text-[0.75rem] font-[200] text-[#9B9B9B] tracking-[0.01em]">
                    {notification.timestamp}
                </p> */}
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onAccept(notification.id)}
                    className="px-8 py-2 bg-black text-white text-[0.8125rem] font-[300] tracking-[0.05em] uppercase hover:opacity-80 transition-opacity duration-500"
                >
                    Accept
                </button>
                {/* <button
                    onClick={() => onIgnore(notification.id)}
                    className="text-[0.8125rem] font-[200] text-[#6B6B6B] border-b border-transparent hover:border-[#6B6B6B] pb-0.5 transition-all duration-500"
                >
                    Ignore
                </button> */}
            </div>
        </motion.div>
    );
}
