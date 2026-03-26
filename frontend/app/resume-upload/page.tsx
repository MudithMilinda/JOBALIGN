'use client';

import Navbar from "../components/Navbar";
import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Check,
  Zap,
  Brain,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Filter,
  Star
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  matchQuality: 'Strong fit' | 'Good fit';
  tags: string[];
  url: string;
  reason: string;
}

interface AnalysisResult {
  candidateSummary: string;
  topSkills: string[];
  resumeTips: string[];
  jobs: Job[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const JOB_TYPE_LABELS: Record<string, string> = {
  all: 'All',
  fullstack: 'Full Stack',
  qa: 'QA / Testing',
  mobile: 'Mobile',
  frontend: 'Frontend',
  backend: 'Backend',
  other: 'Other',
};

export default function ResumeUploadPage() {
  const [isDragging, setIsDragging]     = useState(false);
  const [file, setFile]                 = useState<File | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel]   = useState('Uploading CV...');
  const [result, setResult]             = useState<AnalysisResult | null>(null);
  const [error, setError]               = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // ── File helpers ─────────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); sendToBackend(f); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); sendToBackend(f); }
  };

  // ── Fake progress bar while streaming ────────────────────────────────────────
  const startProgressAnimation = () => {
    const labels = [
      'Uploading CV...',
      'Reading your experience...',
      'Matching to job market...',
      'Ranking opportunities...',
      'Almost done...',
    ];
    let pct = 0; let li = 0;
    const iv = setInterval(() => {
      pct = Math.min(pct + Math.random() * 8 + 3, 90);
      setUploadProgress(Math.round(pct));
      if (li < labels.length && pct > li * 18) setProgressLabel(labels[li++]);
    }, 600);
    return iv;
  };

  // ── Main API call ─────────────────────────────────────────────────────────────
  const sendToBackend = async (selectedFile: File) => {
    setAnalyzing(true);
    setResult(null);
    setError('');
    setUploadProgress(0);
    setActiveFilter('all');

    const progressInterval = startProgressAnimation();

    const form = new FormData();
    form.append('cv', selectedFile);
    form.append('location', 'Sri Lanka / Remote');
    form.append('jobTypes', 'internship, entry-level, junior');

    try {
      const resp = await fetch(`${BACKEND_URL}/api/search-jobs`, {
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        // Safely parse error — server might return plain text in some edge cases
        const contentType = resp.headers.get('content-type') ?? '';
        let message = `Server error (${resp.status})`;
        if (contentType.includes('application/json')) {
          const body = await resp.json();
          message = body.error || message;
        } else {
          message = await resp.text().catch(() => message);
        }
        throw new Error(message);
      }

      // Read the SSE stream
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = JSON.parse(line.slice(6));

          if (payload.type === 'result') {
            setUploadProgress(100);
            setProgressLabel('Complete!');
            setResult(payload.data as AnalysisResult);
          }
          if (payload.type === 'error') throw new Error(payload.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      clearInterval(progressInterval);
      setAnalyzing(false);
    }
  };

  // ── Filter jobs ───────────────────────────────────────────────────────────────
  const filteredJobs = result?.jobs.filter(
    j => activeFilter === 'all' || j.type === activeFilter
  ) ?? [];

  const jobTypes = result
    ? ['all', ...new Set(result.jobs.map(j => j.type))]
    : [];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 mt-20">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              Upload Your
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Resume</span>
            </h1>
            <p className="text-xl text-slate-400">Let AI analyze your resume and find the perfect job matches in seconds</p>
          </div>

          {/* ── Upload + Info (shown when no result yet) ── */}
          {!result && (
            <div className="grid lg:grid-cols-2 gap-8">

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative bg-white/5 backdrop-blur-sm border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  isDragging ? 'border-violet-500 bg-violet-500/10 scale-105' : 'border-white/20 hover:border-violet-500/50'
                }`}
              >
                {!file && !analyzing && (
                  <div className="space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                      <Upload className="w-12 h-12 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Drop your resume here</h3>
                      <p className="text-slate-400 mb-6">or click to browse files</p>
                      <label className="inline-block">
                        <input type="file" accept=".pdf,image/*" onChange={handleFileSelect} className="hidden" />
                        <span className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold cursor-pointer hover:shadow-lg hover:shadow-violet-500/50 transition-all inline-block">
                          Choose File
                        </span>
                      </label>
                    </div>
                    <p className="text-sm text-slate-500">Supports PDF and Images (Max 10MB)</p>
                  </div>
                )}

                {analyzing && (
                  <div className="space-y-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse">
                      <Zap className="w-12 h-12" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">{progressLabel}</p>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-400 mt-2">{uploadProgress}%</p>
                    </div>
                    <p className="text-slate-400 text-sm">{file?.name}</p>
                  </div>
                )}
              </div>

              {/* Info Panel */}
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
                      'Find relevant job opportunities',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
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
                        Your resume is encrypted and analyzed securely. We never share your data with third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <div className="space-y-8 animate-fade-in-up">

              {/* Success header */}
              <div className="text-center">
                <Brain className="w-16 h-16 mx-auto text-violet-400 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Analysis Complete!</h2>
                <p className="text-slate-400">Found {result.jobs.length} matched opportunities for you</p>
              </div>

              {/* Candidate Summary Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" /> Candidate Summary
                </h3>
                <p className="text-slate-300 leading-relaxed mb-4">{result.candidateSummary}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {result.topSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-slate-400 mb-2">Resume Tips</p>
                  {result.resumeTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-2">
                      <span className="text-cyan-400 mt-0.5">→</span> {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-400" />
                {jobTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      activeFilter === type
                        ? 'bg-violet-500/30 border-violet-500/50 text-violet-300'
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {JOB_TYPE_LABELS[type] ?? type}
                    {type === 'all'
                      ? ` (${result.jobs.length})`
                      : ` (${result.jobs.filter(j => j.type === type).length})`}
                  </button>
                ))}
              </div>

              {/* Jobs Grid */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-violet-500/40 transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm leading-snug">{job.title}</p>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${
                        job.matchQuality === 'Strong fit'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        <Star className="w-3 h-3" />
                        {job.matchQuality}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm">{job.company}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {job.reason && (
                      <p className="text-xs text-slate-400 border-t border-white/10 pt-3 leading-relaxed">
                        {job.reason}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-xs text-slate-500">{job.location}</span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 border border-violet-500/25 rounded-lg hover:bg-violet-500/10"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload another */}
              <div className="text-center pt-4">
                <button
                  onClick={() => { setResult(null); setFile(null); setError(''); }}
                  className="px-6 py-2.5 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all"
                >
                  Upload a different resume
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes fade-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}