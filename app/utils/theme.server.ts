import * as cookie from "cookie";

const cookieName = "en-theme";
export type Theme = "light" | "dark" | "system";

export function getTheme(request: Request): Theme | null {
   const cookieHeader = request.headers.get("cookie");
   const parsed = cookieHeader
      ? cookie.parse(cookieHeader)[cookieName]
      : "light";
   if (parsed === "light" || parsed === "dark") return parsed;
   return null;
}

export function setTheme(theme: Theme | "system", request: Request) {
   let { hostname } = new URL(request.url);

   // Remove subdomain
   let domain = hostname.split(".").slice(-2).join(".");

   // don't set cookie domain on fly.dev due to Public Suffix List supercookie issue
   if (domain === "fly.dev") domain = "";

   return theme === "system"
      ? cookie.serialize(cookieName, "", {
           path: "/",
           maxAge: -1,
           domain,
        })
      : cookie.serialize(cookieName, theme, {
           path: "/",
           maxAge: 31536000,
           domain,
        });
}
