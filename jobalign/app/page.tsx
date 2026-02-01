'use client';


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react';



export default function ResumePlatformHome() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [featuresInView, setFeaturesInView] = useState(false);
  const [stepsInView, setStepsInView] = useState(false);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === featuresRef.current && entry.isIntersecting) {
            setFeaturesInView(true);
          }
          if (entry.target === stepsRef.current && entry.isIntersecting) {
            setStepsInView(true);
          }
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

  const stats = [
    { value: '95%', label: 'Match Accuracy', icon: Target },
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '50K+', label: 'Jobs Analyzed', icon: BarChart3 },
    { value: '3x', label: 'Faster Hiring', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Upload,
      title: 'Smart Resume Analysis',
      description:
        'AI-powered parsing extracts skills, experience, and qualifications from your resume in seconds.',
    },
    {
      icon: Zap,
      title: 'Semantic Job Matching',
      description:
        'Advanced algorithms match you with roles that truly fit your profile, beyond keyword matching.',
    },
    {
      icon: Sparkles,
      title: 'Actionable Feedback',
      description:
        'Get personalized recommendations to optimize your resume for specific job opportunities.',
    },
    {
      icon: FileText,
      title: 'Application Tracking',
      description:
        'Manage all your applications in one place with status updates and follow-up reminders.',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Resume', description: 'Drop your resume or paste the content' },
    { number: '02', title: 'AI Analysis', description: 'Get instant skill extraction and optimization tips' },
    { number: '03', title: 'Match Jobs', description: 'Discover perfectly matched opportunities' },
    { number: '04', title: 'Track & Apply', description: 'Manage applications and get hired faster' },
  ];




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
        {[...Array(20)].map((_, i) => {
          const left = `${(i * 37) % 100}%`;
          const top = `${(i * 53) % 100}%`;
          const delay = `${i * 0.3}s`;
          const duration = `${8 + (i % 5)}s`;

          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-violet-400/30 rounded-full animate-float"
              style={{
                left,
                top,
                animationDelay: delay,
                animationDuration: duration,
              }}
            />
          );
        })}
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{
            transform: `translateY(${-scrollY * 0.2}px)`,
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.15}px)`,
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100vh) translateX(-20px);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            transform: translateX(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes rotate-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-rotate-gradient {
          background-size: 200% 200%;
          animation: rotate-gradient 3s ease infinite;
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative z-10 px-6 pt-30 pb-32">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-8">
              <Star className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300">AI-Powered Career Matching</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up">Find Your Perfect</span>
              <br />
              <span
                className="inline-block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-rotate-gradient"
                style={{ animationDelay: '0.2s' }}
              >
                Career Match
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your resume, let AI find the perfect opportunities, and land your dream job 3x
              faster with intelligent matching and actionable insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
  onClick={() => router.push('/resume-upload')}
  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-105 flex items-center gap-2 overflow-hidden"
>
  <span className="absolute inset-0 animate-shimmer"></span>
  <span className="relative">Upload Resume Now</span>
  <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
</button>

              
            </div>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105 animate-bounce-in relative overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon className="relative w-8 h-8 mx-auto mb-3 text-violet-400 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                <div className="relative text-3xl font-bold mb-1 group-hover:text-violet-300 transition-colors">
                  {stat.value}
                </div>
                <div className="relative text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}
                Job Seekers
              </span>
            </h2>
            <p className="text-xl text-slate-400">AI-driven tools that transform your job search</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-all hover:scale-[1.02] relative overflow-hidden ${
                  featuresInView
                    ? index % 2 === 0
                      ? 'animate-slide-in-left'
                      : 'animate-slide-in-right'
                    : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-cyan-500/0 group-hover:from-violet-500/10 group-hover:to-cyan-500/5 transition-all duration-500"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-violet-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400/20 to-cyan-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="relative text-2xl font-bold mb-3 group-hover:text-violet-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                <ArrowRight className="absolute bottom-8 right-8 w-5 h-5 text-violet-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20" ref={stepsRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Get Started in
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}
                4 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-slate-400">From resume upload to your dream job</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative ${stepsInView ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl text-2xl font-bold mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative">
                    <span className="relative z-10">{step.number}</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-cyan-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-1000 ${
                        stepsInView ? 'w-full' : 'w-0'
                      }`}
                      style={{
                        transitionDelay: `${index * 200 + 400}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600/20 to-cyan-600/20 backdrop-blur-sm border border-violet-500/30 rounded-3xl p-12 text-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/20 to-violet-600/0 animate-shimmer"></div>

            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="absolute w-4 h-4 text-violet-400/30 animate-pulse"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${15 + (i % 3) * 10}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + (i % 2)}s`,
                }}
              />
            ))}

            <h2 className="relative text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent animate-rotate-gradient">
                Job Search?
              </span>
            </h2>
            <p className="relative text-xl text-slate-300 mb-8">
              Join thousands of professionals who've found their perfect match
            </p>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group/btn relative px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-violet-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2 overflow-hidden">
                <span className="absolute inset-0 animate-shimmer"></span>
                <span className="relative">Start Free Trial</span>
                <ChevronRight className="relative w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button className="relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all hover:scale-105">
                Schedule Demo
              </button>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-8 mt-8 text-sm text-slate-400">
              {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CheckCircle2
                    className="w-4 h-4 text-green-400 animate-bounce-in"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
