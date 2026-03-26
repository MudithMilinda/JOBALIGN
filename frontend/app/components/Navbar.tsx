'use client';

import React, { useEffect, useState, useRef } from "react";
import { Star, LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NavbarUI() {
    const router = useRouter();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { name: "Home", link: "/#home" },
        { name: "Features", link: "/#features" },
        { name: "How It Works", link: "/#how-it-works" },
        { name: "Pricing", link: "/#pricing" },
    ];

    // ✅ Check login status
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setDropdownOpen(false);
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
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
                            className="hover:text-violet-400 transition p-2"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                {/* Auth Section */}
                <div className="flex items-center gap-4">

                    {!isLoggedIn ? (
                        // 🔴 NOT LOGGED IN
                        <button
                            onClick={() => router.push('/signin')}
                            className="px-6 py-2.5 rounded-full border border-white/20 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:scale-105 transition-all"
                        >
                            Sign in
                        </button>
                    ) : (
                        // 🟢 LOGGED IN — Profile Dropdown
                        <div className="relative" ref={dropdownRef}>

                            {/* Profile Button */}
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10 transition-all group"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>

                                {/* Name (visible on md+) */}
                                <span className="hidden md:block text-sm text-white/80 font-medium group-hover:text-white transition max-w-[120px] truncate">
                                    {user?.name}
                                </span>

                                {/* Chevron */}
                                <ChevronDown
                                    className={`w-4 h-4 text-white/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-800/90 backdrop-blur-md shadow-xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                                                <p className="text-white/40 text-xs truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Link */}
                                    <button
                                        onClick={() => { router.push('/profile'); setDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <User className="w-4 h-4" />
                                        My Profile
                                    </button>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>

                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </nav>
    );
}