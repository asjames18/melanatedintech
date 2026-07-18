import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/knowledge/controlling-agent-costs")({
  beforeLoad: () => {
    throw redirect({
      to: "/knowledge/$slug",
      params: { slug: "ai-agent-cost-control-playbook" },
      statusCode: 301,
      replace: true,
    });
  },
});
