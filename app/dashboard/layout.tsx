import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SettingsProvider } from '@/context/settings-context';
import { Suspense } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-black w-full text-white">
          <Suspense fallback={<div className="w-[250px] shrink-0 bg-zinc-950 border-r border-zinc-900" />}>
            <Sidebar />
          </Suspense>
          <main className="flex-1 flex flex-col overflow-hidden bg-black">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
