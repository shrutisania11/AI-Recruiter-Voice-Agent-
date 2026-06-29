'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Search,
  Briefcase,
  Mail,
  CheckCircle2,
  Clock,
  ChevronDown,
  ExternalLink,
  UserCheck,
  Users,
  BarChart2,
  FileUser,
  Filter,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

// ── Data Types ─────────────────────────────────────────────────────
type CandidateStatus = 'Invited' | 'In Progress' | 'Completed' | 'Expired';

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  invitedAt: string;
  status: CandidateStatus;
  interviewType: 'Screening' | 'Technical Interview' | 'HR Final Interview';
  score?: number; // only for Completed
  duration?: string; // only for Completed
  interviewUrl: string;
}

// ── Helpers ────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' };
  if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' };
  return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' };
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Average';
  return 'Needs Work';
}

function statusConfig(status: CandidateStatus) {
  switch (status) {
    case 'Invited':    return { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: Mail,         label: 'Invited' };
    case 'In Progress':return { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: Clock,        label: 'In Progress' };
    case 'Completed':  return { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',icon: CheckCircle2, label: 'Completed' };
    case 'Expired':    return { color: 'text-zinc-500',   bg: 'bg-zinc-800/40',   border: 'border-zinc-700/40',   icon: XCircle,      label: 'Expired' };
  }
}

// ── Main Page ──────────────────────────────────────────────────────
export default function SchedulesPage() {
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [jobs, setJobs] = React.useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedJobId, setSelectedJobId] = React.useState<string>('all');
  const [search, setSearch]             = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<CandidateStatus | 'all'>('all');

  // Load from APIs on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        const schRes = await fetch('/api/schedules');
        const schData = await schRes.json();
        if (Array.isArray(schData)) {
          setCandidates(schData);
        }

        const jobsRes = await fetch('/api/jobs');
        const jobsData = await jobsRes.json();
        if (Array.isArray(jobsData)) {
          setJobs(jobsData.map(j => ({ id: j.id, title: j.title })));
        }
      } catch (err) {
        console.error('Error loading schedules data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Derived: candidates filtered
  const filtered = React.useMemo(() => {
    return candidates.filter((c) => {
      const matchJob    = selectedJobId === 'all' || c.jobId === selectedJobId;
      const matchSearch = search.trim() === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchJob && matchSearch && matchStatus;
    });
  }, [candidates, selectedJobId, search, statusFilter]);

  const pending   = filtered.filter((c) => c.status === 'Invited' || c.status === 'In Progress' || c.status === 'Expired');
  const completed = filtered.filter((c) => c.status === 'Completed');

  // Stats
  const totalInvited   = candidates.length;
  const totalCompleted = candidates.filter((c) => c.status === 'Completed').length;
  const completedWithScore = candidates.filter((c) => c.score !== null && c.score !== undefined);
  const avgScore       = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((acc, c) => acc + (c.score ?? 0), 0) / completedWithScore.length)
    : 0;

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto bg-black p-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              Schedules &amp; Interviews
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Track invite status and interview results for each job posting.</p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Invited', value: totalInvited, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Completed', value: totalCompleted, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Avg. Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${s.bg} ${s.border}`}>
                  <Icon className={`h-4 w-4 ${s.color} shrink-0`} />
                  <div className="text-right">
                    <p className={`text-base font-black leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Filters Bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidates by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all"
            />
          </div>

          {/* Job Filter */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800/60 text-white text-sm rounded-xl pl-9 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all min-w-[200px]"
            >
              <option value="all">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900/60 border border-zinc-800/60 text-white text-sm rounded-xl pl-9 pr-8 py-2.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/40 transition-all min-w-[150px]"
            >
              <option value="all">All Statuses</option>
              <option value="Invited">Invited</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          </div>

          {/* Clear filters */}
          {(search || selectedJobId !== 'all' || statusFilter !== 'all') && (
            <Button
              onClick={() => { setSearch(''); setSelectedJobId('all'); setStatusFilter('all'); }}
              variant="ghost"
              className="text-zinc-500 hover:text-white text-xs px-3 rounded-xl border border-zinc-800/60 hover:bg-zinc-800/40 cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        {/* ── Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ════ LEFT: Invited / Pending ════ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Invited Candidates</h2>
                <p className="text-[10px] text-zinc-600">Awaiting or in-progress interviews</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {pending.length}
              </span>
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 text-center">
                <AlertCircle className="h-8 w-8 text-zinc-700" />
                <p className="text-zinc-500 text-sm">No pending candidates match your filters.</p>
              </div>
            ) : (
              pending.map((c) => {
                const st = statusConfig(c.status);
                const StatusIcon = st.icon;
                return (
                  <Card key={c.id} className="bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <FileUser className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight">{c.name}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{c.email}</p>
                            {/* Job tag */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <Briefcase className="h-3 w-3 text-zinc-600 shrink-0" />
                              <span className="text-[10px] text-zinc-500 truncate">{c.jobTitle}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${st.color} ${st.bg} ${st.border}`}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {st.label}
                        </span>
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Invited {c.invitedAt}
                          </span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-500">{c.interviewType}</span>
                        </div>
                        <a href={c.interviewUrl} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* ════ RIGHT: Completed with Results ════ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Interview Results</h2>
                <p className="text-[10px] text-zinc-600">Candidates who have completed the interview</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {completed.length}
              </span>
            </div>

            {completed.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 text-center">
                <CheckCircle2 className="h-8 w-8 text-zinc-700" />
                <p className="text-zinc-500 text-sm">No completed interviews match your filters.</p>
              </div>
            ) : (
              completed.map((c) => {
                const sc = scoreColor(c.score!);
                const sl = scoreLabel(c.score!);
                return (
                  <Card key={c.id} className="bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <FileUser className="h-4 w-4 text-purple-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white leading-tight">{c.name}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{c.email}</p>
                            </div>
                            {/* Score badge */}
                            <div className={`flex flex-col items-center px-3 py-1.5 rounded-xl border shrink-0 ${sc.bg} ${sc.border}`}>
                              <span className={`text-xl font-black leading-none ${sc.text}`}>{c.score}%</span>
                              <span className={`text-[8px] font-bold uppercase tracking-wide ${sc.text} mt-0.5`}>{sl}</span>
                            </div>
                          </div>

                          {/* Job tag */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <Briefcase className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span className="text-[10px] text-zinc-500 truncate">{c.jobTitle}</span>
                          </div>

                          {/* Score bar */}
                          <div className="mt-3">
                            <div className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${sc.bar} transition-all duration-1000`}
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {c.duration}
                          </span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-500">{c.interviewType}</span>
                        </div>
                        <a href={c.interviewUrl} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

        </div>
      </main>
    </>
  );
}
