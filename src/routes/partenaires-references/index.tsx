import { createFileRoute, redirect } from "@tanstack/react-router";

// Live parent URL: permanently redirects to its first child page.
export const Route = createFileRoute("/partenaires-references/")({
  beforeLoad: () => {
    throw redirect({
      to: "/partenaires-references/textile-habillement-mode-sport/",
      statusCode: 301,
    });
  },
});
