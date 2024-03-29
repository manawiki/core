import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";

import { Icon } from "~/components/Icon";
import { Image } from "~/components/Image";
import { AdUnit } from "~/routes/_site+/_components/Ramp";
import type { loader as siteLoaderType } from "~/routes/_site+/_layout";

import { Contributors } from "./Contributors";
import { PinnedList, PrimaryMenuLinks } from "./Menu";

export function ColumnFour() {
   const { site } = useLoaderData<typeof siteLoaderType>() || {};

   return (
      <section className="relative laptop:z-30 laptop:block max-laptop:bg-2-sub">
         <div
            className="flex flex-col laptop:fixed laptop:border-l laptop:shadow-sm laptop:shadow-1 no-scrollbar 
            h-full bg-2-sub laptop:bg-2 border-color laptop:overflow-y-auto laptop:w-[334px]"
         >
            <div className="laptop:h-full flex flex-col bg-zinc-50 dark:bg-bg2Dark">
               {/* Mobile */}
               <section
                  className="py-4 max-tablet:px-3 laptop:hidden 
                  max-laptop:max-w-[728px] mx-auto w-full"
               >
                  <PrimaryMenuLinks site={site} />
                  <PinnedList site={site} />
               </section>
               <div className="relative max-laptop:border-t max-laptop:border-color dark:border-zinc-700/50">
                  <div className="sticky top-0 w-full left-0 bg-zinc-50 dark:bg-bg2Dark">
                     <div className="max-laptop:max-w-[760px] mx-auto">
                        <section className="grid grid-cols-3 gap-4 p-4 relative z-20">
                           <div className="dark:bg-bg3Dark bg-white dark:shadow-zinc-800 shadow-sm border border-color px-3 py-1.5 rounded-lg">
                              <div className="text-xs font-bold text-center">
                                 {site.followers ? site.followers : "-"}
                              </div>
                              <div className="text-xs text-1 text-center">
                                 Followers
                              </div>
                           </div>
                           <div className="dark:bg-bg3Dark bg-white dark:shadow-zinc-800 shadow-sm border border-color px-3 py-1.5 rounded-lg">
                              <div className="text-xs font-bold text-center">
                                 {site.totalPosts ? site.totalPosts : "-"}
                              </div>
                              <div className="text-xs text-1 text-center">
                                 Posts
                              </div>
                           </div>
                           <div className="dark:bg-bg3Dark bg-white dark:shadow-zinc-800 shadow-sm border border-color px-3 py-1.5 rounded-lg">
                              <div className="text-xs text-center font-bold">
                                 {site.totalEntries ? site.totalEntries : "-"}
                              </div>
                              <div className="text-xs text-center text-1">
                                 Entries
                              </div>
                           </div>
                        </section>

                        <section
                           className={clsx(
                              site?.banner
                                 ? "h-[170px] border-zinc-300 dark:border-zinc-700"
                                 : "h-[70px] border-color",
                              `bg-3 border flex items-center rounded-lg mx-4
                              justify-center bg-white overflow-hidden shadow-sm shadow-1 relative z-20`,
                           )}
                        >
                           {site?.banner && (
                              <>
                                 <Image
                                    //@ts-ignore
                                    url={site?.banner?.url}
                                    options="aspect_ratio=1.6:1&height=400"
                                    alt="Site Banner"
                                    loading="lazy"
                                 />
                                 <span className="bg-gradient-to-t dark:from-zinc-900/90 from-white/90 to-transparent  w-full h-full absolute top-0 left-0 z-10" />
                              </>
                           )}
                           <div
                              className="absolute dark:[text-shadow:_0_1px_0_rgb(0_0_0_/_40%)] [text-shadow:_0_1px_0_rgb(255_255_255_/_40%)]
                           dark:text-white bottom-0 text-sm left-0 p-4 z-20 space-y-1"
                           >
                              <span className="font-bold">{site.name}</span>
                              {site.about && (
                                 <div className="dark:text-zinc-400 text-xs">
                                    {site.about}
                                 </div>
                              )}
                           </div>
                        </section>
                        <Contributors site={site} />
                        {/* <div className="text-xs text-1 pb-2">Lvl 1</div>
                                 <div className="rounded-full h-3 w-full dark:bg-dark500 bg-teal-50 relative overflow-hidden">
                                    <span className="absolute top-0 left-0 bg-teal-500 w-40 h-full" />
                                 </div> */}
                        <div className="flex items-center justify-center relative z-20">
                           <AdUnit
                              adType="desktopSquareATF"
                              selectorId="rightSidebarBottomUnit"
                              enableAds={site.enableAds}
                           />
                        </div>
                        {site?.trendingPages &&
                           //@ts-ignore
                           site?.trendingPages.length > 0 && (
                              <div className="flex items-center gap-1.5 ml-4 py-4 relative z-20">
                                 <Icon
                                    name="flame"
                                    className="dark:text-zinc-400 text-zinc-500"
                                    size={16}
                                 />
                                 <span className="text-sm text-1 font-bold">
                                    Trending
                                 </span>
                              </div>
                           )}
                     </div>
                     <span
                        className="bg-gradient-to-t dark:from-bg3Dark dark:laptop:from-bg2Dark dark:to-transparent 
                           from-white laptop:from-zinc-50 to-transparent w-full h-full absolute top-0 left-0 z-10"
                     />
                     <div
                        className="pattern-dots absolute left-0 top-0 z-0 h-full
                           w-full pattern-bg-white pattern-zinc-500 pattern-opacity-10 
                           pattern-size-2 dark:pattern-zinc-400 dark:pattern-bg-bg3Dark"
                     />
                  </div>
                  {/* @ts-ignore */}
                  {site?.trendingPages && site?.trendingPages.length > 0 && (
                     <section className="max-laptop:bg-3">
                        <div className="max-laptop:max-w-[760px] mx-auto pl-4 tablet:px-4 laptop:pl-5 laptop:pr-0">
                           <div className="divide-y divide-color dark:divide-zinc-700/40 border-y border-color dark:border-zinc-700/40 font-semibold">
                              {/* @ts-ignore */}
                              {site?.trendingPages?.map((row: any) => (
                                 <Link
                                    to={row.path}
                                    key={row.path}
                                    className="flex items-center gap-2 pr-3 py-2 tablet:pr-0 laptop:pr-3 group"
                                 >
                                    <div className="text-sm flex-grow group-hover:underline">
                                       {row.data.name}
                                    </div>
                                    <div
                                       className="h-[26px] w-[26px] flex items-center justify-center rounded-full bg-white
                                    border border-color-sub shadow-sm shadow-1 overflow-hidden dark:bg-dark400"
                                    >
                                       {row.data?.icon?.url ? (
                                          <Image
                                             width={40}
                                             height={40}
                                             url={row.data?.icon?.url}
                                             options="aspect_ratio=1:1&height=40&width=40"
                                             alt=""
                                             loading="lazy"
                                          />
                                       ) : (
                                          <Icon
                                             name="component"
                                             className="dark:text-zinc-500 text-zinc-400 mx-auto"
                                             size={16}
                                          />
                                       )}
                                    </div>
                                 </Link>
                              ))}
                           </div>
                        </div>
                     </section>
                  )}
               </div>
            </div>
         </div>
      </section>
   );
}
