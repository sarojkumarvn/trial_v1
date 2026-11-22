import { useState, useEffect, lazy, Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";

import { DataTable } from "@/components/data-table";
import { Projects, NewProject } from "./Projects";
import { Team, Settings } from "./Team";
import { demoWorkspace } from "./data";
import { root, destinations, useRoute, WorkspaceContext } from "./context";
import "./theme.css";
const ActivityChart = lazy(() => import("@/components/chart-area-interactive"));
const descriptions = [
  "Plan reviews, ownership gaps, and delivery risks across your workspace.",
  "Track project leads, milestones, and workstreams.",
  "Review proposed owners and deadlines before delivery begins.",
  "Find, assign, and track work across projects.",
  "Manage workspace membership and pending invitations.",
  "Manage your workspace name and delivery preferences.",
];
export default function Dashboard() {
  const [w, setW] = useState(demoWorkspace),
    [creating, setCreating] = useState(false),
    [origin, setOrigin] = useState<HTMLElement | null>(null);
  const url = useRoute(),
    slug = url
      .split("?")[0]
      .slice(root.length)
      .replace(/^\/|\/$/g, ""),
    idx = destinations.findIndex(([key]) => key === slug),
    title = destinations[idx]?.[1] || "Page unavailable";
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);
  useEffect(() => {
    document.title = title + " · Trial";
  }, [title]);
  return (
    <WorkspaceContext.Provider value={{ w, setW }}>
      <SidebarProvider>
        <AppSidebar
          active={slug}
          onNew={() => {
            setOrigin(document.activeElement as HTMLElement);
            setCreating(true);
          }}
        />
        <SidebarInset>
          <SiteHeader title={title} />
          <div className="dash-content">
            <div className="page-heading">
              <div>
                <h1 tabIndex={-1} data-nav-focus>
                  {idx === 0 ? "Workspace overview" : title}
                </h1>
                <p>{descriptions[idx]}</p>
              </div>
              {idx === 0 && (
                <div className="today">
                  <CalendarDays size={14} />
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
            {idx === 0 ? (
              <>
                <SectionCards />
                <Suspense
                  fallback={
                    <div className="activity-loading" role="status">
                      Loading delivery activity…
                    </div>
                  }
                >
                  <ActivityChart />
                </Suspense>
                <DataTable key="queue" />
              </>
            ) : idx === 1 || idx === 2 ? (
              <Projects key={slug} approvals={idx === 2} />
            ) : idx === 3 ? (
              <DataTable key="tasks" full />
            ) : idx === 4 ? (
              <Team />
            ) : idx === 5 ? (
              <Settings />
            ) : (
              <a href={root}>Back to overview</a>
            )}
          </div>
        </SidebarInset>
        {creating && (
          <NewProject origin={origin} close={() => setCreating(false)} />
        )}
      </SidebarProvider>
    </WorkspaceContext.Provider>
  );
}
