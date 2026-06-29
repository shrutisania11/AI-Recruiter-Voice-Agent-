'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Briefcase,
  Users,
  Calendar,
  Settings,
} from 'lucide-react';

const routeConfig: Record<string, { label: string; icon: any }> = {
  '/dashboard': { label: 'Home', icon: LayoutGrid },
  '/dashboard/jobs': { label: 'Jobs', icon: Briefcase },
  '/dashboard/candidates': { label: 'Candidates', icon: Users },
  '/dashboard/schedules': { label: 'Schedules / Interview', icon: Calendar },
  '/dashboard/settings': { label: 'Settings', icon: Settings },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  // Get active route configuration or default to Home
  const activeRoute = routeConfig[pathname] || { label: 'Home', icon: LayoutGrid };
  const RouteIcon = activeRoute.icon;

  return (
    <header className="border-b border-zinc-800 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Toggle & Breadcrumb Title */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-400 hover:text-zinc-200 cursor-pointer" />
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2 text-zinc-300">
          <RouteIcon className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-sm font-semibold tracking-wide text-white">{activeRoute.label}</span>
        </div>
      </div>

      {/* Right side: User Profile Avatar */}
      <div className="flex items-center gap-3">
        <img
          src={user.imageUrl}
          alt={user.firstName || 'User'}
          className="h-8 w-8 rounded-full border border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition-colors"
          title={user.firstName || 'Profile'}
        />
      </div>
    </header>
  );
}
