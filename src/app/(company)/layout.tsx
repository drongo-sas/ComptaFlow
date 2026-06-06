import { SidebarProvider } from "@/lib/sidebar-context";
import { CompanySidebar } from "@/components/company-sidebar";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <CompanySidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SidebarProvider>
  );
}
