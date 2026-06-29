'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser, useClerk, SignOutButton } from '@clerk/nextjs';
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  Settings,
  ChevronDown,
  LogOut,
  Zap,
  AudioLines,
  BrainCircuit,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

const sidebarItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs' },
  { id: 'candidates', label: 'Candidates', icon: Users, href: '/dashboard/candidates' },
  { id: 'schedules', label: 'Schedules / Interview', icon: Calendar, href: '/dashboard/schedules' },
  { id: 'ai-coach', label: 'AI Growth Coach', icon: BrainCircuit, href: '/dashboard/ai-coach', badge: 'AI' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { id: 'documentation', label: 'Documentation', icon: FileText, href: '/dashboard/doc' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [isPricingOpen, setIsPricingOpen] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState<string | null>(null);
  const [userPlan, setUserPlan] = React.useState<string>('free');

  const fetchPlan = React.useCallback(async () => {
    try {
      const res = await fetch('/api/user/plan');
      const data = await res.json();
      if (data && data.plan) {
        setUserPlan(data.plan);
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchPlan();
    }
  }, [user, fetchPlan]);

  React.useEffect(() => {
    if (paymentStatus === 'success') {
      fetchPlan();
    }
  }, [paymentStatus, fetchPlan]);

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setIsUpgrading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initiate checkout');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to upgrade plan. Please try again.');
      setIsUpgrading(null);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  const userImage = user.imageUrl;
  const userName = user.firstName || user.username || 'User';
  const userEmail = user.primaryEmailAddress?.emailAddress || '';

  return (
    <>
      <ShadcnSidebar className="border-r border-zinc-800/80 bg-black" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-zinc-800/80 bg-black">
        <div className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
            <AudioLines className="h-5 w-5" />
          </div>
          <div className="group-data-[state=collapsed]:hidden transition-all duration-200">
            <p className="font-bold text-white text-base tracking-wide leading-none">vocalHire</p>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wider mt-1.5 uppercase">AI Voice Screening</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-3 py-6 bg-black">
        <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-data-[state=collapsed]:hidden">
          Navigation
        </div>
        <SidebarMenu className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            // Check if active (precise match for home, starts-with for others)
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-2 ${
                    isActive
                      ? item.id === 'ai-coach'
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/50'
                        : 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${
                    isActive && item.id === 'ai-coach' ? 'text-violet-400' : ''
                  }`} />
                  <span className="group-data-[state=collapsed]:hidden flex-1">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="group-data-[state=collapsed]:hidden text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                      {item.badge as string}
                    </span>
                  )}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-zinc-800/80 p-4 space-y-4 bg-black">
        {/* Current Plan Display */}
        <div className="px-3 py-2 bg-zinc-900/40 border border-zinc-800/60 rounded-xl flex items-center justify-between text-xs group-data-[state=collapsed]:hidden">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Zap className={`h-3.5 w-3.5 ${userPlan !== 'free' ? 'text-purple-400 fill-current' : 'text-zinc-650'}`} />
            <span className="font-medium capitalize">{userPlan} Plan</span>
          </div>
          {userPlan === 'free' ? (
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-800 uppercase tracking-wider">
              Free Trial
            </span>
          ) : userPlan === 'pro' ? (
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
              Pro
            </span>
          ) : (
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wider">
              Enterprise
            </span>
          )}
        </div>

        {/* Upgrade Plan Button */}
        <Button 
          onClick={() => setIsPricingOpen(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 rounded-lg shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer group-data-[state=collapsed]:hidden"
        >
          <Zap className="h-4 w-4" />
          Upgrade Plan
        </Button>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900/60 transition-colors group border border-zinc-800/20 cursor-pointer group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-2">
              <img
                src={userImage}
                alt={userName}
                className="h-9 w-9 rounded-full border border-purple-500/30 shrink-0"
              />
              <div className="flex-1 text-left min-w-0 group-data-[state=collapsed]:hidden">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{userEmail}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 group-data-[state=collapsed]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 text-zinc-300 cursor-pointer focus:bg-purple-600/20 focus:text-purple-300">
                <Settings className="h-4 w-4" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
                <button className="flex w-full items-center gap-2 text-red-400 cursor-pointer focus:bg-red-950/20 focus:text-red-300 bg-transparent border-0 outline-none text-left font-normal text-xs py-1.5 px-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>

    {/* Pricing Upgrade Modal Dialog */}
    <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 text-zinc-200 p-6 rounded-2xl shadow-2xl overflow-hidden border">
        <DialogHeader className="pb-4 border-b border-zinc-900">
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400 fill-current" />
            Upgrade Your Recruitment Plan
          </DialogTitle>
          <DialogDescription className="text-zinc-550 text-xs mt-1">
            Unlock premium features, custom AI settings, and run unlimited audio screening sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          {/* Pro Plan Card */}
          <div className="relative border border-purple-500/30 bg-purple-950/5 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-md group">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-purple-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
              Popular
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Pro Recruiter</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Perfect for growing startups and active staffing agencies.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$49</span>
                <span className="text-xs text-zinc-650">/ month</span>
              </div>
              <ul className="text-xs space-y-2.5 text-zinc-350 pt-3 border-t border-zinc-900">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span><strong>100</strong> AI interviews / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>Advanced candidate insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>Custom email invite configurations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>Interactive coaching recommendations</span>
                </li>
              </ul>
            </div>
            <Button
              onClick={() => handleUpgrade('pro')}
              disabled={isUpgrading !== null}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl cursor-pointer border-0 active:scale-[0.98] transition-all"
            >
              {isUpgrading === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
            </Button>
          </div>

          {/* Enterprise Card */}
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all shadow-md group">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Enterprise Plan</h4>
                <p className="text-[10px] text-zinc-500 mt-1">For organizations requiring tailored voices and infinite bandwidth.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$199</span>
                <span className="text-xs text-zinc-650">/ month</span>
              </div>
              <ul className="text-xs space-y-2.5 text-zinc-350 pt-3 border-t border-zinc-900">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                  <span><strong>Unlimited</strong> screening interviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                  <span>Customizable AI voice coach profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                  <span>Premium voice cloning support</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                  <span>24/7 priority support dashboard</span>
                </li>
              </ul>
            </div>
            <Button
              onClick={() => handleUpgrade('enterprise')}
              disabled={isUpgrading !== null}
              className="w-full mt-6 bg-zinc-800 hover:bg-zinc-750 text-white font-bold py-2.5 rounded-xl cursor-pointer border-0 active:scale-[0.98] transition-all"
            >
              {isUpgrading === 'enterprise' ? 'Redirecting...' : 'Upgrade to Enterprise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
