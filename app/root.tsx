import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { withMetronome } from "@metronome-sh/react";
import type {
   MetaFunction,
   LinksFunction,
   LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
   Links,
   LiveReload,
   Meta,
   Outlet,
   Scripts,
   ScrollRestoration,
   useLoaderData,
   useMatches,
   useOutletContext,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import reactCropUrl from "react-image-crop/dist/ReactCrop.css";
import rdtStylesheet from "remix-development-tools/index.css";
import { getToast } from "remix-toast";
import { ExternalScripts } from "remix-utils/external-scripts";
import { Toaster, toast as notify } from "sonner";

import customStylesheetUrl from "~/_custom/styles.css";
import type { Site } from "~/db/payload-types";
import fonts from "~/styles/fonts.css";
import { ClientHintCheck, getHints, useTheme } from "~/utils/client-hints";
import { i18nextServer } from "~/utils/i18n/i18next.server";
import { useIsBot } from "~/utils/isBotProvider";
import { getTheme } from "~/utils/theme.server";

import { settings } from "./config";
import { getSiteSlug } from "./routes/_site+/_utils/getSiteSlug.server";
import tailwindStylesheetUrl from "./styles/global.css";
import { isbot } from "isbot";

export { ErrorBoundary } from "~/components/ErrorBoundary";

type ContextType = [
   searchToggle: boolean,
   setSearchToggle: Dispatch<SetStateAction<boolean>>,
];

export function useSearchToggleState() {
   return useOutletContext<ContextType>();
}

export const loader = async ({
   context: { user, payload },
   request,
}: LoaderFunctionArgs) => {
   const { siteSlug } = await getSiteSlug(request, payload, user);

   const locale = await i18nextServer.getLocale(request);
   // Extracts the toast from the request
   const { toast, headers } = await getToast(request);

   const userData = user
      ? await payload.findByID({
           collection: "users",
           id: user.id,
           user,
        })
      : undefined;

   const following = userData?.sites?.map((site) => ({
      id: site?.id,
      icon: {
         url: site?.icon?.url,
      },
      domain: site?.domain,
      name: site.name,
      slug: site?.slug,
      type: site?.type,
   }));
   const hints = getHints(request);

   const stripePublicKey = process.env.STRIPE_PUBLIC_KEY ?? "";

   const bot = isbot(request?.headers?.get("user-agent") ?? "");

   return json(
      {
         requestInfo: {
            ...hints,
            theme: getTheme(request) ?? hints.theme,
         },
         stripePublicKey,
         toast,
         locale,
         user,
         siteSlug,
         following,
         isbot: bot,
      },
      { headers },
   );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
   { title: settings.title },
   { charSet: "utf-8" },
];

export const links: LinksFunction = () => [
   //preload css makes it nonblocking to html renders
   { rel: "preload", href: fonts, as: "style" },
   { rel: "preload", href: tailwindStylesheetUrl, as: "style" },
   { rel: "preload", href: customStylesheetUrl, as: "style" },
   { rel: "preload", href: reactCropUrl, as: "style" },

   { rel: "stylesheet", href: reactCropUrl },
   { rel: "stylesheet", href: fonts },
   { rel: "stylesheet", href: tailwindStylesheetUrl },
   { rel: "stylesheet", href: customStylesheetUrl },

   //add dns-prefetch as fallback support for older browsers
   { rel: "preconnect", href: "https://static.mana.wiki" },
   { rel: "dns-prefetch", href: "https://static.mana.wiki" },

   ...(process.env.NODE_ENV === "development"
      ? [{ rel: "stylesheet", href: rdtStylesheet }]
      : []),
];

export const handle = {
   // i18n key for this route. This will be used to load the correct translation
   i18n: "auth",
};

function App() {
   const { locale, toast } = useLoaderData<typeof loader>();
   const { i18n } = useTranslation();
   const isBot = useIsBot();
   const theme = useTheme();

   useChangeLanguage(locale);

   //site data should live in layout, this may be potentially brittle if we shift site architecture around
   const { site } = (useMatches()?.[1]?.data as { site: Site | null }) ?? {
      site: null,
   };
   const favicon = site?.favicon?.url ?? site?.icon?.url ?? "/favicon.ico";

   // Hook to show the toasts
   useEffect(() => {
      if (toast?.type === "error") {
         notify.error(toast.message);
      }
      if (toast?.type === "success") {
         notify.success(toast.message);
      }
   }, [toast]);

   const [searchToggle, setSearchToggle] = useState(false);

   return (
      <html
         lang={locale}
         dir={i18n.dir()}
         className={`font-body scroll-smooth ${theme ?? ""}`}
      >
         <head>
            {isBot ? null : <ClientHintCheck />}
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
            {/* add preconnect to cdn to improve first bits */}
            <link
               sizes="32x32"
               rel="icon"
               type="image/x-icon"
               href={`${favicon}?width=32&height=32`}
            />
            <link
               sizes="128x128"
               rel="icon"
               type="image/x-icon"
               href={`${favicon}?width=128&height=128`}
            />
            <link
               sizes="180x180"
               rel="icon"
               type="image/x-icon"
               href={`${favicon}?width=180&height=180`}
            />
            <link
               sizes="192x192"
               rel="icon"
               type="image/x-icon"
               href={`${favicon}?width=192&height=192`}
            />
            <Meta />
            <Links />
         </head>
         <body className="text-light dark:text-dark">
            <Outlet
               context={[searchToggle, setSearchToggle] satisfies ContextType}
            />
            <Toaster theme={theme ?? "system"} />
            <ScrollRestoration />
            {isBot ? null : <Scripts />}
            <ExternalScripts />
            <LiveReload />
         </body>
      </html>
   );
}

let AppExport = withMetronome(App);

// Toggle Remix Dev Tools
if (process.env.NODE_ENV === "development") {
   const { withDevTools } = require("remix-development-tools");

   AppExport = withDevTools(AppExport);
}

export default AppExport;

export function useChangeLanguage(locale: string) {
   let { i18n } = useTranslation();
   useEffect(() => {
      i18n.changeLanguage(locale);
   }, [locale, i18n]);
}
