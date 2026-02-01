'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", link: "#home" },
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Pricing", link: "#pricing" },
  ];

  const getLink = (link: string) => {
    // If we are on home page, use just the hash
    if (pathname === "/") return link;
    // If on another page, prepend '/'
    return `/${link}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4 transition-all duration-700 translate-y-0 bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            JOBALIGN
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={getLink(item.link)}
              className="hover:text-[#6A2EEF] transition p-2"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <SignedOut>
              
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>


            <SignedIn>
              <UserButton />
            </SignedIn>
      </div>
    </nav>
  );
}
