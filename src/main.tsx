import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Boundary } from "./Boundary";

const dashboard = /^\/admin\/dashboard(?:\/|$)/.test(location.pathname);
export const Root = lazy(() =>
  dashboard ? import("./admin/Dashboard") : import("./PublicApp"),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Boundary>
      <Suspense fallback={<p role="status">Loading workspace…</p>}>
        <Root />
      </Suspense>
    </Boundary>
  </StrictMode>,
);
