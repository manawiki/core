import mdx from "@mdx-js/rollup";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { remixDevTools } from "remix-development-tools/vite";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
const customConfig = "./app/_custom/config.json";

export default defineConfig({
   logLevel: "warn",
   plugins: [
      remixDevTools(),
      remix({
         ignoredRouteFiles: ["**/.*"],
         // tailwind: true,
         // postcss: true,
         // appDirectory: "app",
         // assetsBuildDirectory: "public/build",
         // publicPath: "/build/",
         // serverBuildPath: "build/index.js",
         publicPath: process.env.STATIC_URL
            ? `${process.env.STATIC_URL}/build/`
            : "/build/",
         // serverDependenciesToBundle: ["nanoid", "react-code-block"],
         routes: manaRoutes,
      }),
      tsconfigPaths(),
      mdx(),
   ],
   ssr: {
      noExternal: ["react-code-block", "remix-i18next"],
   },
});

// flat routes with mana characteristics
async function manaRoutes(defineRoutes) {
   let routes = flatRoutes(["routes", "_custom/routes"], defineRoutes);

   if (customConfig?.domain) {
      routes = {
         ...routes,
         "routes/_home+/_layout": {
            id: "routes/_home+/_layout",
            parentId: "root",
            file: "routes/_site+/$siteId+/_layout.tsx",
         },
         "routes/_home+/_index": {
            index: true,
            id: "routes/_home+/_index",
            parentId: "routes/_home+/_layout",
            file: "routes/_site+/$siteId+/_index.tsx",
         },
      };
   }
   return routes;
}
