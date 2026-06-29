import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import {
  ArrowRight,
  AudioLines,
  Bot,
  CalendarClock,
  Clock3,
  Mic,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";

const highlights = [
  {
    title: "Instant candidate intake",
    description:
      "Bulk-import phone lists, CRM contacts, and applicant data in seconds so outreach starts immediately.",
    icon: UsersRound,
  },
  {
    title: "Voice-led screening interviews",
    description:
      "The agent conducts realistic conversations, evaluates responses, and flags strong candidates in real time.",
    icon: Mic,
  },
  {
    title: "Smart scheduling and follow-up",
    description:
      "Automatically book interviews, send reminders, and escalate top-fit candidates to the recruiter queue.",
    icon: CalendarClock,
  },
];

const capabilities = [
  "Natural voice conversations with human-like pacing and tone",
  "Role-aware question flows for technical, sales, and operations hiring",
  "Automated candidate scoring with recruiter-ready insights",
  "Calendar integration for interview scheduling and rescheduling",
];

const workflowSteps = [
  {
    step: "01",
    title: "Import and organize",
    description: "Sync candidate lists, role requirements, and screening criteria into one structured intake layer.",
    icon: UsersRound,
  },
  {
    step: "02",
    title: "Launch a voice interview",
    description: "vocalHire AI conducts a polished conversation that feels human, consistent, and fully guided.",
    icon: Mic,
  },
  {
    step: "03",
    title: "Route qualified candidates",
    description: "Deliver ranked summaries, next steps, and booking recommendations to your recruiting team instantly.",
    icon: CalendarClock,
  },
];

const metrics = [
  { value: "1.8k+", label: "Candidates screened weekly" },
  { value: "92%", label: "Interview completion rate" },
  { value: "4.9/5", label: "Recruiter satisfaction" },
];

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-slate-600/10 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 text-purple-300 shadow-lg shadow-purple-500/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">vocalHire AI</p>
            <p className="text-sm text-slate-400">Recruiter Voice Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <Button asChild variant="outline" className="rounded-full border-zinc-700 bg-zinc-900/70 text-zinc-100 hover:bg-zinc-800 cursor-pointer">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <Badge className="rounded-full border-purple-400/30 bg-purple-500/10 px-3 py-1 text-purple-300">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Advanced AI recruiting from first call to interview confirmation
            </Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Automate the first-round recruiting experience with a voice-first hiring agent.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Import candidate contacts, launch intelligent voice interviews, and let vocalHire AI qualify talent, summarize feedback, and schedule interviews with precision.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!isSignedIn ? (
                <Button asChild className="rounded-full bg-purple-600 px-6 py-6 text-white hover:bg-purple-500 cursor-pointer">
                  <Link href="/sign-up">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="rounded-full bg-purple-600 px-6 py-6 text-white hover:bg-purple-500 cursor-pointer">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="rounded-full border-zinc-700 bg-zinc-900/70 px-6 py-6 text-zinc-100 hover:bg-zinc-800">
                Explore capabilities
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm shadow-purple-950/20">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 text-white shadow-2xl shadow-purple-950/30 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live recruiter workflow</p>
                <p className="text-xl font-semibold">Candidate screening control center</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-purple-500/15 px-3 py-1 text-sm text-purple-300">
                <AudioLines className="h-4 w-4" />
                18 calls live
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Maya Chen</p>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-300">
                    Qualified
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  “The agent confirmed availability, validated salary expectations, and booked a panel interview.”
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Daniel Ortiz</p>
                  <span className="rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-300">
                    Needs review
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  “The voice agent captured experience details, flagged a gap, and recommended a follow-up call.”
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Next interview slot</span>
                  <span className="text-purple-300">Tuesday · 2:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-slate-800 bg-slate-900/80 shadow-lg shadow-purple-950/20 backdrop-blur">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-7 text-slate-400">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-purple-950/10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                Advanced capabilities
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Built for modern recruiting teams that need speed, accuracy, and scale.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                vocalHire AI combines natural voice conversations, structured screening logic, and workflow automation into one intelligent hiring layer.
              </p>
            </div>

            <div className="space-y-4">
              {capabilities.map((item) => (
                <div key={item} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="pt-2 text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl shadow-purple-950/20 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
                A thoughtful workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                A calm, consistent recruiting journey from first outreach to interview handoff.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-400">
                Every step is designed to feel professional and dependable while giving recruiters more time to focus on high-value conversations.
              </p>
            </div>

            <div className="space-y-4">
              {workflowSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-purple-300">{item.step}</span>
                          <p className="font-medium text-white">{item.title}</p>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">
                Ready to automate your first interviews?
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Elevate your recruiting workflow with voice intelligence.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Connect your applicant list, launch the agent, and start qualifying top talent around the clock.
              </p>
            </div>
            <Button asChild className="rounded-full bg-purple-600 px-6 py-6 text-white hover:bg-purple-500 cursor-pointer">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                Start recruiting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}