import {
   NavLink,
   useLocation,
   useParams,
   useRouteLoaderData,
} from "@remix-run/react";
import { Component, Layout, Users } from "lucide-react";

import type { Collection } from "payload/generated-types";
import { Image } from "~/components/Image";

type HeaderType = {
   name?: string;
   icon?: {
      url?: string;
   };
};

export const EntryHeader = ({ entry }: { entry: HeaderType }) => {
   const params = useParams();
   const siteId = params.siteId;
   const entryId = params.entryId;

   //Get path for custom site
   const { pathname } = useLocation();
   const slug = pathname.split("/")[3];

   const collectionId = params?.collectionId ? params?.collectionId : slug;

   const coreCollectionData = useRouteLoaderData(
      "routes/_site+/$siteId.collections+/$collectionId._route"
   ) as { collection: Collection };

   const isCustomWikiPage = coreCollectionData?.collection?.customEntryTemplate;

   return (
      <section className="border-color relative my-5 overflow-hidden border-y pt-9">
         <div
            className="pattern-dots absolute left-0
                   top-0 h-full
                     w-full pattern-bg-white pattern-zinc-400 pattern-opacity-10 pattern-size-4 dark:pattern-zinc-500 dark:pattern-bg-bg3Dark"
         ></div>
         <div
            className="absolute left-0 top-0 
            h-full w-full bg-gradient-to-b from-zinc-50 dark:from-bg2Dark"
         ></div>
         <div className="relative mx-auto flex max-w-[728px] items-center justify-start gap-3 pb-4 max-desktop:px-3">
            <div
               className="border-color flex h-14 w-14 flex-none items-center 
               justify-center overflow-hidden rounded-full border-2 bg-zinc-500"
            >
               {/* @ts-ignore */}
               {entry?.icon?.url ? (
                  <Image
                     width={50}
                     height={50}
                     alt={entry?.name}
                     options="aspect_ratio=1:1&height=80&width=80"
                     //@ts-ignore
                     url={entry?.icon?.url}
                  />
               ) : (
                  <Component size={24} className="text-1" />
               )}
            </div>
            <h1 className="text-lg font-bold laptop:text-xl">{entry?.name}</h1>
         </div>
         <div className="text-1 relative mx-auto flex max-w-[728px] items-center gap-4 text-sm font-bold max-desktop:px-3">
            {isCustomWikiPage ? (
               <>
                  <NavLink
                     end
                     className="relative px-1 py-2"
                     to={`/${siteId}/collections/${collectionId}/${entryId}`}
                  >
                     {({ isActive }) => (
                        <>
                           <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                              <Layout
                                 className={`${
                                    isActive
                                       ? "text-yellow-500"
                                       : "text-zinc-400 dark:text-zinc-500"
                                 }`}
                                 size={18}
                              />
                              <span
                                 className={`${
                                    isActive ? "dark:text-white" : ""
                                 }`}
                              >
                                 Custom
                              </span>
                           </div>
                           {isActive ? (
                              <span
                                 className="absolute -bottom-0.5 left-0 h-1
                              w-full rounded-full bg-yellow-500 dark:bg-yellow-700"
                              />
                           ) : null}
                        </>
                     )}
                  </NavLink>
                  <NavLink
                     end
                     className="relative px-1 py-2"
                     to={`/${siteId}/collections/${collectionId}/${entryId}/w`}
                  >
                     {({ isActive }) => (
                        <>
                           <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                              <Users
                                 className={`${
                                    isActive
                                       ? "text-yellow-500"
                                       : "text-zinc-400 dark:text-zinc-500"
                                 }`}
                                 size={18}
                              />
                              <span
                                 className={`${
                                    isActive ? "dark:text-white" : ""
                                 }`}
                              >
                                 Wiki
                              </span>
                           </div>
                           {isActive ? (
                              <span
                                 className="absolute -bottom-0.5 left-0 h-1 
                              w-full rounded-full bg-yellow-500 dark:bg-yellow-700"
                              />
                           ) : null}
                        </>
                     )}
                  </NavLink>
               </>
            ) : (
               <NavLink
                  end
                  className="relative px-1 py-2"
                  to={`/${siteId}/collections/${collectionId}/${entryId}`}
               >
                  {({ isActive }) => (
                     <>
                        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                           <Users
                              className={`${
                                 isActive
                                    ? "text-yellow-500"
                                    : "text-zinc-400 dark:text-zinc-500"
                              }`}
                              size={18}
                           />
                           <span
                              className={`${isActive ? "dark:text-white" : ""}`}
                           >
                              Wiki
                           </span>
                        </div>
                        {isActive ? (
                           <span
                              className="absolute -bottom-0.5 left-0 h-1 
                              w-full rounded-full bg-yellow-500 dark:bg-yellow-700"
                           />
                        ) : null}
                     </>
                  )}
               </NavLink>
            )}
         </div>
      </section>
   );
};
