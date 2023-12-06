import { useEffect, useState } from "react";

import { RadioGroup } from "@headlessui/react";
import {
   json,
   type LinksFunction,
   type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import AOS from "aos";
import clsx from "clsx";
import { z } from "zod";
import { zx } from "zodix";

import { settings } from "mana-config";
import { Image } from "~/components";
import { Icon } from "~/components/Icon";
import type { Site } from "~/db/payload-types";
import { useDebouncedValue } from "~/utils";
import { fetchWithCache } from "~/utils/cache.server";

import { Top } from "./components/top";
import { LoggedOut, LoggedIn } from "../_auth+/src/components";
import { FollowingListMobile } from "../_site+/$siteId+/src/components";

import "aos/dist/aos.css";
import "./styles.css";

export const meta: MetaFunction = () => [
   { title: "Mana - A new kind of wiki" },
];

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderFunctionArgs) {
   const { q, c, page } = zx.parseQuery(request, {
      q: z.string().optional(),
      c: z
         .union([z.literal("all"), z.literal("gaming"), z.literal("other")])
         .optional(),
      page: z.coerce.number().optional(),
   });

   const { data, errors } = await fetchWithCache(
      `${settings.domainFull}/api/graphql`,
      {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            query: `
            query {
               sites: Sites(
                 ${page ? `page:${page}` : ""}
                 where: {
                   status: { equals: verified }
                   ${c != null && "all" ? `category: { equals: ${c} }` : ""}
                   ${
                      q
                         ? `OR: [{ name: { contains: "${q}" } }, { about: { contains: "${q}" } }]`
                         : ""
                   }
                 }
               ) {
                 totalDocs
                 totalPages
                 pagingCounter
                 hasPrevPage
                 prevPage
                 hasNextPage
                 docs {
                   id
                   name
                   type
                   slug
                   status
                   about
                   icon {
                     url
                   }
                 }
               }
             }
            `,
            variables: {
               page,
               q,
               c,
            },
         }),
      },
   );

   if (errors) {
      console.error(JSON.stringify(errors)); // eslint-disable-line no-console
      throw new Error();
   }
   const sites = data.sites;

   return json(
      { q, sites, dev: process.env.NODE_ENV === "development" },
      { headers: { "Cache-Control": "public, s-maxage=60, max-age=60" } },
   );
}

export default function IndexMain() {
   useEffect(() => {
      AOS.init({
         once: true,
         disable: "phone",
         duration: 1000,
         easing: "ease-out-cubic",
      });
   });

   return (
      <>
         <LoggedOut>
            <Top />
         </LoggedOut>
         <Discover />
      </>
   );
}

