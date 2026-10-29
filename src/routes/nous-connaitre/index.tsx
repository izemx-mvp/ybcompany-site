import { createFileRoute, redirect } from "@tanstack/react-router";

// Live parent URL: permanently redirects to its first child page.
export const Route = createFileRoute("/nous-connaitre/")({
  beforeLoad: () => {
    throw redirect({ to: "/nous-connaitre/philosophie/", statusCode: 301 });
  },
});
