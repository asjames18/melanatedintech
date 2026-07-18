import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/knowledge/choosing-your-first-agent-workflow")({
  beforeLoad: () => {
    throw redirect({
      to: "/knowledge/$slug",
      params: { slug: "choose-your-first-agent-workflow" },
      statusCode: 301,
      replace: true,
    });
  },
});
