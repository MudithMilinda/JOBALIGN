'use client';

import Navbar from "../components/Navbar";
import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Check,
  Zap,
  Brain,
  Target,
  TrendingUp,
  X,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Download
} from 'lucide-react';

export default function ResumeUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      startAnalysis();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    setUploadProgress(0);
    setAnalysisStep(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          simulateAnalysis();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const simulateAnalysis = () => {
    const steps = 5;
    let currentStep = 0;

    const stepInterval = setInterval(() => {
      currentStep++;
      setAnalysisStep(currentStep);

      if (currentStep >= steps) {
        clearInterval(stepInterval);
        setAnalyzing(false);
        setAnalyzed(true);
        setTimeout(() => setShowResults(true), 300);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-20">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              Upload Your
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}Resume
              </span>
            </h1>
            <p className="text-xl text-slate-400">
              Let AI analyze your resume and find the perfect job matches in seconds
            </p>
          </div>

          {!analyzed ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative bg-white/5 backdrop-blur-sm border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? 'border-violet-500 bg-violet-500/10 scale-105'
                      : 'border-white/20 hover:border-violet-500/50'
                  }`}
                >
                  {!file && !analyzing ? (
                    <div className="space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                        <Upload className="w-12 h-12 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Drop your resume here</h3>
                        <p className="text-slate-400 mb-6">or click to browse files</p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold cursor-pointer hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block">
                            Choose File
                          </span>
                        </label>
                      </div>
                      <p className="text-sm text-slate-500">Supports PDF and DOCX (Max 10MB)</p>
                    </div>
                  ) : analyzing ? (
                    <div className="space-y-8">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse">
                        <Zap className="w-12 h-12" />
                      </div>

                      <div>
                        <p className="text-lg font-semibold mb-4">Uploading & analyzing...</p>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <FileText className="w-16 h-16 mx-auto text-green-400" />
                      <p className="text-lg font-semibold">File ready: {file?.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    What We Analyze
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Extract skills and technologies',
                      'Analyze work experience and achievements',
                      'Identify career level and expertise',
                      'Calculate job match scores',
                      'Provide optimization suggestions',
                      'Find relevant job opportunities'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Privacy & Security</h4>
                      <p className="text-sm text-slate-300">
                        Your resume is encrypted and analyzed securely. We never share your data
                        with third parties. You can delete your information at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`space-y-6 transition-all duration-500 ${
                showResults ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-center">
                <Brain className="w-16 h-16 mx-auto text-violet-400 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Analysis Complete</h2>
                <p className="text-slate-400">Your resume has been successfully analyzed.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes fade-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
