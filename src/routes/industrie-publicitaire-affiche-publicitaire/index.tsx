import { createFileRoute, redirect } from "@tanstack/react-router";

// Live parent URL: permanently redirects to its first child page.
export const Route = createFileRoute("/industrie-publicitaire-affiche-publicitaire/")({
  beforeLoad: () => {
    throw redirect({
      to: "/industrie-publicitaire-affiche-publicitaire/impression-grand-format/",
      statusCode: 301,
    });
  },
});
