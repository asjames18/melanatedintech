import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /knowledge. The list lives in knowledge.index.tsx and each
// article in knowledge.$slug.tsx; this just renders whichever child matches so
// the detail page is no longer swallowed by the list route.
export const Route = createFileRoute("/knowledge")({
  component: () => <Outlet />,
});
