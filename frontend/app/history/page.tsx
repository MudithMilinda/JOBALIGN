'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import {
  FileText, Briefcase, Lightbulb, Star, ExternalLink,
  ChevronDown, ChevronUp, Clock, AlertCircle, Inbox
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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

interface Analysis {
  _id: string;
  fileName: string;
  candidateSummary: string;
  topSkills: string[];
  resumeTips: string[];
  jobs: Job[];
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/analysis/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch history');

        const data = await res.json();
        setAnalyses(data);
      } catch (err) {
        setError('Could not load history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar />

      <div className="relative z-10 px-6 pt-32 pb-20 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black mb-2">
            Analysis{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Your past CV analyses and job matches</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 text-slate-400 py-20 justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Loading your history...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && analyses.length === 0 && (
          <div className="text-center py-24">
            <Inbox className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg mb-2">No analyses yet</p>
            <p className="text-slate-500 text-sm mb-6">Upload your CV to get started</p>
            <button
              onClick={() => router.push('/resume-upload')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* Analysis Cards */}
        <div className="space-y-5">
          {analyses.map((analysis, index) => {
            const isExpanded = expandedId === analysis._id;

            return (
              <div
                key={analysis._id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Card Header — always visible */}
                <button
                  onClick={() => toggleExpand(analysis._id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* File icon */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-violet-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {analysis.fileName || 'Uploaded CV'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(analysis.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Right side: job count + chevron */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-violet-500/15 border border-violet-500/20 text-violet-300 rounded-full">
                      <Briefcase className="w-3 h-3" />
                      {analysis.jobs.length} jobs
                    </span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-6 pb-6 pt-5 space-y-6 animate-fade-in">

                    {/* Candidate Summary */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Candidate Summary</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{analysis.candidateSummary}</p>
                    </div>

                    {/* Top Skills */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Top Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.topSkills.map(skill => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resume Tips */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Resume Tips
                      </h3>
                      <ul className="space-y-1.5">
                        {analysis.resumeTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Matched Jobs */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Matched Jobs ({analysis.jobs.length})
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {analysis.jobs.map(job => (
                          <div
                            key={job.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:border-violet-500/30 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm leading-snug">{job.title}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${
                                job.matchQuality === 'Strong fit'
                                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              }`}>
                                <Star className="w-2.5 h-2.5" />
                                {job.matchQuality}
                              </span>
                            </div>

                            <p className="text-slate-400 text-xs">{job.company} · {job.location}</p>

                            <div className="flex flex-wrap gap-1">
                              {job.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 rounded-md">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {job.reason && (
                              <p className="text-xs text-slate-500 border-t border-white/10 pt-2 leading-relaxed">
                                {job.reason}
                              </p>
                            )}

                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-auto self-end flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition px-3 py-1.5 border border-violet-500/25 rounded-lg hover:bg-violet-500/10"
                            >
                              Apply <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}