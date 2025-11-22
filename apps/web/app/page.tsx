"use client"
import Link from "next/link"
import { Header } from "./component/Header";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden">
      <Header variant="landing" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-8 lg:px-16 pt-20">
        {/* Geometric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating lines */}
          <svg className="absolute w-full h-full opacity-[0.15]" style={{ filter: 'blur(0.5px)' }}>
            <line
              x1="10%"
              y1="20%"
              x2="40%"
              y2="60%"
              stroke="#000000"
              strokeWidth="0.5"
              className="animate-float-line"
              style={{ animationDelay: '0s' }}
            />
            <line
              x1="60%"
              y1="10%"
              x2="90%"
              y2="50%"
              stroke="#000000"
              strokeWidth="0.5"
              className="animate-float-line"
              style={{ animationDelay: '2s' }}
            />
            <line
              x1="80%"
              y1="70%"
              x2="50%"
              y2="90%"
              stroke="#000000"
              strokeWidth="0.5"
              className="animate-float-line"
              style={{ animationDelay: '4s' }}
            />
            <line
              x1="20%"
              y1="80%"
              x2="30%"
              y2="30%"
              stroke="#000000"
              strokeWidth="0.5"
              className="animate-float-line"
              style={{ animationDelay: '1s' }}
            />
          </svg>

          {/* Partial border accents */}
          <div
            className="absolute top-[15%] left-[10%] w-32 h-32 border-t border-l border-[#E6E6E6]"
            style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}
          />
          <div
            className="absolute bottom-[20%] right-[15%] w-40 h-40 border-b border-r border-[#E6E6E6]"
            style={{ transform: `translate(${-mousePosition.x * 0.008}px, ${-mousePosition.y * 0.008}px)` }}
          />
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
          }}
        >
          <motion.h1
            className="text-[4rem] sm:text-[5rem] lg:text-[6.5rem] font-[200] tracking-[-0.04em] leading-[0.95] mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Sharpen Your<br />Interview Skills.
          </motion.h1>

          <motion.p
            className="text-[1.125rem] font-[200] text-[#6B6B6B] max-w-2xl mx-auto mb-16 leading-relaxed tracking-[-0.01em]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Connect with peers for realistic mock interviews. Practice, improve, and land your dream role with confidence.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/auth">
              <div className="text-[0.9375rem] font-[300] tracking-[0.03em] text-black border-b border-black pb-1 hover:opacity-50 transition-opacity duration-700">
                Start Practicing
              </div>
            </Link>
            <Link href="#how-it-works">
              <div className="text-[0.9375rem] font-[200] tracking-[0.03em] text-[#6B6B6B] hover:text-black transition-colors duration-700">
                Learn More
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom accent */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#E6E6E6] to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-[#E6E6E6] pt-16 mb-20">
            <h2 className="text-[2rem] font-[200] tracking-[-0.02em] mb-4">
              Peer-to-Peer Excellence
            </h2>
            <p className="text-[1rem] font-[200] text-[#6B6B6B] max-w-2xl">
              Real interviews with real people. No bots, no scripts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              {
                title: "Live Connections",
                description: "Video calls with professionals preparing for similar roles"
              },
              {
                title: "Mutual Growth",
                description: "Take turns interviewing each other and provide feedback"
              },
              {
                title: "Flexible Scheduling",
                description: "Connect instantly or schedule sessions at your convenience"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="border-t border-[#E6E6E6] pt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-[1.125rem] font-[300] tracking-[-0.01em] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[0.9375rem] font-[200] text-[#6B6B6B] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-8 lg:px-16 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-b border-[#E6E6E6] py-16 mb-20">
            <h2 className="text-[2rem] font-[200] tracking-[-0.02em]">
              Three Simple Steps
            </h2>
          </div>

          <div className="space-y-24">
            {[
              {
                number: "01",
                title: "Join the Platform",
                description: "Create your profile and set your interview preferences"
              },
              {
                number: "02",
                title: "Connect with Peers",
                description: "Browse available users and send interview requests"
              },
              {
                number: "03",
                title: "Practice & Improve",
                description: "Conduct mock interviews and exchange valuable feedback"
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-12 border-l border-[#E6E6E6] pl-12"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-[3rem] font-[200] text-[#E6E6E6] tracking-[-0.03em] leading-none">
                  {step.number}
                </span>
                <div className="flex-1 pt-2">
                  <h3 className="text-[1.5rem] font-[300] tracking-[-0.01em] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[1rem] font-[200] text-[#6B6B6B] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[3rem] font-[200] tracking-[-0.03em] leading-tight mb-8">
              Ready to Begin?
            </h2>
            <Link href="/auth">
              <div className="inline-block text-[1rem] font-[300] tracking-[0.03em] text-black border-b border-black pb-1 hover:opacity-50 transition-opacity duration-700">
                Create Your Account
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E6E6E6] py-12 px-8 lg:px-16 bg-[#FAFAFA]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[0.8125rem] font-[200] text-[#6B6B6B] tracking-[0.02em]">
            © 2025 Ascend. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[0.8125rem] font-[200] text-[#6B6B6B] hover:text-black transition-colors duration-500">
              Privacy
            </a>
            <a href="#" className="text-[0.8125rem] font-[200] text-[#6B6B6B] hover:text-black transition-colors duration-500">
              Terms
            </a>
            <a href="#" className="text-[0.8125rem] font-[200] text-[#6B6B6B] hover:text-black transition-colors duration-500">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
