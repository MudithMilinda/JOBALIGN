'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import {
  ExternalLink,
  ChevronDown, ChevronUp, Clock, AlertCircle, Inbox
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/signin');
        return;
      }

      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const res = await fetch(`${BACKEND_URL}/api/analysis/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch history');

      const data = await res.json();
      setAnalyses(data);
    } catch (err) {
      console.error(err);
      setError('Could not load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) +
      ' · ' +
      d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      <Navbar />

      <div className="relative z-10 px-6 pt-32 pb-20 max-w-4xl mx-auto">

        <h1 className="text-5xl font-black mb-2">
          Analysis{' '}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            History
          </span>
        </h1>

        <p className="text-slate-400 text-lg mb-10">
          Your past CV analyses and job matches
        </p>

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 py-20 justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Loading your history...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="text-center py-24">
            <Inbox className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg mb-2">No analyses yet</p>
            <button
              onClick={() => router.push('/resume-upload')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold hover:scale-105 transition"
            >
              Upload Resume
            </button>
          </div>
        )}

        <div className="space-y-5">
          {analyses.map((analysis) => {
            const isExpanded = expandedId === analysis._id;

            return (
              <div
                key={analysis._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(analysis._id)}
                  className="w-full flex justify-between px-6 py-5 text-left"
                >
                  <div>
                    <p className="font-semibold">{analysis.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(analysis.createdAt)}
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-5">

                    <p className="text-slate-300 text-sm">
                      {analysis.candidateSummary}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {analysis.topSkills?.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-violet-500/20 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <ul className="space-y-1">
                      {analysis.resumeTips?.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span>→</span> {tip}
                        </li>
                      ))}
                    </ul>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {analysis.jobs?.map((job) => (
                        <div key={job.id} className="p-4 border border-white/10 rounded-xl">
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-xs text-slate-400">
                            {job.company} · {job.location}
                          </p>

                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400"
                          >
                            Apply <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}