import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { ProductTour } from "@/components/shared/ProductTour";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/shared/BrandMark";

export function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row h-svh overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-semibold tracking-tight text-foreground">ApplyAI</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="shrink-0 -mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Menu className="size-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0">
            <AppSidebar isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <AppSidebar />
      
      <main className="flex-1 overflow-y-auto relative bg-background">
        <Outlet />
        <ProductTour />
      </main>
    </div>
  );
}
