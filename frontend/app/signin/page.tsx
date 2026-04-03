'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Star, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SignInPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.msg || "Login failed" });
        setIsLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/#home");
    } catch {
      setErrors({ email: "Server error" });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div
        className="fixed w-6 h-6 border-2 border-violet-400/50 rounded-full pointer-events-none z-50 transition-transform duration-200"
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px`, transform: 'translate(-50%, -50%)' }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full animate-float"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${8 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.15}px)`, animationDelay: '2s' }} />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-32 pb-32 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-200">Welcome Back</span>
              </div>
              <h1 className="text-4xl md:text-3xl font-black mb-3">
                Sign In to{' '}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  JOBALIGN
                </span>
              </h1>
              <p className="text-slate-500 text-sm">Continue your journey to the perfect career match</p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/70' : 'border-white/10'} rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />{errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/70' : 'border-white/10'} rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />{errors.password}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <button type="button" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 animate-shimmer" />
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative">Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative">Sign In</span>
                      <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-500 text-sm">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </form>

              <p className="text-center text-slate-400 mt-6 text-sm">
                Don&apos;t have an account?{' '}
                <button onClick={() => router.push('/signup')}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign up
                </button>
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-slate-500 text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-400/70" /> AI-Powered
              </span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-violet-400/70" /> 10K+ Users
              </span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span>🔒 Secure & Private</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}