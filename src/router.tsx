import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Every live URL ends with "/"; non-slash URLs redirect to the slash version.
    trailingSlash: "always",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
