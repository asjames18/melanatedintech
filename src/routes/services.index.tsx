import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The focused Work With Us page is the single public decision path for paid
 * services. Keeping this legacy URL as a redirect protects existing links
 * without presenting older, overlapping catalog entries as active offers.
 */
export const Route = createFileRoute("/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/work-with-us" });
  },
});
