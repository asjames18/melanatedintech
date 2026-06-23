import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /products. The list lives in products.index.tsx and each
// product in products.$slug.tsx; this renders whichever child matches so the
// detail page is no longer swallowed by the list route.
export const Route = createFileRoute("/products")({
  component: () => <Outlet />,
});
