import { Fragment, type ReactNode } from "react";

import { offset } from "@floating-ui/react";
import { Menu, Transition } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import {
   useFetcher,
   useLocation,
   useMatches,
   NavLink,
   useParams,
   Link,
} from "@remix-run/react";
import clsx from "clsx";
import { Component, Database } from "lucide-react";
import { lazily } from "react-lazily";

import { H2Default } from "~/components/H2";
import { Image } from "~/components/Image";
import type { Site } from "~/db/payload-types";
import { useIsStaffOrSiteAdminOrStaffOrOwner } from "~/routes/_auth+/src/functions";
import { EditorCommandBar } from "~/routes/_editor+/core/components/EditorCommandBar";
import { EditorView } from "~/routes/_editor+/core/components/EditorView";
import { initialValue } from "~/routes/_editor+/core/utils";

import type { EntryType } from "./functions";
import { CircleImageUploader } from "./ImageUpload";

// we'll lazy load the editor and viewer to make sure they get tree-shaken when not used
//@ts-ignore
const { ManaEditor } = lazily(() => import("~/routes/_editor+/editor.tsx"));

export function EntryContentEmbed({
   title,
   sectionId,
}: {
   title: string | undefined;
   sectionId?: string;
}) {
   const fetcher = useFetcher();

   //Site data should live in layout, this may be potentially brittle if we shift site architecture around
   const { site } = (useMatches()?.[1]?.data as { site: Site | null }) ?? {
      site: null,
   };

   //Get path for custom site
   const { pathname } = useLocation();
   const collectionSlug = pathname.split("/")[3];
   const collectionId = useParams()?.collectionId ?? collectionSlug;

   const collection = site?.collections?.find(
      (collection) => collection.slug === collectionId,
   );

   //Entry data should live in $collectionId_$entryId, this may be potentially brittle if we shift site architecture around
   const { entry } = useMatches()?.[2]?.data as any;

   //Filter out content based on sectionId
   const data = entry?.embeddedContent?.find(
      (item: any) => item?.sectionId === sectionId,
   );

   const hasContent = data?.content && data?.content[0].children[0].text != "";
   const hasAccess = useIsStaffOrSiteAdminOrStaffOrOwner();

   return (
      <>
         {hasAccess ? (
            <Float
               middleware={[
                  offset({
                     mainAxis: 50,
                     crossAxis: 0,
                  }),
               ]}
               zIndex={20}
               placement="right-start"
               show
            >
               <main className="mx-auto max-w-[728px] pb-3 laptop:w-[728px]">
                  <H2Default text={title} />
                  <ManaEditor
                     key={data?.id}
                     collectionSlug="contentEmbeds"
                     sectionId={sectionId}
                     siteId={entry?.siteId}
                     fetcher={fetcher}
                     entryId={entry?.id}
                     pageId={data?.id}
                     collectionEntity={collection?.id}
                     defaultValue={data?.content ?? initialValue()}
                  />
               </main>
               <div>
                  <EditorCommandBar
                     collectionSlug="contentEmbeds"
                     collectionId={collection?.slug}
                     siteId={site?.slug}
                     entryId={entry?.id}
                     pageId={data?.id}
                     fetcher={fetcher}
                     isChanged={data?.isChanged}
                  />
               </div>
            </Float>
         ) : (
            <>
               {hasContent && (
                  <>
                     <H2Default text={title} />
                     <EditorView data={data?.content} />
                  </>
               )}
            </>
         )}
      </>
   );
}
export function Entry({ children }: { children: ReactNode }) {
   return (
      <div className="mx-auto max-w-[728px] max-laptop:pt-14 max-tablet:px-3 pb-5 laptop:pb-14">
         <CollectionHeader />
         {children}
      </div>
   );
}

export function List({ children }: { children: ReactNode }) {
   return (
      <div className="mx-auto max-w-[728px] max-desktop:pt-14 max-tablet:px-3 pb-5 laptop:pb-14">
         <CollectionHeader />
         {children}
      </div>
   );
}

