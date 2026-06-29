'use client';

import * as React from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  BarChart2,
  BookOpen,
  Brain,
  TrendingUp,
  Target,
  Smile,
  ArrowRight,
  RefreshCw,
  Trophy,
  Rocket,
  Flame,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────
type ImprovementArea = {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  ringColor: string;
  title: string;
  tip: string;
  score: number;
  label: string;
};

type FeedbackData = {
  motivationalNote: string;
  candidateStrengths: string[];
  improvementAreas: ImprovementArea[];
};

// ── Feedback Engine ────────────────────────────────────────────────
function buildFeedback(name: string, role: string, score: number, notes: string): FeedbackData {
  const firstName = name.split(' ')[0] || 'Candidate';
  const isHighScore = score >= 7;

  const motivationalNote = isHighScore
    ? `${firstName}, you absolutely shone in this interview — your confidence, clarity, and domain expertise were immediately evident. The way you handled complex questions with calm and structure demonstrates a level of professional maturity that impresses even seasoned interviewers. The role of ${role} is a perfect fit for your strengths, and with a few refinements you will be an unstoppable force. We believe in you. 🌟`
    : `${firstName}, every great professional has interviews that challenge them — and that experience is exactly what builds excellence. You showed genuine passion, honesty, and a real desire to grow. These are the foundations the best ${role}s are built on. Take this feedback as a launchpad, not a setback. The next version of you is just around the corner. 🚀`;

  return {
    motivationalNote,
    candidateStrengths: [
      'Genuine enthusiasm & passion',
      'Clear communication style',
      'Collaborative mindset',
      'Problem-solving orientation',
      isHighScore ? 'Strong technical depth' : 'Willingness to learn',
      isHighScore ? 'Structured thinking' : 'Authentic self-presentation',
    ],
    improvementAreas: [
      {
        icon: Mic,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        ringColor: 'stroke-violet-400',
        title: 'Verbal Clarity Under Pressure',
        tip: 'Practice the STAR method (Situation → Task → Action → Result) aloud daily. Record yourself for 5 minutes and listen back — this single habit builds elite-level interview confidence.',
        score: isHighScore ? 78 : 62,
        label: isHighScore ? 'Good' : 'Developing',
      },
      {
        icon: BarChart2,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        ringColor: 'stroke-blue-400',
        title: 'Metric-Driven Storytelling',
        tip: `For a ${role} role, always quantify outcomes. Replace "I improved the process" with "I cut deployment time by 35% over 3 months." Numbers make your impact undeniable.`,
        score: isHighScore ? 70 : 55,
        label: isHighScore ? 'Good' : 'Needs Focus',
      },
      {
        icon: Brain,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        ringColor: 'stroke-emerald-400',
        title: 'Structured Problem Breakdown',
        tip: `When facing ambiguous questions, pause briefly and say "Let me break this into parts…" — this signals a senior engineering mindset and gives you time to organise your thoughts.`,
        score: isHighScore ? 82 : 68,
        label: isHighScore ? 'Strong' : 'Progressing',
      },
      {
        icon: BookOpen,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        ringColor: 'stroke-amber-400',
        title: 'Domain Knowledge Depth',
        tip: notes.trim().length > 10
          ? `Your notes mention: "${notes.slice(0, 90)}..." — dive deeper into those specific areas. 30 min/day of focused reading compounds into expert-level fluency in 90 days.`
          : 'Read 2–3 role-specific case studies per week. Subscribe to one top-tier industry newsletter and apply one new concept weekly in practice projects.',
        score: isHighScore ? 75 : 60,
        label: isHighScore ? 'Solid' : 'Growing',
      },
    ],
  };
}

