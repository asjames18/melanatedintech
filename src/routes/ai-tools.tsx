import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /ai-tools. The tool library index lives in ai-tools.index.tsx,
// higher education hub in ai-tools.higher-education.tsx, and individual tools in ai-tools.$slug.tsx.
export const Route = createFileRoute("/ai-tools")({
  component: () => <Outlet />,
});
