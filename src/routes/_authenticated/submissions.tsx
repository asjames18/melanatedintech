import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /submissions. The list lives in submissions.index.tsx and the
// editor in submissions.$id.tsx; this renders whichever child matches so the
// editor isn't swallowed by the list.
export const Route = createFileRoute("/_authenticated/submissions")({
  component: () => <Outlet />,
});
