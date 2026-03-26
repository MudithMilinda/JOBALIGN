'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';

export default function NavbarUI() {
    const navItems = [
  { name: "Home", link: "/#home" },
  { name: "Features", link: "/#features" },
  { name: "How It Works", link: "/#how-it-works" },
  { name: "Pricing", link: "/#pricing" },
];

    return (
        <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4 bg-slate-900/80 backdrop-blur-sm transition-all duration-700">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        JOBALIGN
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            className="hover:text-[#6A2EEF] transition p-2"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                {/* Auth Buttons (UI only) */}
                <div className="flex gap-4">

                    <button className="relative px-6 py-2.5 rounded-4xl border border-white/20 bg-white/5 backdrop-blur-md text-white text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:scale-105">
                        Sign in
                    </button>
                </div>
            </div>
        </nav>
    );
}