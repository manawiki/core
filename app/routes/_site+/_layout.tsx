import { useEffect, useState } from "react";

import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";

import { useSearchToggleState } from "~/root";
import { getSiteSlug } from "~/routes/_site+/_utils/getSiteSlug.server";

import { ColumnOne } from "./_components/Column-1";
import { ColumnTwo } from "./_components/Column-2";
import { ColumnFour } from "./_components/Column-4";
import { GAScripts } from "./_components/GAScripts";
import { MobileHeader } from "./_components/MobileHeader";
import { RampScripts } from "./_components/RampScripts";
import { fetchSite } from "./_utils/fetchSite.server";
import { SiteHeader } from "./_components/SiteHeader";

export { ErrorBoundary } from "~/components/ErrorBoundary";

export async function loader({
   context: { payload, user },
   request,
}: LoaderFunctionArgs) {
   const { siteSlug } = await getSiteSlug(request, payload, user);

   const site = await fetchSite({ siteSlug, user, request, payload });

   return await json({ site });
}

export default function SiteLayout() {
   const { site } = useLoaderData<typeof loader>() || {};
   const location = useLocation();
   const gaTag = site?.gaTagId;
   const enableAds = site?.enableAds;

   const [, setSearchToggle] = useSearchToggleState();

   const [isPrimaryMenu, setPrimaryMenuOpen] = useState(false);

   useEffect(() => {
      //Hide the search on path change
      setSearchToggle(false);
   }, [setSearchToggle, location]);

   return (
      <>
         <MobileHeader />
         <main
            className="laptop:grid laptop:min-h-screen laptop:auto-cols-[70px_60px_1fr_334px] 
           laptop:grid-flow-col desktop:auto-cols-[70px_230px_1fr_334px]"
         >
            <ColumnOne />
            <ColumnTwo
               isPrimaryMenu={isPrimaryMenu}
               setPrimaryMenuOpen={setPrimaryMenuOpen}
            />
            <section className="bg-3 max-laptop:pt-14 max-laptop:min-h-[140px]">
               <SiteHeader
                  isPrimaryMenu={isPrimaryMenu}
                  setPrimaryMenuOpen={setPrimaryMenuOpen}
               />
               <Outlet />
            </section>
            <ColumnFour />
         </main>
         <GAScripts gaTrackingId={gaTag} />
         <RampScripts enableAds={enableAds} />
      </>
   );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
   return [
      {
         title: data?.site.name,
      },
   ];
};
