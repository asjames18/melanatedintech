import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/knowledge/ai-agents-for-ministry")({
  beforeLoad: () => {
    throw redirect({
      to: "/knowledge/$slug",
      params: { slug: "ai-in-ministry-a-gentle-start" },
      statusCode: 301,
      replace: true,
    });
  },
});
