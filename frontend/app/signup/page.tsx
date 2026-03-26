'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Star, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-cyan-500', 'bg-green-500'];

export default function SignUpPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const strength = passwordStrength(form.password);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirm) newErrors.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match';
    if (!agreed) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    router.push('/dashboard');
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Cursor Follower */}
      <div
        className="fixed w-6 h-6 border-2 border-violet-400/50 rounded-full pointer-events-none z-50 transition-transform duration-200"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating Particles */}
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

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.15}px)`,
            animationDelay: '2s',
          }}
        />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-32 pb-32 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          <div
            className={`transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">Join 10,000+ Professionals</span>
              </div>
              <h1 className="text-4xl md:text-4xl font-black mb-3">
                Start Your{' '}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Career Journey
                </span>
              </h1>
              <p className="text-slate-500 text-sm">
                Create your account and find your perfect match
              </p>

              
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className={`w-full bg-white/5 border ${
                        errors.name ? 'border-red-500/70' : 'border-white/10'
                      } rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full bg-white/5 border ${
                        errors.email ? 'border-red-500/70' : 'border-white/10'
                      } rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 characters"
                      className={`w-full bg-white/5 border ${
                        errors.password ? 'border-red-500/70' : 'border-white/10'
                      } rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              level <= strength ? strengthColor[strength] : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Strength:{' '}
                        <span
                          className={`font-medium ${
                            strength <= 1
                              ? 'text-red-400'
                              : strength === 2
                              ? 'text-yellow-400'
                              : strength === 3
                              ? 'text-cyan-400'
                              : 'text-green-400'
                          }`}
                        >
                          {strengthLabel[strength]}
                        </span>
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="Re-enter password"
                      className={`w-full bg-white/5 border ${
                        errors.confirm ? 'border-red-500/70' : form.confirm && form.confirm === form.password ? 'border-green-500/50' : 'border-white/10'
                      } rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:bg-violet-500/5 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {form.confirm && form.confirm === form.password && (
                      <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {errors.confirm && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.confirm}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        agreed
                          ? 'bg-gradient-to-br from-violet-600 to-cyan-600 border-transparent'
                          : 'border-white/20 group-hover:border-violet-500/50'
                      }`}
                    >
                      {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-slate-400">
                      I agree to the{' '}
                      <span className="text-violet-400 hover:text-violet-300 cursor-pointer">Terms of Service</span>{' '}
                      and{' '}
                      <span className="text-violet-400 hover:text-violet-300 cursor-pointer">Privacy Policy</span>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 animate-shimmer"></span>
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative">Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative">Create Free Account</span>
                      <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-500 text-sm">or sign up with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-slate-400 mt-6 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/signin')}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Sign in 
                </button>
              </p>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-6 mt-8 text-slate-500 text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-400/70" /> Free Forever
              </span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-violet-400/70" /> No Credit Card
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