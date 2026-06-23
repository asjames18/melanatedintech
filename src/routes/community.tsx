import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /community. The board lives in community.index.tsx and each
// thread in community.$id.tsx; this renders whichever child matches so the
// thread page is no longer swallowed by the list route.
export const Route = createFileRoute("/community")({
  component: () => <Outlet />,
});
