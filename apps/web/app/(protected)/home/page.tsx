"use client"
import { useState } from "react";
// import { useLocation } from "wouter";
// import { NotificationItem } from "./NotificationItem";
import { motion } from "framer-motion";
import NotificationSection from "../../component/NotificationSection";
import UserTile from "../../component/UserTitle";
import Header from "../../component/Header";


const mockOnlineUsers = [
    { id: "1", name: "Alex Chen", role: "Software Engineer • Meta", isOnline: true },
    { id: "2", name: "Sarah Kim", role: "Product Manager • Google", isOnline: true },
    { id: "3", name: "James Wilson", role: "Data Scientist • Amazon", isOnline: true },
    { id: "4", name: "Maya Patel", role: "UX Designer • Apple", isOnline: true }
];

const mockAllUsers = [
    { id: "5", name: "David Martinez", role: "Frontend Developer • Netflix", isOnline: false },
    { id: "6", name: "Emma Thompson", role: "Backend Engineer • Stripe", isOnline: false },
    { id: "7", name: "Lucas Brown", role: "ML Engineer • OpenAI", isOnline: false },
    { id: "8", name: "Olivia Davis", role: "DevOps Engineer • GitHub", isOnline: false },
    { id: "9", name: "Noah Johnson", role: "Security Engineer • Microsoft", isOnline: false },
    { id: "10", name: "Sophia Lee", role: "Full Stack Developer • Airbnb", isOnline: false }
];

const mockNotifications = [
    {
        id: "n1",
        from: "Michael Zhang",
        message: "would like to practice system design interviews with you",
        timestamp: "2 minutes ago"
    },
    {
        id: "n2",
        from: "Emily Rodriguez",
        message: "is interested in a behavioral interview session",
        timestamp: "15 minutes ago"
    }
];

export default function HomePage() {
    // const [, setLocation] = useLocation();
    const [notifications, setNotifications] = useState(mockNotifications);

    const handleRequest = (userId: string) => {
        console.log("Request sent to:", userId);
        // In a real app, this would trigger an API call
    };

    const handleAccept = (notificationId: string) => {
        // Simulate joining video call
        // setLocation("/call/demo-room");
    };

    const handleIgnore = (notificationId: string) => {
        setNotifications(notifications.filter(n => n.id !== notificationId));
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <Header variant="app" />

            <div className="pt-32 pb-20 px-8 lg:px-16">
                <div className="max-w-[1600px] mx-auto">
                    {/* Two-column editorial layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-20">
                        {/* Main Content Column */}
                        <div>
                            {/* Online Users Section */}
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
                                    {mockOnlineUsers.map((user, index) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <UserTile
                                                user={user}
                                                onRequest={handleRequest}
                                                variant="grid"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* All Users Section */}
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
                                    {mockAllUsers.map((user, index) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="px-8">
                                                <UserTile
                                                    user={user}
                                                    onRequest={handleRequest}
                                                    variant="list"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                            {/* <UserSection /> */}
                        </div>

                        {/* Notifications Sidebar */}
                        <NotificationSection />
                    </div>
                </div>
            </div>
        </div>
    );
}
