import { useEffect, lazy } from "react";

import { MetronomeLinks } from "@metronome-sh/react";
import type {
   V2_MetaFunction,
   LinksFunction,
   LoaderArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
   Links,
   LiveReload,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   useLoaderData,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import rdtStylesheet from "remix-development-tools/stylesheet.css";
import { z } from "zod";
import { zx } from "zodix";

import { settings } from "mana-config";
import customConfig from "~/_custom/config.json";
import customStylesheetUrl from "~/_custom/styles.css";
import fonts from "~/styles/fonts.css";
import { useIsBot } from "~/utils/isBotProvider";
import {
   ThemeBody,
   ThemeHead,
   ThemeProvider,
   useTheme,
} from "~/utils/theme-provider";
import { getThemeSession } from "~/utils/theme.server";

import { toast } from "./components/Toaster";
import tailwindStylesheetUrl from "./styles/global.css";
import { isNativeSSR } from "./utils";
import { i18nextServer } from "./utils/i18n";
import { commitSession, getSession } from "./utils/message.server";
import type { ToastMessage } from "./utils/message.server";

const RemixDevTools = lazy(() => import("remix-development-tools"));

export const loader = async ({
   context: { user },
   request,
   params,
}: LoaderArgs) => {
   const themeSession = await getThemeSession(request);
   const locale = await i18nextServer.getLocale(request);
   const session = await getSession(request.headers.get("cookie"));
   const toastMessage = (session.get("toastMessage") as ToastMessage) ?? null;
   const { isMobileApp, isIOS, isAndroid } = isNativeSSR(request);
   // const isCustomDomain = customDomainRouting({ params, request, isMobileApp });
   // if (isCustomDomain) {
   //    return redirect(isCustomDomain);
   // }

   const sharedData = {
      isMobileApp,
      isIOS,
      isAndroid,
      toastMessage,
      locale,
      user,
      siteTheme: themeSession.getTheme(),
   };

   return json(
      { ...sharedData },
      { headers: { "Set-Cookie": await commitSession(session) } }
   );
};

export const meta: V2_MetaFunction = () => [
   { title: settings.title },
   { charSet: "utf-8" },
];

export const links: LinksFunction = () => [
   //preload css makes it nonblocking to html renders
   { rel: "preload", href: fonts, as: "style", crossOrigin: "anonymous" },
   { rel: "preload", href: tailwindStylesheetUrl, as: "style" },
   { rel: "preload", href: customStylesheetUrl, as: "style" },

   { rel: "stylesheet", href: fonts, crossOrigin: "anonymous" },
   { rel: "stylesheet", href: tailwindStylesheetUrl },
   { rel: "stylesheet", href: customStylesheetUrl },

   //add preconnects to cdn to improve first bits
   {
      rel: "preconnect",
      href: `https://${settings.domain}`,
      crossOrigin: "anonymous",
   },
   {
      rel: "preconnect",
      href: `https://${
         settings.siteId ? `${settings.siteId}-static` : "static"
      }.mana.wiki`,
      crossOrigin: "anonymous",
   },

   //add dns-prefetch as fallback support for older browsers
   { rel: "dns-prefetch", href: `https://static.mana.wiki` },
   {
      rel: "dns-prefetch",
      href: `https://${
         settings.siteId ? `${settings.siteId}-static` : "static"
      }.mana.wiki`,
   },

   //Remix Devtools
   ...(rdtStylesheet && process.env.NODE_ENV === "development"
      ? [{ rel: "stylesheet", href: rdtStylesheet }]
      : []),
];

export const handle = {
   // i18n key for this route. This will be used to load the correct translation
   i18n: "auth",
};

function App() {
   const { locale, siteTheme, toastMessage, isMobileApp } =
      useLoaderData<typeof loader>();
   const [theme] = useTheme();
   const { i18n } = useTranslation();
   const isBot = useIsBot();
   useChangeLanguage(locale);

   useEffect(() => {
      if (!toastMessage) {
         return;
      }
      const { message, type } = toastMessage;

      switch (type) {
         case "success":
            toast.success(message);
            break;
         case "error":
            toast.error(message);
            break;
         default:
            throw new Error(`${type} is not handled`);
      }
   }, [toastMessage]);

   return (
      <html
         lang={locale}
         dir={i18n.dir()}
         className={`font-body ${theme ?? ""}`}
      >
         <head>
            <meta charSet="utf-8" />
            <meta
               name="viewport"
               content="initial-scale=1, viewport-fit=cover, width=device-width"
               viewport-fit="cover"
            />
            <meta
               name="format-detection"
               content="telephone=no, date=no, email=no, address=no"
            />
            <Meta />
            <Links />
            {process.env.NODE_ENV === "production" && <MetronomeLinks />}
            <ThemeHead ssrTheme={Boolean(siteTheme)} />
         </head>
         <body className="text-light dark:text-dark">
            <Outlet />
            <Toaster />
            <ThemeBody ssrTheme={Boolean(siteTheme)} />
            <ScrollRestoration />
            {isBot ? null : <Scripts />}
            <LiveReload />
            {process.env.NODE_ENV === "development" && !isMobileApp && (
               <RemixDevTools />
            )}
         </body>
      </html>
   );
}

export default function AppWithProviders() {
   const { siteTheme } = useLoaderData<typeof loader>();

   return (
      <ThemeProvider specifiedTheme={siteTheme}>
         <App />
      </ThemeProvider>
   );
}

export function useChangeLanguage(locale: string) {
   let { i18n } = useTranslation();
   useEffect(() => {
      i18n.changeLanguage(locale);
   }, [locale, i18n]);
}

// const customDomainRouting = ({
//    params,
//    request,
//    isMobileApp,
// }: {
//    params: Params;
//    request: Request;
//    isMobileApp: Boolean;
// }) => {
//    if (customConfig?.domain && process.env.NODE_ENV == "production") {
//       const { siteId } = zx.parseParams(params, {
//          siteId: z.string().optional(),
//       });
//       const { pathname } = new URL(request.url as string);

//       //If current path is not siteId and not currently home, redirect to home
//       if (siteId && siteId != customConfig?.siteId && pathname != "/") {
//          return "/";
//       }

//       //redirect "/$sited" to "/"
//       if (
//          pathname != "/" &&
//          pathname == `/${customConfig?.siteId}` && //Only redirect on site index
//          siteId == customConfig?.siteId //Make sure client ID is equal to config id before redirect
//       ) {
//          return "/";
//       }
//    }
//    return;
// };
