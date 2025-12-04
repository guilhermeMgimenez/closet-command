import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-16 border-b border-border/50 backdrop-blur-xl bg-card/80 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-glow rounded-full" />
              <h1 className="text-lg font-semibold text-foreground">
                Roupas - Administração
              </h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
