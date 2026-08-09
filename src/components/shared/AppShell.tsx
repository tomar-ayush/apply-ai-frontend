import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { ProductTour } from "@/components/shared/ProductTour";

export function AppShell() {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
        <ProductTour />
      </main>
    </div>
  );
}
