import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import Link from 'next/link';

export default async function DocPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <DashboardHeader />
      
      {/* Floating Action Header (Hidden in Print) */}
      <div className="print:hidden border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-16 z-40 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-zinc-200">Documentation</span>
          </div>
          <button 
            id="print-btn-header"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            Export to PDF (Print)
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-10 print:p-0 print:text-black">
        {/* Client-side printable wrapper script */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const btn1 = document.getElementById('print-btn-header');
            const btn2 = document.getElementById('print-btn-body');
            if (btn1) btn1.addEventListener('click', function() { window.print(); });
            if (btn2) btn2.addEventListener('click', function() { window.print(); });
          });
          setTimeout(function() {
            const btn1 = document.getElementById('print-btn-header');
            const btn2 = document.getElementById('print-btn-body');
            if (btn1) btn1.onclick = function() { window.print(); };
            if (btn2) btn2.onclick = function() { window.print(); };
          }, 300);
        `}} />

        <div className="flex justify-between items-center print:hidden border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white">VocalHire System Documentation</h1>
            <p className="text-zinc-400 mt-2">Comprehensive architecture, features, database schema, and endpoint guides.</p>
          </div>
          <button
            id="print-btn-body"
            className="hidden md:flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            <span>📄 Save as PDF</span>
          </button>
        </div>

        {/* Documentation Content */}
        <article className="prose prose-invert max-w-none space-y-12 print:text-black print:prose-neutral">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-400 print:text-black border-b border-zinc-800 pb-2">1. Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 print:bg-white print:border-none print:p-0">
                <h3 className="text-lg font-bold text-white print:text-black mb-2">Frontend</h3>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300 text-sm print:text-black">
                  <li><strong>Next.js 15 (App Router)</strong>: Server-side rendering, routing structure, and backend routes.</li>
                  <li><strong>Styling (CSS)</strong>: Pure CSS with TailwindCSS utilities for glassmorphism.</li>
                  <li><strong>Icons & Interactions</strong>: Lucide React & Radix UI primitives.</li>
                </ul>
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 print:bg-white print:border-none print:p-0">
                <h3 className="text-lg font-bold text-white print:text-black mb-2">Backend & Database</h3>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300 text-sm print:text-black">
                  <li><strong>PostgreSQL (Neon DB)</strong>: Scale-to-zero serverless PostgreSQL cluster.</li>
                  <li><strong>Drizzle ORM</strong>: Lightweight, type-safe Postgres client queries.</li>
                  <li><strong>Self-Healing Engine</strong>: Self-migrating table creator that sets up columns on start.</li>
                </ul>
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/80 print:bg-white print:border-none print:p-0 md:col-span-2">
                <h3 className="text-lg font-bold text-white print:text-black mb-2">Third-Party API Integrations</h3>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300 text-sm print:text-black">
                  <li><strong>Clerk Auth</strong>: Secured authorization sessions using JWT session claims verification.</li>
                  <li><strong>Stripe</strong>: Pro/Enterprise billing subscription portal.</li>
                  <li><strong>AI Voice & Audio</strong>: Vapi Conversational Agents, Gemini Cognitive Engine, and Murf Audio Processing.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-400 print:text-black border-b border-zinc-800 pb-2">2. Architecture & Design</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white print:text-black mb-2">Relational Database Schemas</h3>
                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 text-xs font-mono overflow-x-auto text-zinc-300 print:text-black print:border-zinc-300">
                  <p className="font-bold text-white print:text-black mb-2">// users</p>
                  <p>id: uuid (PK, defaultRandom)</p>
                  <p>email: text (notNull, unique)</p>
                  <p>name: text</p>
                  <p>plan: text (notNull, default: 'free')</p>
                  <p className="font-bold text-white print:text-black mt-4 mb-2">// jobs</p>
                  <p>id: uuid (PK)</p>
                  <p>recruiter_id: uuid (FK -&gt; users.id)</p>
                  <p>title: text (notNull)</p>
                  <p>status: text (notNull, default: 'Active')</p>
                  <p className="font-bold text-white print:text-black mt-4 mb-2">// candidates</p>
                  <p>id: uuid (PK)</p>
                  <p>recruiter_id: uuid (FK -&gt; users.id)</p>
                  <p>full_name: text (notNull)</p>
                  <p>role: text</p>
                  <p>score: text</p>
                  <p className="font-bold text-white print:text-black mt-4 mb-2">// schedules</p>
                  <p>id: uuid (PK)</p>
                  <p>candidate_id: uuid (FK -&gt; candidates.id)</p>
                  <p>job_id: uuid (FK -&gt; jobs.id)</p>
                  <p>interview_url: text</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-400 print:text-black border-b border-zinc-800 pb-2">3. Features & Capabilities</h2>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed print:text-black">
              <p>
                <strong>Live Metrics Tracking</strong>: Real system stats are queried directly from the Neon PostgreSQL database using Drizzle ORM.
                Active jobs, screening status rates, and candidate profile lists update immediately upon page mount.
              </p>
              <p>
                <strong>Subscription Management</strong>: Built on top of the Stripe Checkout REST endpoints. Support for Pro Recruiter (\$49/mo) and Enterprise Plan (\$199/mo) tiers. Provides clean mock simulator fallbacks in environments where credentials are not initialized.
              </p>
              <p>
                <strong>Clerk Auth Core Wrapper</strong>: Ensures routes are securely protected on server levels. Utilizes JWT token parsing claims for instant authentication verification.
              </p>
            </div>
          </section>

          <section className="space-y-4 print:page-break-before">
            <h2 className="text-2xl font-bold text-purple-400 print:text-black border-b border-zinc-800 pb-2">4. Configuration Variables</h2>
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/80 print:border-zinc-300 print:text-black text-xs font-mono space-y-1">
              <p>DATABASE_URL=postgresql://neondb_owner:***@ep-***.neon.tech/AI_Recruiter</p>
              <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***</p>
              <p>CLERK_SECRET_KEY=sk_test_***</p>
              <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***</p>
              <p>STRIPE_SECRET_KEY=sk_test_***</p>
            </div>
          </section>

        </article>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            header {
              display: none !important;
            }
            main {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}} />
      </div>
    </div>
  );
}
