import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/knowledge/measuring-if-your-agent-actually-works",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/knowledge/$slug",
      params: { slug: "evaluating-agents-evals" },
      statusCode: 301,
      replace: true,
    });
  },
});
