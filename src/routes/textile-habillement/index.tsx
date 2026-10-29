import { createFileRoute, redirect } from "@tanstack/react-router";

// Live parent URL: permanently redirects to its first child page.
export const Route = createFileRoute("/textile-habillement/")({
  beforeLoad: () => {
    throw redirect({ to: "/textile-habillement/notre-valeur-ajoutee/", statusCode: 301 });
  },
});
