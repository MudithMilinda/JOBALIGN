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

  const analysisSteps = [
    { icon: FileText, label: 'Parsing Resume', duration: 1000 },
    { icon: Brain, label: 'Extracting Skills', duration: 1500 },
    { icon: Target, label: 'Analyzing Experience', duration: 1200 },
    { icon: Zap, label: 'Matching Jobs', duration: 1800 }
  ];

  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any | null>(null);
  const [matchScore, setMatchScore] = useState(0);

  const mockResults = {
    skills: [
      { name: 'JavaScript', level: 95, category: 'Technical' },
      { name: 'React', level: 90, category: 'Technical' },
      { name: 'Node.js', level: 85, category: 'Technical' },
      { name: 'Python', level: 80, category: 'Technical' },
      { name: 'Leadership', level: 88, category: 'Soft Skills' },
      { name: 'Communication', level: 92, category: 'Soft Skills' },
      { name: 'Project Management', level: 85, category: 'Soft Skills' }
    ],
    experience: {
      years: 5,
      level: 'Senior',
      industries: ['Technology', 'SaaS', 'Fintech']
    },
    matchScore: 94,
    suggestions: [
      'Add more quantifiable achievements',
      'Include cloud platform experience (AWS/Azure)',
      'Highlight leadership roles more prominently',
      'Add certifications section'
    ],
    matchedJobs: [
      { title: 'Senior Full Stack Developer', company: 'TechCorp', match: 96 },
      { title: 'Lead React Engineer', company: 'InnovateLabs', match: 94 },
      { title: 'Software Architect', company: 'CloudSystems', match: 89 }
    ]
  };

  const animateResults = useCallback(() => {
    setTimeout(() => setShowResults(true), 300);

    mockResults.skills.forEach((skill, index) => {
      setTimeout(() => {
        setSkills(prev => [...prev, skill]);
      }, index * 100);
    });

    setTimeout(() => {
      setExperience(mockResults.experience);
    }, 500);

    setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        setMatchScore(current);
        if (current >= mockResults.matchScore) {
          clearInterval(interval);
          setMatchScore(mockResults.matchScore);
        }
      }, 20);
    }, 800);
  }, [mockResults]);

  const startAnalysis = useCallback(() => {
    setAnalyzing(true);
    setUploadProgress(0);
    setAnalysisStep(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < analysisSteps.length) {
        setAnalysisStep(currentStep);
        currentStep++;
      } else {
        clearInterval(stepInterval);
        setTimeout(() => {
          setAnalyzing(false);
          setAnalyzed(true);
          animateResults();
        }, 500);
      }
    }, 1500);
  }, [analysisSteps.length, animateResults]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        startAnalysis();
      }
    },
    [startAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile &&
        (droppedFile.type === 'application/pdf' ||
          droppedFile.name.endsWith('.docx'))
      ) {
        setFile(droppedFile);
        startAnalysis();
      }
    },
    [startAnalysis]
  );

  const resetUpload = useCallback(() => {
    setFile(null);
    setAnalyzing(false);
    setAnalyzed(false);
    setUploadProgress(0);
    setAnalysisStep(0);
    setShowResults(false);
    setSkills([]);
    setExperience(null);
    setMatchScore(0);
  }, []);

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
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              Upload Your
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}
                Resume
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

                      {uploadProgress < 100 && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-400">Uploading...</span>
                            <span className="text-sm font-semibold text-violet-400">
                              {uploadProgress}%
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadProgress === 100 && (
                        <div className="space-y-4">
                          {analysisSteps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === analysisStep;
                            const isComplete = index < analysisStep;

                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                                  isActive
                                    ? 'bg-violet-500/20 border border-violet-500/30 scale-105'
                                    : isComplete
                                    ? 'bg-green-500/10 border border-green-500/30'
                                    : 'bg-white/5 border border-white/10'
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isComplete ? 'bg-green-500/20' : 'bg-violet-500/20'
                                  }`}
                                >
                                  {isComplete ? (
                                    <Check className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <StepIcon
                                      className={`w-5 h-5 ${
                                        isActive ? 'text-violet-400 animate-pulse' : 'text-slate-400'
                                      }`}
                                    />
                                  )}
                                </div>
                                <span
                                  className={`font-semibold ${
                                    isActive ? 'text-white' : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                                {isActive && (
                                  <div className="ml-auto flex gap-1">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                                    <div
                                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                                      style={{ animationDelay: '0.1s' }}
                                    />
                                    <div
                                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                                      style={{ animationDelay: '0.2s' }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-2xl flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Analysis Complete!</h3>
                        <p className="text-slate-400">View your results on the right</p>
                      </div>
                    </div>
                  )}

                  {file && !analyzing && (
                    <button
                      onClick={resetUpload}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {file && (
                  <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}
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
              {/* Match Score */}
              <div className="bg-gradient-to-br from-violet-500/20 to-cyan-500/20 backdrop-blur-sm border border-violet-500/30 rounded-3xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Match Score</h2>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - matchScore / 100)}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <div className="text-5xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        {matchScore}%
                      </div>
                      <div className="text-sm text-slate-400">Excellent Match!</div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-300">
                  Your profile is highly compatible with current job market demands
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    Extracted Skills
                  </h3>
                  <div className="space-y-3">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold">{skill.name}</span>
                          <span className="text-sm text-violet-400">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                {experience && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      Experience Profile
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-violet-500/10 rounded-xl">
                        <div className="text-3xl font-bold text-violet-400 mb-1">
                          {experience.years} Years
                        </div>
                        <div className="text-sm text-slate-400">Total Experience</div>
                      </div>
                      <div className="p-4 bg-cyan-500/10 rounded-xl">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">
                          {experience.level}
                        </div>
                        <div className="text-sm text-slate-400">Career Level</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-2">Industries</div>
                        <div className="flex flex-wrap gap-2">
                          {experience.industries.map((industry: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/10 rounded-full text-sm"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-400" />
                  Optimization Suggestions
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {mockResults.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Jobs */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Top Job Matches
                </h3>
                <div className="space-y-3">
                  {mockResults.matchedJobs.map((job, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-violet-500/10 hover:to-cyan-500/10 border border-white/10 hover:border-violet-500/30 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{job.title}</h4>
                        <p className="text-sm text-slate-400">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-400">
                            {job.match}%
                          </div>
                          <div className="text-xs text-slate-400">Match</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-violet-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2">
                  View All Matches
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
                <button
                  onClick={resetUpload}
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Upload Another Resume
                </button>
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
