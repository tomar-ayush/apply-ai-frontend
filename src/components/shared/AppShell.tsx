import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/shared/AppSidebar";

export function AppShell() {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
