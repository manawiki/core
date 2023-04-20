const { flatRoutes } = require("remix-flat-routes");

/** @type {import('@remix-run/dev').AppConfig} */

require("dotenv/config");

function getPublicPath() {
   const staticAssetsUrl = process.env.STATIC_URL;
   console.log(staticAssetsUrl);
   if (!staticAssetsUrl) return "/build/";
   return `${staticAssetsUrl}/build/`;
}

module.exports = {
   future: {
      v2_routeConvention: true,
      v2_meta: true,
      v2_normalizeFormMethod: true,
      v2_errorBoundary: true,
      unstable_postcss: true,
      unstable_tailwind: true,
   },
   publicPath: getPublicPath(),
   ignoredRouteFiles: ["**/.*"],
   routes: async (defineRoutes) => {
      return flatRoutes(["routes", "_custom/routes"], defineRoutes);
   },
   serverDependenciesToBundle: ["nanoid"],
};
