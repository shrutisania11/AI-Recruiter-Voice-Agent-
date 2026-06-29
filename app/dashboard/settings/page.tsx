'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { useSettings } from '@/context/settings-context';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { DashboardHeader } from '@/components/dashboard/header';
import {
  User,
  Bot,
  ListChecks,
  Sliders,
  Zap,
  Bell,
  Plug,
  ChevronRight,
  Save,
  RotateCcw,
  Mic,
  Volume2,
  Clock,
  MessageSquare,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ── Nav sections ───────────────────────────────────────────────────
const NAV = [
  { id: 'profile',       icon: User,        label: 'Profile' },
  { id: 'voice-agent',   icon: Bot,         label: 'Voice Agent' },
  { id: 'interviews',    icon: ListChecks,  label: 'Interview Config' },
  { id: 'prompts',       icon: MessageSquare, label: 'Prompt Settings' },
  { id: 'automation',    icon: Zap,         label: 'Automation' },
  { id: 'notifications', icon: Bell,        label: 'Notifications' },
  { id: 'integrations',  icon: Plug,        label: 'Integrations' },
];

// ── Toggle ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-purple-600' : 'bg-zinc-700'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Row: setting label + description + control ─────────────────────
function SettingRow({ label, desc, children, hint }: { label: string; desc?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-zinc-800/50 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>}
        {hint && (
          <div className="flex items-center gap-1 mt-1">
            <Info className="h-3 w-3 text-zinc-600" />
            <p className="text-[10px] text-zinc-600 italic">{hint}</p>
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Section card wrapper ───────────────────────────────────────────
function Section({ title, desc, icon: Icon, children }: { title: string; desc?: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800/60">
      <CardHeader className="pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-white text-sm font-bold">{title}</CardTitle>
            {desc && <CardDescription className="text-zinc-500 text-xs mt-0.5">{desc}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 divide-y divide-zinc-800/40">
        {children}
      </CardContent>
    </Card>
  );
}

// ── Interview type config sub-component ───────────────────────────
type InterviewConfig = {
  questions: number;
  duration: number;
  enabled: boolean;
  scoringFocus: string;
};

function InterviewTypeCard({
  type, color, config, onChange,
}: {
  type: string;
  color: string;
  config: InterviewConfig;
  onChange: (val: Partial<InterviewConfig>) => void;
}) {
  const borderMap: Record<string, string> = {
    'Screening':           'border-blue-500/30 bg-blue-500/5',
    'Technical Interview': 'border-purple-500/30 bg-purple-500/5',
    'HR Final Interview':  'border-emerald-500/30 bg-emerald-500/5',
  };
  const textMap: Record<string, string> = {
    'Screening':           'text-blue-400',
    'Technical Interview': 'text-purple-400',
    'HR Final Interview':  'text-emerald-400',
  };

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${borderMap[type]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-bold ${textMap[type]}`}>{type}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Configure questions and scoring for this interview type</p>
        </div>
        <Toggle checked={config.enabled} onChange={(v) => onChange({ enabled: v })} />
      </div>

      {config.enabled && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          {/* # of questions */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Number of Questions</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ questions: Math.max(1, config.questions - 1) })}
                className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm flex items-center justify-center hover:bg-zinc-700 cursor-pointer"
              >−</button>
              <span className="text-white font-bold text-sm w-5 text-center">{config.questions}</span>
              <button
                onClick={() => onChange({ questions: Math.min(20, config.questions + 1) })}
                className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm flex items-center justify-center hover:bg-zinc-700 cursor-pointer"
              >+</button>
            </div>
          </div>

          {/* Duration per question */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">Max Time per Question (seconds)</label>
            <select
              value={config.duration}
              onChange={(e) => onChange({ duration: Number(e.target.value) })}
              className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
            >
              {[30, 45, 60, 90, 120].map((v) => (
                <option key={v} value={v}>{v}s</option>
              ))}
            </select>
          </div>

          {/* Scoring focus */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Scoring Focus Area</label>
            <input
              type="text"
              value={config.scoringFocus}
              onChange={(e) => onChange({ scoringFocus: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom questions list ──────────────────────────────────────────
function QuestionList({
  questions, onChange,
}: {
  questions: string[];
  onChange: (qs: string[]) => void;
}) {
  const add    = () => onChange([...questions, '']);
  const update = (i: number, v: string) => onChange(questions.map((q, idx) => idx === i ? v : q));
  const remove = (i: number) => onChange(questions.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-zinc-700 shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Question ${i + 1}…`}
            className="flex-1 bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
          />
          <button onClick={() => remove(i)} className="text-zinc-600 hover:text-red-400 cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 cursor-pointer mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add question
      </button>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useUser();
  const { settings, updateSettings, persistSettings } = useSettings();
  const [activeSection, setActiveSection] = React.useState('profile');
  const [saved, setSaved] = React.useState(false);

  // ── Derived local setters that write back to context ──────────
  const agentName    = settings.agentName;
  const voiceType    = settings.voiceType;
  const language     = settings.language;
  const speakingRate = settings.speakingRate;
  const introMessage = settings.introMessage;
  const outroMessage = settings.outroMessage;
  const silenceTimeout = String(settings.silenceTimeout);
  const interviewConfigs = settings.interviewConfigs;
  const systemPrompt = settings.systemPrompt;
  const screeningQs  = settings.screeningQs;
  const technicalQs  = settings.technicalQs;
  const hrQs         = settings.hrQs;
  const autoInvite   = settings.autoInvite;
  const autoInviteThreshold = settings.autoInviteThreshold;
  const autoSendResults = settings.autoSendResults;
  const autoSchedule = settings.autoSchedule;
  const autoExpireDays = settings.autoExpireDays;
  const autoShortlist = settings.autoShortlist;
  const shortlistThreshold = settings.shortlistThreshold;
  const notifyOnComplete = settings.notifyOnComplete;
  const notifyDailyDigest = settings.notifyDailyDigest;
  const notifyThreshold = settings.notifyThreshold;
  const digestTime = settings.digestTime;

  const setAgentName     = (v: string) => updateSettings({ agentName: v });
  const setVoiceType     = (v: string) => updateSettings({ voiceType: v });
  const setLanguage      = (v: string) => updateSettings({ language: v });
  const setSpeakingRate  = (v: string) => updateSettings({ speakingRate: v });
  const setIntroMessage  = (v: string) => updateSettings({ introMessage: v });
  const setOutroMessage  = (v: string) => updateSettings({ outroMessage: v });
  const setSilenceTimeout = (v: string) => updateSettings({ silenceTimeout: Number(v) });
  const setInterviewConfigs = (val: typeof interviewConfigs) => updateSettings({ interviewConfigs: val });
  const setSystemPrompt  = (v: string) => updateSettings({ systemPrompt: v });
  const setScreeningQs   = (v: string[]) => updateSettings({ screeningQs: v });
  const setTechnicalQs   = (v: string[]) => updateSettings({ technicalQs: v });
  const setHrQs          = (v: string[]) => updateSettings({ hrQs: v });
  const setAutoInvite    = (v: boolean) => updateSettings({ autoInvite: v });
  const setAutoInviteThreshold = (v: number) => updateSettings({ autoInviteThreshold: v });
  const setAutoSendResults = (v: boolean) => updateSettings({ autoSendResults: v });
  const setAutoSchedule  = (v: boolean) => updateSettings({ autoSchedule: v });
  const setAutoExpireDays = (v: string) => updateSettings({ autoExpireDays: v });
  const setAutoShortlist = (v: boolean) => updateSettings({ autoShortlist: v });
  const setShortlistThreshold = (v: number) => updateSettings({ shortlistThreshold: v });
  const setNotifyOnComplete = (v: boolean) => updateSettings({ notifyOnComplete: v });
  const setNotifyDailyDigest = (v: boolean) => updateSettings({ notifyDailyDigest: v });
  const setNotifyThreshold = (v: boolean) => updateSettings({ notifyThreshold: v });
  const setDigestTime    = (v: string) => updateSettings({ digestTime: v });

  const patchConfig = (type: string, patch: Partial<InterviewConfig>) =>
    setInterviewConfigs({ ...interviewConfigs, [type]: { ...interviewConfigs[type], ...patch } });

  // ── Save handler — writes to localStorage ─────────────────────
  const handleSave = () => {
    persistSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const userName  = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Recruiter' : 'Loading…';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userImage = user?.imageUrl;

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto bg-black">
        <div className="flex h-full">

          {/* ── Left Nav ── */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-zinc-800/60 bg-zinc-950/60 p-4 space-y-1 sticky top-0 h-screen overflow-y-auto">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-2 mb-3">Settings</p>
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  {item.label}
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-purple-400" />}
                </button>
              );
            })}
          </aside>

          {/* ── Right Content ── */}
          <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">

            {/* Mobile nav */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                      activeSection === item.id
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white capitalize">
                  {NAV.find((n) => n.id === activeSection)?.label}
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">Manage your AI recruiter preferences</p>
              </div>
              <div className="flex items-center gap-2">
                {saved && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 h-8 rounded-lg cursor-pointer border-0 flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </Button>
              </div>
            </div>

            {/* ══════════════ PROFILE ══════════════ */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <Section title="Personal Profile" desc="Your recruiter account details from Clerk." icon={User}>
                  <div className="py-4 flex items-center gap-4">
                    {userImage && (
                      <img src={userImage} alt={userName} className="h-16 w-16 rounded-full border-2 border-purple-500/30 shrink-0" />
                    )}
                    <div>
                      <p className="text-base font-bold text-white">{userName}</p>
                      <p className="text-sm text-zinc-500">{userEmail}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified via Clerk
                      </span>
                    </div>
                  </div>
                  <SettingRow label="Account Type" desc="Your plan tier and recruiter permissions.">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      Pro Plan
                    </span>
                  </SettingRow>
                  <SettingRow label="Timezone" desc="Used for scheduling and digest delivery.">
                    <select className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40">
                      <option>IST (UTC+5:30)</option>
                      <option>UTC</option>
                      <option>EST (UTC-5)</option>
                      <option>PST (UTC-8)</option>
                    </select>
                  </SettingRow>
                </Section>

                <Section title="Security" desc="Authentication and session management." icon={Shield}>
                  <SettingRow label="Two-Factor Authentication" desc="Adds an extra layer of security to your account.">
                    <span className="text-xs text-zinc-500">Managed by Clerk</span>
                  </SettingRow>
                  <SettingRow label="Active Sessions" desc="Devices currently signed into your account.">
                    <button className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">Manage →</button>
                  </SettingRow>
                </Section>
              </div>
            )}

            {/* ══════════════ VOICE AGENT ══════════════ */}
            {activeSection === 'voice-agent' && (
              <div className="space-y-4">
                <Section title="Agent Identity" desc="Configure how your AI recruiter presents itself." icon={Bot}>
                  <SettingRow label="Agent Name" desc="The name the AI introduces itself as to candidates.">
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="bg-zinc-800/60 border border-zinc-700/60 text-white text-sm rounded-lg px-3 py-1.5 w-36 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                  </SettingRow>
                  <SettingRow label="Voice Type" desc="Select the voice persona for your AI agent.">
                    <select
                      value={voiceType}
                      onChange={(e) => setVoiceType(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    >
                      <option value="professional-female">Professional Female</option>
                      <option value="professional-male">Professional Male</option>
                      <option value="neutral">Neutral</option>
                      <option value="warm-female">Warm Female</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Language" desc="Primary language for the voice interview.">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="en-IN">English (India)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Speaking Rate" desc="Controls how fast the AI speaks to candidates.">
                    <select
                      value={speakingRate}
                      onChange={(e) => setSpeakingRate(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    >
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </SettingRow>
                  <SettingRow
                    label="Silence Timeout"
                    desc="Seconds of candidate silence before the agent prompts for a response."
                  >
                    <select
                      value={silenceTimeout}
                      onChange={(e) => setSilenceTimeout(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    >
                      {['5','8','10','15','20'].map((v) => <option key={v} value={v}>{v}s</option>)}
                    </select>
                  </SettingRow>
                </Section>

                <Section title="Interview Messages" desc="Customize what the agent says at the start and end." icon={Mic}>
                  <div className="py-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Intro Message</label>
                      <textarea
                        rows={4}
                        value={introMessage}
                        onChange={(e) => setIntroMessage(e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outro / Closing Message</label>
                      <textarea
                        rows={3}
                        value={outroMessage}
                        onChange={(e) => setOutroMessage(e.target.value)}
                        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 resize-none"
                      />
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* ══════════════ INTERVIEW CONFIG ══════════════ */}
            {activeSection === 'interviews' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Configure the number of questions, max answer duration, and scoring focus for each interview type. Toggle a type off to disable it from your invite flow.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries(interviewConfigs).map(([type, config]) => (
                    <InterviewTypeCard
                      key={type}
                      type={type}
                      color="purple"
                      config={config}
                      onChange={(patch) => patchConfig(type, patch)}
                    />
                  ))}
                </div>

                <Section title="Scoring Weights" desc="How the AI weights each dimension when computing a final score." icon={Sliders}>
                  {[
                    { label: 'Communication Clarity', key: 'comm', default: 30 },
                    { label: 'Technical Accuracy',    key: 'tech', default: 40 },
                    { label: 'Culture Alignment',     key: 'cult', default: 20 },
                    { label: 'Confidence & Energy',   key: 'conf', default: 10 },
                  ].map((dim) => (
                    <SettingRow key={dim.key} label={dim.label} desc={`Weight: ${dim.default}% of total score`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="0" max="100" defaultValue={dim.default}
                          className="w-24 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-purple-500"
                        />
                        <span className="text-xs font-bold text-purple-400 w-8 text-right">{dim.default}%</span>
                      </div>
                    </SettingRow>
                  ))}
                </Section>
              </div>
            )}

            {/* ══════════════ PROMPT SETTINGS ══════════════ */}
            {activeSection === 'prompts' && (
              <div className="space-y-4">
                <Section title="AI System Prompt" desc="The core instruction set for your AI voice agent." icon={Sparkles}>
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Prompt</label>
                      <button
                        onClick={() => setSystemPrompt(DEFAULT_SETTINGS.systemPrompt)}
                        className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset to default
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 resize-none font-mono text-xs leading-relaxed"
                    />
                    <p className="text-[10px] text-zinc-600">{systemPrompt.length} characters</p>
                  </div>
                </Section>

                <Section title="Screening Questions" desc="Default questions used in screening interviews." icon={ListChecks}>
                  <div className="py-4">
                    <QuestionList questions={screeningQs} onChange={setScreeningQs} />
                  </div>
                </Section>

                <Section title="Technical Interview Questions" desc="Used for in-depth technical evaluations." icon={ListChecks}>
                  <div className="py-4">
                    <QuestionList questions={technicalQs} onChange={setTechnicalQs} />
                  </div>
                </Section>

                <Section title="HR Final Interview Questions" desc="Behavioural and compensation-related questions." icon={ListChecks}>
                  <div className="py-4">
                    <QuestionList questions={hrQs} onChange={setHrQs} />
                  </div>
                </Section>
              </div>
            )}

            {/* ══════════════ AUTOMATION ══════════════ */}
            {activeSection === 'automation' && (
              <div className="space-y-4">
                <Section title="Auto-Invite" desc="Automatically send interview invites to highly matched candidates." icon={Zap}>
                  <SettingRow label="Enable Auto-Invite" desc="Sends invites automatically when a candidate exceeds the match threshold.">
                    <Toggle checked={autoInvite} onChange={setAutoInvite} />
                  </SettingRow>
                  {autoInvite && (
                    <SettingRow label="Match Score Threshold" desc={`Only auto-invite candidates scoring above ${autoInviteThreshold}%.`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="50" max="100" value={autoInviteThreshold}
                          onChange={(e) => setAutoInviteThreshold(Number(e.target.value))}
                          className="w-28 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-purple-500"
                        />
                        <span className="text-sm font-bold text-purple-400 w-10 text-right">{autoInviteThreshold}%</span>
                      </div>
                    </SettingRow>
                  )}
                </Section>

                <Section title="Auto-Shortlisting" desc="Automatically mark candidates as shortlisted based on interview score." icon={CheckCircle2}>
                  <SettingRow label="Enable Auto-Shortlist" desc="Flags candidates who score above the threshold for recruiter review.">
                    <Toggle checked={autoShortlist} onChange={setAutoShortlist} />
                  </SettingRow>
                  {autoShortlist && (
                    <SettingRow label="Shortlist Score Threshold" desc={`Candidates scoring ≥ ${shortlistThreshold}% are auto-shortlisted.`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="50" max="100" value={shortlistThreshold}
                          onChange={(e) => setShortlistThreshold(Number(e.target.value))}
                          className="w-28 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-700 accent-purple-500"
                        />
                        <span className="text-sm font-bold text-purple-400 w-10 text-right">{shortlistThreshold}%</span>
                      </div>
                    </SettingRow>
                  )}
                </Section>

                <Section title="Auto-Send Results" desc="Automatically email interview results to candidates after completion." icon={Mail}>
                  <SettingRow label="Send Results to Candidates" desc="Candidates receive a summary report after completing their interview.">
                    <Toggle checked={autoSendResults} onChange={setAutoSendResults} />
                  </SettingRow>
                </Section>

                <Section title="Link Expiry" desc="How long interview links remain valid after sending." icon={Clock}>
                  <SettingRow label="Invite Link Expiry" desc="Links expire after this many days if not used.">
                    <select
                      value={autoExpireDays}
                      onChange={(e) => setAutoExpireDays(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    >
                      {['3','5','7','14','30'].map((v) => <option key={v} value={v}>{v} days</option>)}
                    </select>
                  </SettingRow>
                  <SettingRow label="Auto-Schedule Follow-up" desc="Automatically remind candidates 24h before their invite expires.">
                    <Toggle checked={autoSchedule} onChange={setAutoSchedule} />
                  </SettingRow>
                </Section>
              </div>
            )}

            {/* ══════════════ NOTIFICATIONS ══════════════ */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <Section title="Email Alerts" desc="Control which events trigger an email to you." icon={Bell}>
                  <SettingRow label="Interview Completed" desc="Get notified immediately when a candidate finishes their interview.">
                    <Toggle checked={notifyOnComplete} onChange={setNotifyOnComplete} />
                  </SettingRow>
                  <SettingRow label="Score Threshold Alert" desc="Get alerted when a candidate scores above 85%.">
                    <Toggle checked={notifyThreshold} onChange={setNotifyThreshold} />
                  </SettingRow>
                  <SettingRow label="Invite Expired" desc="Notify when an interview invite link expires unused.">
                    <Toggle checked={false} onChange={() => {}} />
                  </SettingRow>
                </Section>

                <Section title="Daily Digest" desc="A summary email of all interview activity from the previous day." icon={Mail}>
                  <SettingRow label="Enable Daily Digest" desc="Receive a daily summary email of interview completions and pending candidates.">
                    <Toggle checked={notifyDailyDigest} onChange={setNotifyDailyDigest} />
                  </SettingRow>
                  {notifyDailyDigest && (
                    <SettingRow label="Digest Delivery Time" desc="What time should the digest be delivered to your inbox?">
                      <input
                        type="time"
                        value={digestTime}
                        onChange={(e) => setDigestTime(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500/40 cursor-pointer"
                      />
                    </SettingRow>
                  )}
                </Section>
              </div>
            )}

            {/* ══════════════ INTEGRATIONS ══════════════ */}
            {activeSection === 'integrations' && (
              <div className="space-y-4">
                {[
                  {
                    icon: Mail, name: 'Plunk (Email)', desc: 'Transactional email for interview invites and result reports.',
                    status: 'connected', statusLabel: 'Connected', detail: 'PLUNK_API_KEY configured in .env',
                    statusColor: 'text-emerald-400', statusBg: 'bg-emerald-500/10', statusBorder: 'border-emerald-500/20',
                  },
                  {
                    icon: Calendar, name: 'Google Calendar', desc: 'Sync interview slots with recruiter calendar availability.',
                    status: 'connected', statusLabel: 'Active', detail: 'Sync enabled — auto-slots are active',
                    statusColor: 'text-emerald-400', statusBg: 'bg-emerald-500/10', statusBorder: 'border-emerald-500/20',
                  },
                  {
                    icon: Bot, name: 'Vapi (Voice AI)', desc: 'Powers the real-time voice interview experience.',
                    status: 'connected', statusLabel: 'Connected', detail: 'VAPI_API_KEY configured',
                    statusColor: 'text-emerald-400', statusBg: 'bg-emerald-500/10', statusBorder: 'border-emerald-500/20',
                  },
                  {
                    icon: Shield, name: 'Clerk (Auth)', desc: 'Recruiter authentication and session management.',
                    status: 'connected', statusLabel: 'Active', detail: 'Development keys in use',
                    statusColor: 'text-emerald-400', statusBg: 'bg-emerald-500/10', statusBorder: 'border-emerald-500/20',
                  },
                  {
                    icon: AlertCircle, name: 'ATS Integration', desc: 'Connect your Applicant Tracking System to sync candidates automatically.',
                    status: 'disconnected', statusLabel: 'Not Connected', detail: 'Requires configuration',
                    statusColor: 'text-zinc-500', statusBg: 'bg-zinc-800/40', statusBorder: 'border-zinc-700/40',
                  },
                ].map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <Card key={integration.name} className="bg-zinc-900/40 border-zinc-800/60">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{integration.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{integration.desc}</p>
                            <p className="text-[10px] text-zinc-700 mt-0.5">{integration.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${integration.statusColor} ${integration.statusBg} ${integration.statusBorder}`}>
                            {integration.statusLabel}
                          </span>
                          {integration.status === 'disconnected' && (
                            <Button className="text-xs h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg border-0 cursor-pointer">
                              Connect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  );
}