const Discover = () => {
   const { q, sites, dev } = useLoaderData<typeof loader>() || {};
   const [query, setQuery] = useState(q);
   const debouncedValue = useDebouncedValue(query, 500);
   const [searchParams, setSearchParams] = useSearchParams({});
   const [category, setCategory] = useState("all");

   useEffect(() => {
      if (debouncedValue) {
         setSearchParams((searchParams) => {
            searchParams.set("q", debouncedValue);
            return searchParams;
         });
      } else {
         setSearchParams((searchParams) => {
            searchParams.delete("q");
            return searchParams;
         });
      }
   }, [debouncedValue, setSearchParams]);

   return (
      <>
         <section className="relative z-10 h-full">
            <LoggedIn>
               <div className="bg-gradient-to-b from-white to-zinc-100 pt-20 dark:from-bg3Dark dark:to-bg1Dark">
                  <div className="mx-auto max-w-[680px] max-laptop:px-4">
                     <div className="pb-3 pl-1 text-sm font-bold">
                        Following
                     </div>
                     <FollowingListMobile />
                     <div className="pl-1 pt-8 text-sm font-bold">Explore</div>
                  </div>
               </div>
            </LoggedIn>
            <div className="border-color border-t pb-20">
               <div className="relative z-20 mx-auto max-w-[680px] max-laptop:px-4">
                  <div className="flex items-center justify-center">
                     <div className="bg-2 shadow-1 border-color relative -mt-[28px] h-14 w-full rounded-2xl border shadow-sm shadow-zinc-200">
                        <>
                           <div className="relative flex h-full w-full items-center gap-2">
                              <span className="absolute left-[16px] top-[17px]">
                                 {/* <Search size={20} /> */}
                                 <Icon name="search" className="h-5 w-5" />
                              </span>
                              <input
                                 type="text"
                                 placeholder="Search..."
                                 className="h-full w-full rounded-2xl border-0 bg-transparent 
                                 pl-[50px] focus:outline-none focus:ring-0"
                                 value={query}
                                 onChange={(e) => setQuery(e.target.value)}
                              />
                           </div>
                           {searchParams.size >= 1 && (
                              <button
                                 className="absolute right-4 top-4"
                                 onClick={() => {
                                    setSearchParams((searchParams) => {
                                       searchParams.delete("q");
                                       searchParams.delete("c");
                                       setCategory("all");
                                       return searchParams;
                                    });
                                    setQuery("");
                                 }}
                              >
                                 <Icon
                                    name="x"
                                    className="text-red-500 w-[22px] h-[22px]"
                                 />
                              </button>
                           )}
                        </>
                     </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pb-4 pt-6">
                     <RadioGroup
                        className="flex items-center gap-3"
                        value={category}
                        onChange={(value) => {
                           if (value != "all") {
                              setSearchParams(
                                 (searchParams) => {
                                    searchParams.set("c", value);
                                    return searchParams;
                                 },
                                 { preventScrollReset: false },
                              );
                           } else
                              setSearchParams(
                                 (searchParams) => {
                                    searchParams.delete("c");
                                    return searchParams;
                                 },
                                 { preventScrollReset: false },
                              );
                           setCategory(value);
                        }}
                     >
                        <RadioGroup.Option value="all">
                           {({ checked }) => (
                              <div
                                 className={clsx(
                                    checked
                                       ? "!border-transparent bg-zinc-700 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-800"
                                       : "bg-3 border-color",
                                    "shadow-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs font-bold uppercase shadow-sm",
                                 )}
                              >
                                 <Icon name="globe-2" className="h-3.5 w-3.5">
                                    All
                                 </Icon>
                              </div>
                           )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="gaming">
                           {({ checked }) => (
                              <div
                                 className={clsx(
                                    checked
                                       ? "!border-transparent bg-zinc-700 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-800"
                                       : "bg-3 border-color",
                                    "shadow-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs font-bold uppercase shadow-sm",
                                 )}
                              >
                                 {/* <Gamepad2 size={16} /> */}
                                 <Icon name="gamepad-2" className="h-4 w-4">
                                    Gaming
                                 </Icon>
                              </div>
                           )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="other">
                           {({ checked }) => (
                              <div
                                 className={clsx(
                                    checked
                                       ? "!border-transparent bg-zinc-700 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-800"
                                       : "bg-3 border-color",
                                    "shadow-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs font-bold uppercase shadow-sm",
                                 )}
                              >
                                 <Icon name="component" className="h-3.5 w-3.5">
                                    Other
                                 </Icon>
                              </div>
                           )}
                        </RadioGroup.Option>
                     </RadioGroup>
                     <div className="pr-1 pt-2 text-sm">
                        <span className="text-zinc-400">
                           {sites?.totalDocs}
                        </span>{" "}
                        results
                     </div>
                  </div>
                  <div className="relative z-20 flex-grow space-y-4">
                     {sites?.docs.length === 0 ? (
                        <div className="py-3 text-sm "></div>
                     ) : (
                        sites?.docs.map((site: Site) => (
                           <Link
                              reloadDocument={!dev}
                              to={`/${site.slug}`}
                              key={site.id}
                              className="border-color bg-3 shadow-1 flex items-center gap-3.5 rounded-2xl border p-3 shadow-sm"
                           >
                              <div
                                 className="shadow-1 border-1 h-11 w-11 flex-none
                                 overflow-hidden rounded-full border shadow"
                              >
                                 <Image
                                    height={44}
                                    width={44}
                                    url={`${site.icon?.url}`}
                                 />
                              </div>
                              <div className="space-y-1 truncate">
                                 <div className="truncate font-mono font-bold">
                                    {site.name}
                                 </div>
                                 <div className="truncate text-xs">
                                    {site.about}
                                 </div>
                              </div>
                           </Link>
                        ))
                     )}
                  </div>
                  {sites?.totalPages > 1 && (
                     <div className="text-1 flex items-center justify-between py-3 pl-1 text-sm">
                        <div>
                           Showing{" "}
                           <span className="font-bold">
                              {sites?.pagingCounter}
                           </span>{" "}
                           to{" "}
                           <span className="font-bold">
                              {sites?.docs?.length + sites.pagingCounter - 1}
                           </span>{" "}
                           of{" "}
                           <span className="font-bold">{sites?.totalDocs}</span>{" "}
                           results
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                           {sites?.hasPrevPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          sites.prevPage as any,
                                       );
                                       return searchParams;
                                    })
                                 }
                              >
                                 <Icon
                                    name="chevron-left"
                                    className="text-zinc-500 w-4.5 h-4.5"
                                 />
                                 Prev
                              </button>
                           ) : null}
                           {sites.hasNextPage && sites.hasPrevPage && (
                              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                           )}
                           {sites.hasNextPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          sites.nextPage as any,
                                       );
                                       return searchParams;
                                    })
                                 }
                              >
                                 Next
                                 <Icon
                                    name="chevron-right"
                                    className="text-zinc-500 w-4.5 h-4.5"
                                 />
                              </button>
                           ) : null}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </section>
      </>
   );
};
