import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /agents. The marketplace list lives in agents.index.tsx and
// each agent in agents.$slug.tsx; this renders whichever child matches so the
// detail page is no longer swallowed by the list route.
export const Route = createFileRoute("/agents")({
  component: () => <Outlet />,
});