// ── Score Ring ─────────────────────────────────────────────────────
function ScoreRing({ score, ringColor }: { score: number; ringColor: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const colorClass =
    score >= 75 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${ringColor} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`text-xs font-black leading-none ${colorClass}`}>{score}</p>
        <p className="text-[8px] text-zinc-600 leading-none mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

// ── Strength Pill ──────────────────────────────────────────────────
function StrengthPill({ label, idx }: { label: string; idx: number }) {
  const colors = [
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    'bg-violet-500/10 border-violet-500/20 text-violet-300',
    'bg-blue-500/10 border-blue-500/20 text-blue-300',
    'bg-amber-500/10 border-amber-500/20 text-amber-300',
    'bg-pink-500/10 border-pink-500/20 text-pink-300',
    'bg-teal-500/10 border-teal-500/20 text-teal-300',
  ];
  const starColors = ['text-emerald-400', 'text-violet-400', 'text-blue-400', 'text-amber-400', 'text-pink-400', 'text-teal-400'];
  const cls = colors[idx % colors.length];
  const starCls = starColors[idx % starColors.length];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cls}`}>
      <Star className={`h-3 w-3 fill-current ${starCls}`} />
      {label}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AICoachPage() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackData | null>(null);
  const [formExpanded, setFormExpanded] = React.useState(true);

  const [candidateName, setCandidateName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [interviewScore, setInterviewScore] = React.useState(5);
  const [notes, setNotes] = React.useState('');

  const handleGenerate = async () => {
    if (!candidateName.trim() || !role.trim()) return;
    setIsGenerating(true);
    setFeedback(null);
    setFormExpanded(false);
    await new Promise((r) => setTimeout(r, 2400));
    setFeedback(buildFeedback(candidateName, role, interviewScore, notes));
    setIsGenerating(false);
  };

  const handleReset = () => {
    setFeedback(null);
    setFormExpanded(true);
    setCandidateName('');
    setRole('');
    setInterviewScore(5);
    setNotes('');
  };

  const scoreLabel =
    interviewScore >= 9 ? 'Outstanding' :
    interviewScore >= 7 ? 'Good' :
    interviewScore >= 5 ? 'Average' :
    interviewScore >= 3 ? 'Needs Work' : 'Poor';

  const scoreColor =
    interviewScore >= 7 ? 'text-emerald-400' :
    interviewScore >= 5 ? 'text-amber-400' : 'text-red-400';

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto bg-black p-8">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 text-violet-300 shrink-0">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">AI Growth Coach</h1>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-300 uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" /> AI Powered
                </span>
              </div>
              <p className="text-zinc-400 mt-1 text-sm">
                Personalised post-interview feedback — constructive improvements and heartfelt motivation for every candidate.
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', value: '24', label: 'Reports Generated', sub: 'This month' },
            { icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', value: '+31%', label: 'Avg. Improvement', sub: 'Post-feedback' },
            { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', value: '4.8★', label: 'Candidate Satisfaction', sub: 'Average rating' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex items-center gap-4 p-4 rounded-2xl border ${s.bg} ${s.border}`}>
                <div className={`h-11 w-11 flex items-center justify-center rounded-xl ${s.bg} border ${s.border} shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-semibold text-white">{s.label}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* ════ LEFT: Input Form (2 cols) ════ */}
          <div className="xl:col-span-2 space-y-4">

            <Card className="bg-zinc-900/40 border-zinc-800/60 overflow-hidden">
              {/* Collapsible header */}
              <button
                onClick={() => setFormExpanded((p) => !p)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">Interview Details</span>
                </div>
                {formExpanded
                  ? <ChevronUp className="h-4 w-4 text-zinc-500" />
                  : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>

              {formExpanded && (
                <CardContent className="p-5 space-y-5">

                  {/* Candidate Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Candidate Name <span className="text-violet-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Role Applied For <span className="text-violet-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a role…</option>
                        <option>Senior Engineer</option>
                        <option>Frontend Developer</option>
                        <option>Backend Developer</option>
                        <option>Full-Stack Developer</option>
                        <option>Product Manager</option>
                        <option>UX Designer</option>
                        <option>Data Scientist</option>
                        <option>DevOps Engineer</option>
                        <option>Marketing Lead</option>
                        <option>Business Analyst</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  {/* Score slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interview Score</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${scoreColor}`}>{interviewScore}</span>
                        <span className="text-xs text-zinc-600">/10</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          interviewScore >= 7 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          interviewScore >= 5 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>{scoreLabel}</span>
                      </div>
                    </div>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={interviewScore}
                      onChange={(e) => setInterviewScore(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-violet-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-700 font-semibold uppercase tracking-wider">
                      <span>Poor</span><span>Average</span><span>Excellent</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recruiter Observations</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Excellent communication, hesitant on system design, great culture alignment, nervous under pressure…"
                      rows={4}
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                    />
                  </div>

                  {/* Generate CTA */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!candidateName.trim() || !role.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-6 rounded-xl shadow-xl shadow-violet-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0 text-sm"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Generating Feedback…</span></>
                    ) : (
                      <><Sparkles className="h-4 w-4" /><span>Generate AI Feedback</span></>
                    )}
                  </Button>

                  {feedback && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl py-5 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      New Analysis
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Tip box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/30 to-fuchsia-950/15 border border-violet-500/15">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Fill in the candidate details and click <span className="text-violet-400 font-semibold">Generate AI Feedback</span> to receive a personalised motivational note, highlighted strengths, and targeted improvement tips tailored to the role and score.
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="p-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 space-y-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">How It Works</p>
              {[
                { step: '01', text: 'Enter candidate name, role & interview score' },
                { step: '02', text: 'Add optional recruiter notes for personalisation' },
                { step: '03', text: 'AI generates a motivational note + growth areas' },
                { step: '04', text: 'Share the report with the candidate directly' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="text-[9px] font-black text-violet-400/60 w-5 shrink-0 mt-0.5">{item.step}</span>
                  <p className="text-xs text-zinc-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ════ RIGHT: Results Panel (3 cols) ════ */}
          <div className="xl:col-span-3 space-y-5">

            {/* ── Loading ── */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center gap-6 py-24 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-fuchsia-950/10 to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)] pointer-events-none" />
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <BrainCircuit className="h-9 w-9 text-violet-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-violet-400/30 animate-spin border-t-transparent" />
                  <div className="absolute inset-[-6px] rounded-full border border-violet-500/10 animate-spin border-b-transparent" style={{ animationDuration: '3s' }} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-bold text-lg">Crafting your personalised feedback…</p>
                  <p className="text-xs text-zinc-500">Analysing interview signals and building your growth report</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty State ── */}
            {!isGenerating && !feedback && (
              <div className="flex flex-col items-center justify-center gap-5 py-24 rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-900/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.03)_0%,_transparent_70%)] pointer-events-none" />
                <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center">
                  <BrainCircuit className="h-7 w-7 text-zinc-600" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <p className="text-zinc-300 font-semibold">Ready to coach a candidate?</p>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fill in the <span className="text-violet-400">Interview Details</span> panel on the left and hit Generate — your AI coach will craft a personalised feedback report in seconds.
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-2">
                  {[
                    { icon: Heart, label: 'Motivational Note', color: 'text-pink-400' },
                    { icon: TrendingUp, label: 'Growth Areas', color: 'text-emerald-400' },
                    { icon: Star, label: 'Strengths', color: 'text-yellow-400' },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex flex-col items-center gap-1.5 text-center">
                        <Icon className={`h-5 w-5 ${f.color}`} />
                        <p className="text-[10px] text-zinc-600">{f.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Feedback Results ── */}
            {!isGenerating && feedback && (
              <div className="space-y-5">

                {/* ★ Special Motivational Note ★ */}
                <div className="relative rounded-2xl overflow-hidden">
                  {/* Layered gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-pink-600/15" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,70,239,0.12)_0%,_transparent_55%)]" />
                  <div className="absolute inset-0 rounded-2xl border border-violet-500/25" />
                  {/* Glow dot */}
                  <div className="absolute top-3 right-3 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl pointer-events-none" />

                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/25 to-orange-500/25 border border-yellow-500/30 shrink-0">
                          <Heart className="h-5 w-5 text-yellow-400 fill-yellow-400/40" />
                        </div>
                        <div>
                          <p className="text-[10px] text-violet-300/60 font-bold uppercase tracking-widest">Special Note from Your AI Coach</p>
                          <p className="text-white font-bold text-base mt-0.5">To {candidateName}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <blockquote className="text-sm text-zinc-200 leading-relaxed italic border-l-[3px] border-gradient-to-b border-violet-400/60 pl-5 py-1">
                      &ldquo;{feedback.motivationalNote}&rdquo;
                    </blockquote>

                    {/* Strength badges */}
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">✦ Highlighted Strengths</p>
                      <div className="flex flex-wrap gap-2">
                        {feedback.candidateStrengths.map((s, i) => (
                          <StrengthPill key={s} label={s} idx={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Growth Areas ── */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Constructive Growth Areas</h3>
                    <span className="text-xs text-zinc-600">— actionable steps for improvement</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {feedback.improvementAreas.map((area) => {
                      const Icon = area.icon;
                      return (
                        <div
                          key={area.title}
                          className={`rounded-2xl p-4 border ${area.bg} ${area.border} hover:scale-[1.01] transition-transform`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${area.bg} border ${area.border}`}>
                              <Icon className={`h-4 w-4 ${area.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-white leading-tight">{area.title}</p>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${area.color} mt-0.5 block`}>{area.label}</span>
                                </div>
                                <ScoreRing score={area.score} ringColor={area.ringColor} />
                              </div>
                              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed">{area.tip}</p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-[9px] text-zinc-700 mb-1.5">
                              <span>Current level</span>
                              <span>{area.score}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${area.color.replace('text-', 'bg-').replace('-400', '-500')}`}
                                style={{ width: `${area.score}%`, transition: 'width 1.2s ease' }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Share Footer ── */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Smile className="h-4.5 w-4.5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Share with {candidateName.split(' ')[0]}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">Deliver this report via the candidate portal to inspire action.</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-600/20 text-sm flex items-center gap-2 cursor-pointer rounded-xl px-4 h-9"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Share Report
                  </Button>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
