import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /admin. The dashboard lives in admin.index.tsx and the
// sub-pages in admin.analytics.tsx / admin.catalog.tsx; this renders whichever
// child matches so those sub-pages aren't swallowed by the dashboard.
export const Route = createFileRoute("/_authenticated/admin")({
  component: () => <Outlet />,
});
