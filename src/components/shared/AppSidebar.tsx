import { LayoutGrid, Briefcase, Settings, LogOut, Puzzle, MessageSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BrandMark } from "@/components/shared/BrandMark";
import { ConnectionIndicatorConnected } from "@/components/shared/ConnectionIndicator";
import { FeedbackDialog } from "@/components/shared/FeedbackDialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: false },
  { to: "/jobs", label: "Jobs", icon: Briefcase, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
  { to: "/install-extension", label: "Install Extension", icon: Puzzle, end: false },
];

export function AppSidebar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <aside className="flex h-svh w-14 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:w-56">
      <div className="flex items-center gap-2.5 px-3 py-4 lg:px-4">
        <BrandMark />
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-medium text-sidebar-foreground">ApplyAI</p>
          <p className="font-mono text-[10px] text-sidebar-foreground/40">v0.1.0-alpha</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:justify-start",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          title="Share feedback"
          className="flex w-full items-center justify-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground lg:justify-start"
        >
          <MessageSquare className="size-3.5" />
          <span className="hidden lg:inline">Share feedback</span>
        </button>
        <button
          type="button"
          onClick={() => {
            auth.logout();
            navigate("/", { replace: true });
          }}
          title="Log out"
          className="flex w-full items-center justify-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground lg:justify-start"
        >
          <LogOut className="size-3.5" />
          <span className="hidden lg:inline">Log out</span>
        </button>
        <Separator className="bg-sidebar-border" />
        <ConnectionIndicatorConnected />
      </div>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </aside>
  );
}
