import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /compare
export const Route = createFileRoute("/compare")({
  component: () => <Outlet />,
});
