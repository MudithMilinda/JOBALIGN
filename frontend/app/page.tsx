'use client';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Users,
  BarChart3,
  FileText,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumePlatformUI() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [featuresInView, setFeaturesInView] = useState(false);
  const [stepsInView, setStepsInView] = useState(false);

  // ✅ Live stats state
  const [userCount, setUserCount] = useState<string>('...');
  const [jobsCount, setJobsCount] = useState<string>('...');

  const featuresRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);

  // ✅ Format number: 1500 → "1K+", 50000 → "50K+", 999 → "999+"
  const formatCount = (count: number): string => {
    if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
    return `${count}+`;
  };

  // ✅ Fetch both stats in parallel
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, jobsRes] = await Promise.all([
          fetch('http://localhost:5000/api/stats/user-count'),
          fetch('http://localhost:5000/api/stats/jobs-analyzed'),
        ]);

        const usersData = await usersRes.json();
        const jobsData = await jobsRes.json();

        setUserCount(formatCount(usersData.count));
        setJobsCount(formatCount(jobsData.count));
      } catch (err) {
        // Fallback values if API fails
        setUserCount('10K+');
        setJobsCount('50K+');
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setMousePosition({ x: e.clientX, y: e.clientY });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === featuresRef.current && entry.isIntersecting) setFeaturesInView(true);
          if (entry.target === stepsRef.current && entry.isIntersecting) setStepsInView(true);
        });
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (stepsRef.current) observer.observe(stepsRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  // ✅ Both stats are now dynamic
  const stats = [
    { value: '95%',      label: 'Match Accuracy', icon: Target   },
    { value: userCount,  label: 'Active Users',   icon: Users    },
    { value: jobsCount,  label: 'Jobs Analyzed',  icon: BarChart3 },
    { value: '3x',       label: 'Faster Hiring',  icon: TrendingUp },
  ];

  const features = [
    {
      icon: Upload,
      title: 'Smart Resume Analysis',
      description: 'AI-powered parsing extracts skills, experience, and qualifications from your resume in seconds.',
    },
    {
      icon: Zap,
      title: 'Semantic Job Matching',
      description: 'Advanced algorithms match you with roles that truly fit your profile, beyond keyword matching.',
    },
    {
      icon: Sparkles,
      title: 'Actionable Feedback',
      description: 'Get personalized recommendations to optimize your resume for specific job opportunities.',
    },
    {
      icon: FileText,
      title: 'Application Tracking',
      description: 'Manage all your applications in one place with status updates and follow-up reminders.',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Resume',  description: 'Drop your resume or paste the content' },
    { number: '02', title: 'AI Analysis',    description: 'Get instant skill extraction and optimization tips' },
    { number: '03', title: 'Match Jobs',     description: 'Discover perfectly matched opportunities' },
    { number: '04', title: 'Track & Apply', description: 'Manage applications and get hired faster' },
  ];

  const router = useRouter();

  // ✅ Helper: is this stat still loading?
  const isLoading = (val: string) => val === '...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Cursor Follower */}
      <div
        className="fixed w-6 h-6 border-2 border-violet-400/50 rounded-full pointer-events-none z-50 transition-transform duration-200"
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px`, transform: 'translate(-50%, -50%)' }}
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

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.15}px)`, animationDelay: '2s' }} />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative z-10 px-6 pt-30 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-8">
              <Star className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300">AI-Powered Career Matching</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up">Find Your Perfect</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-rotate-gradient"
                style={{ animationDelay: '0.2s' }}>
                Career Match
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your resume, let AI find the perfect opportunities, and land your dream job 3x
              faster with intelligent matching and actionable insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");
                  router.push(token ? '/resume-upload' : '/signin');
                }}
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-105 flex items-center gap-2 overflow-hidden"
              >
                <span className="absolute inset-0 animate-shimmer" />
                <span className="relative">Upload Resume Now</span>
                <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105 animate-bounce-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <stat.icon className="relative w-8 h-8 mx-auto mb-3 text-violet-400 group-hover:scale-110 group-hover:rotate-12 transition-all" />

                  {/* ✅ Show shimmer while loading, real value after */}
                  <div className="relative text-3xl font-bold mb-1 group-hover:text-violet-300 transition-colors min-h-[2.25rem] flex items-center justify-center">
                    {isLoading(stat.value) ? (
                      <span className="inline-block w-16 h-7 bg-white/10 rounded-lg animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </div>

                  <div className="relative text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Job Seekers</span>
            </h2>
            <p className="text-xl text-slate-400">AI-driven tools that transform your job search</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-all hover:scale-[1.02] relative overflow-hidden ${
                  featuresInView ? (index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-violet-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="relative text-2xl font-bold mb-3 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="relative text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-6 py-20" ref={stepsRef}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get Started in
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> 4 Simple Steps</span>
            </h2>
            <p className="text-xl text-slate-400">From resume upload to your dream job</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className={`relative ${stepsInView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl text-2xl font-bold mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-300 transition-colors">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-600/20 backdrop-blur-sm border border-violet-500/30 rounded-3xl p-12 overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose the Plan That Fits Your<br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent animate-rotate-gradient">
                Career Goals
              </span>
            </h2>
            <p className="text-base text-slate-500 mb-8">
              Start free, upgrade anytime. Unlock powerful AI tools to optimize your resume,
              match with the right jobs, and accelerate your hiring success.
            </p>
            <div className="mb-8 flex justify-center">
              <div className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full text-sm text-violet-300">
                💡 Most users choose Standard for best results
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/pricelist')}
                className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-105"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}