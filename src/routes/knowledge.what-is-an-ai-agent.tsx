import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/knowledge/what-is-an-ai-agent")({
  beforeLoad: () => {
    throw redirect({
      to: "/knowledge/$slug",
      params: { slug: "ai-agents-in-plain-english" },
      statusCode: 301,
      replace: true,
    });
  },
});
