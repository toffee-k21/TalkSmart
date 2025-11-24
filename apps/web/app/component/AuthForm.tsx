'use client'
import { backend_url } from "../utils.json";
import { useRouter } from 'next/navigation';
import { useState } from "react";

import { motion } from "framer-motion";

export default function AuthForm() {
    // const [isLogin, setIsLogin] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        // confirmPassword: ''
    });
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let res;
        if (!isSignUp) {
            res = await fetch(`${backend_url}/auth/signin/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
        }
        else {
            res = await fetch(`${backend_url}/auth/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });
        }
        const token = await res.json();
        document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;
        router.push("/");
        // console.log('Form submitted:', formData);
    };

    // const [, setLocation] = useLocation();
  
    // const [formData, setFormData] = useState({
    //     email: "",
    //     password: "",
    //     name: ""
    // });


    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     // Simulate authentication
    //     setTimeout(() => {
    //         setLocation("/home");
    //     }, 800);
    // };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 relative overflow-hidden">
            {/* Subtle geometric accents */}
            <div className="absolute top-[10%] right-[15%] w-24 h-24 border-t border-r border-[#E6E6E6] opacity-40" />
            <div className="absolute bottom-[15%] left-[12%] w-32 h-32 border-b border-l border-[#E6E6E6] opacity-40" />

            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Floating card */}
                <div className="bg-white border border-[#E6E6E6] p-12 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <motion.h1
                            className="text-[2.5rem] font-[200px] tracking-[-0.02em] mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {isSignUp ? "Join PRAXIS" : "Welcome Back"}
                        </motion.h1>
                        <motion.p
                            className="text-[0.9375rem] font-[200px] text-[#6B6B6B]"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {isSignUp ? "Start practicing today" : "Continue your journey"}
                        </motion.p>
                    </div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {isSignUp && (
                            <div className="space-y-2">
                                <label className="block text-[0.8125rem] font-[300px] text-[#6B6B6B] tracking-[0.01em] uppercase">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-transparent border-0 border-b border-[#E6E6E6] px-0 py-3 focus:outline-none focus:border-black transition-colors duration-500 text-[0.9375rem] font-[200px]"
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[0.8125rem] font-[300px] text-[#6B6B6B] tracking-[0.01em] uppercase">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-transparent border-0 border-b border-[#E6E6E6] px-0 py-3 focus:outline-none focus:border-black transition-colors duration-500 text-[0.9375rem] font-[200px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[0.8125rem] font-[300px] text-[#6B6B6B] tracking-[0.01em] uppercase">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-transparent border-0 border-b border-[#E6E6E6] px-0 py-3 focus:outline-none focus:border-black transition-colors duration-500 text-[0.9375rem] font-[200px]"
                                required
                            />
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                className="w-full border border-black py-4 text-[0.875rem] font-[300px] tracking-[0.08em] uppercase hover:bg-black hover:text-white transition-all duration-700 cursor-pointer"
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                            </button>
                        </div>
                    </motion.form>

                    {/* Toggle */}
                    <motion.div
                        className="mt-10 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[0.875rem] font-[200px] text-[#6B6B6B] border-b border-transparent hover:border-[#6B6B6B] pb-0.5 transition-all duration-500 cursor-pointer"
                        >
                            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                        </button>
                    </motion.div>
                </div>

                {/* Back to home */}
                <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <a
                        href="/"
                        className="text-[0.875rem] font-[200px] text-[#6B6B6B] hover:text-black transition-colors duration-500"
                    >
                        ← Back to home
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