export function CollectionHeader() {
   //site data should live in layout, this may be potentially brittle if we shift site architecture around
   const { site } = (useMatches()?.[1]?.data as { site: Site | null }) ?? {
      site: null,
   };

   //entry data should live in $collectionId_$entryId, this may be potentially brittle if we shift site architecture around
   const { entry } = (useMatches()?.[2]?.data as {
      entry: EntryType | null;
   }) ?? {
      entry: null,
   };

   //Get path for custom site
   const { pathname } = useLocation();
   const collectionSlug = pathname.split("/")[3];
   const collectionId = useParams()?.collectionId ?? collectionSlug;

   const collection = site?.collections?.find(
      (collection) => collection.slug === collectionId,
   );

   const entryName = entry?.name;

   const isEntry = entry?.name && entry?.id;

   const icon = isEntry
      ? entry?.icon && entry?.icon
      : collection?.icon && collection?.icon;

   const intent = isEntry ? "entry" : "collection";

   const entityId = isEntry ? entry?.id : collection?.id;

   const path = isEntry
      ? `/${site?.name}/c/${collection?.slug}/${entry?.id}`
      : `/${site?.name}/c/${collection?.slug}`;

   return (
      <div className="sticky top-[115px] desktop:top-[60px] bg-3 z-30 -mx-3 px-3 desktop:-mx-0.5 desktop:px-0.5 max-laptop:pt-5 desktop:pt-12">
         <div className="flex items-center justify-between gap-2 pb-2">
            <h1 className="font-bold font-header text-2xl laptop:text-3xl">
               {entryName ?? collection?.name}
            </h1>
            <div className="flex-none group relative -mr-0.5 border border-color-sub shadow-1 shadow-sm bg-white dark:bg-dark350 -mb-8 flex h-16 w-16 rounded-full overflow-hidden items-center">
               <CircleImageUploader
                  image={icon}
                  actionPath={path}
                  intent={intent}
                  entityId={entityId}
               />
            </div>
         </div>
         <section className="py-1 flex items-center border-y dark:border-dark400 border-zinc-100 mb-4">
            <Link
               to={`/${site?.slug}/collections`}
               className="flex items-center gap-2 group pr-4"
            >
               <Database
                  className="hover:text-zinc-500 dark:hover:text-zinc-400 text-zinc-400 dark:text-zinc-500"
                  size={16}
               />
            </Link>
            <span className="text-zinc-200 text-lg dark:text-zinc-700">/</span>
            <Menu as="div" className="relative">
               {({ open }) => (
                  <>
                     <Menu.Button className="flex items-center gap-2 group focus:outline-none hover:bg-zinc-50 hover:dark:bg-dark350 mx-2 pl-2 pr-1.5 py-2 rounded-lg">
                        <span className="font-bold text-1 text-xs">
                           {collection?.name}
                        </span>
                        <span className="w-4 h-4 flex items-center justify-center">
                           <svg
                              className={`${
                                 open ? "rotate-180" : ""
                              } transform transition duration-300 fill-zinc-400 dark:fill-zinc-500 ease-in-out w-3.5 h-3.5`}
                              viewBox="0 0 320 512"
                              xmlns="http://www.w3.org/2000/svg"
                           >
                              <path d="M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z" />
                           </svg>
                        </span>
                     </Menu.Button>
                     <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                     >
                        <Menu.Items className="absolute left-0 mt-0.5 max-w-sm min-w-[140px] z-20 w-full">
                           <div className="overflow-hidden p-1.5 space-y-0.5 rounded-lg bg-white dark:bg-dark350 border border-color-sub shadow-1 shadow">
                              {site?.collections?.map((row) => (
                                 <Menu.Item key={row.slug}>
                                    <NavLink
                                       end
                                       className={({ isActive }) =>
                                          clsx(
                                             isActive
                                                ? "bg-zinc-100 dark:bg-dark450"
                                                : "hover:bg-zinc-50 dark:hover:bg-dark400",
                                             "flex items-center p-1 rounded-md gap-1.5",
                                          )
                                       }
                                       to={`/${site.slug}/c/${row.slug}`}
                                    >
                                       <span className="flex-none flex h-5 w-5 items-center">
                                          {row.icon?.url ? (
                                             <Image
                                                url={row.icon?.url}
                                                options="aspect_ratio=1:1&height=80&width=80"
                                                alt="Collection Icon"
                                             />
                                          ) : (
                                             <Component
                                                className="text-1 mx-auto"
                                                size={18}
                                             />
                                          )}
                                       </span>
                                       <span className="text-xs font-semibold text-1">
                                          {row.name}
                                       </span>
                                    </NavLink>
                                 </Menu.Item>
                              ))}
                           </div>
                        </Menu.Items>
                     </Transition>
                  </>
               )}
            </Menu>
            <span className="text-zinc-200 text-lg dark:text-zinc-700">/</span>
            <Link
               to={`/${site?.slug}/c/${collection?.slug}`}
               className={clsx(
                  !entryName ? "underline" : "",
                  "px-4 font-bold text-1 text-xs flex items-center gap-2 hover:underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2",
               )}
            >
               List
            </Link>
            {isEntry ? (
               <>
                  <span className="text-zinc-200 text-lg dark:text-zinc-700">
                     /
                  </span>
                  <span className="font-bold pl-4 text-1 underline text-xs flex items-center gap-2 decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2">
                     Entry
                  </span>
               </>
            ) : (
               <></>
            )}
         </section>
      </div>
   );
}
