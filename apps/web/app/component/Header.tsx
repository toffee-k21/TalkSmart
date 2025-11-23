"use client"
import Link from "next/link";

interface HeaderProps {
    variant?: "landing" | "app";
}

export default function Header({ variant = "landing" }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-[#E6E6E6] border-opacity-50">
            <div className="max-w-[1600px] mx-auto px-8 lg:px-16 h-20 flex items-center justify-between">
                <Link href="/">
                    <div className="text-[0.9375rem] tracking-[0.25em] uppercase font-[200] hover:opacity-60 transition-opacity duration-500">
                        PRAXIS
                    </div>
                </Link>

                {variant === "landing" ? (
                    <nav className="hidden md:flex items-center gap-12">
                        <Link href="#features">
                            <div className="text-[0.875rem] font-[200] tracking-[0.02em] text-[#6B6B6B] hover:text-black transition-colors duration-500">
                                Features
                            </div>
                        </Link>
                        <Link href="#how-it-works">
                            <div className="text-[0.875rem] font-[200] tracking-[0.02em] text-[#6B6B6B] hover:text-black transition-colors duration-500">
                                How It Works
                            </div>
                        </Link>
                        <Link href="/auth">
                            <div className="text-[0.875rem] font-[300] tracking-[0.02em] text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity duration-500">
                                Get Started
                            </div>
                        </Link>
                    </nav>
                ) : (
                    <nav className="flex items-center gap-8">
                        <Link href="/home">
                            <div className="text-[0.875rem] font-[200] tracking-[0.02em] text-[#6B6B6B] hover:text-black transition-colors duration-500">
                                Home
                            </div>
                        </Link>
                        <button className="text-[0.875rem] font-[200] tracking-[0.02em] text-[#6B6B6B] hover:text-black transition-colors duration-500">
                            Sign Out
                        </button>
                    </nav>
                )}
            </div>
        </header>
    );
}
