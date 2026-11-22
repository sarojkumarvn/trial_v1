import {
  createContext,
  useContext,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from "react";
import type { Workspace } from "./data";
export const root = "/admin/dashboard";
export const destinations = [
  ["", "Overview"],
  ["projects", "Projects"],
  ["approvals", "Plan approvals"],
  ["tasks", "Tasks"],
  ["team", "Team"],
  ["settings", "Workspace settings"],
] as const;
export function go(suffix = "") {
  history.pushState({}, "", root + suffix);
  window.dispatchEvent(new Event("popstate"));
  window.scrollTo(0, 0);
}
export function follow(
  e: MouseEvent<HTMLAnchorElement>,
  suffix: string,
  after?: () => void,
) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return;
  e.preventDefault();
  go(suffix);
  after?.();
}
const subscribe = (fn: () => void) => {
  window.addEventListener("popstate", fn);
  return () => window.removeEventListener("popstate", fn);
};
export function useRoute() {
  return useSyncExternalStore(
    subscribe,
    () => location.pathname + location.search,
  );
}
export const WorkspaceContext = createContext<{
  w: Workspace;
  setW: Dispatch<SetStateAction<Workspace>>;
} | null>(null);
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw Error("Workspace unavailable");
  return ctx;
}
