import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SettingsProvider } from '@/context/settings-context';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-black w-full text-white">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden bg-black">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
