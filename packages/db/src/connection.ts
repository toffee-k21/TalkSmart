import mongoose from "mongoose";

export const connectDB = async (url: string) => {

    if (mongoose.connection.readyState >= 1) {
        console.log("⚠️  MongoDB already connected");
        return;
    }

    try {
        await mongoose.connect(url);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
};