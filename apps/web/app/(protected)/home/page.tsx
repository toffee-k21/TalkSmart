"use client"
// import { useState } from "react";
// import { useLocation } from "wouter";
// import { NotificationItem } from "./NotificationItem";
// import { motion } from "framer-motion";
import NotificationSection from "../../component/NotificationSection";
// import UserTile from "../../component/UserTitle";
import Header from "../../component/Header";
import AllUserSection from "../../component/AllUserSection";
import OnlineUserSection from "../../component/OnlineUserSection";

export default function HomePage() {
    // const [, setLocation] = useLocation();
    // const [notifications, setNotifications] = useState(mockNotifications);

    // const handleIgnore = (notificationId: string) => {
    //     setNotifications(notifications.filter(n => n.id !== notificationId));
    // };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <Header variant="app" />

            <div className="pt-32 pb-20 px-8 lg:px-16">
                <div className="max-w-[1600px] mx-auto">
                    {/* Two-column editorial layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-20">
                        {/* Main Content Column */}
                        <div>
                            <OnlineUserSection />
                            <AllUserSection />
                        </div>
                        <NotificationSection />
                    </div>
                </div>
            </div>
        </div>
    );
}
