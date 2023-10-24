import type { ReactNode } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { request as gqlRequest, gql } from "graphql-request";
import type { PaginatedDocs } from "payload/dist/database/types";
import qs from "qs";
import { Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import useSWR from "swr";
import { z } from "zod";
import { zx } from "zodix";

import type { Entry } from "payload/generated-types";
import customConfig from "~/_custom/config.json";
import { Image } from "~/components";
import { Icon } from "~/components/Icon";
import { gqlEndpoint, gqlFormat, swrRestFetcher } from "~/utils";

import type { CustomElement, LinkElement } from "../../core/types";

export async function loader({
   context: { payload, user },
   request,
}: LoaderFunctionArgs) {
   const { linkUrl } = zx.parseQuery(request, {
      linkUrl: z.string(),
   });

   const url = new URL(linkUrl).pathname;
   const pathSection = url.split("/");

   switch (pathSection[2]) {
      case "c": {
         const slug = await payload.find({
            collection: "sites",
            where: {
               slug: {
                  equals: pathSection[1],
               },
            },
            user,
         });
         const site = slug?.docs[0];

         //List
         if (pathSection[3]) {
            const collectionData = await payload.find({
               collection: "collections",
               where: {
                  site: {
                     equals: site?.id,
                  },
                  slug: {
                     equals: pathSection[3],
                  },
               },
               depth: 1,
               overrideAccess: false,
               user,
            });

            const collection = collectionData?.docs[0];

            return {
               name: collection?.name,
               icon: {
                  url: collection?.icon?.url,
               },
            };
         }

         //Entry
         if (pathSection[4]) {
            const entryId = pathSection[4];
            const collectionId = pathSection[3];
            if (site?.type == "custom") {
               const label = gqlFormat(collectionId ?? "", "list");
               const endpoint = gqlEndpoint({
                  siteSlug: site.slug,
               });

               //Document request if slug does exist
               const entryQuery = gql`
                        query ($entryId: String!) {
                           entryData: ${label}(
                                 where: { OR: [{ slug: { equals: $entryId } }, { id: { equals: $entryId } }] }
                              ) {
                              docs {
                                 name
                                 icon {
                                    url
                                 }
                              }
                           }
                        }
                  `;

               //Fetch to see if slug exists
               const { entryData }: { entryData: PaginatedDocs<Entry> } =
                  await gqlRequest(endpoint, entryQuery, {
                     entryId,
                  });

               return entryData?.docs[0];
            }
            //If not custom site, fetch local api entries collection
            const coreEntryData = await payload.find({
               collection: "entries",
               where: {
                  "site.slug": {
                     equals: site?.slug,
                  },
                  "collectionEntity.slug": {
                     equals: collectionId,
                  },
                  or: [
                     {
                        slug: {
                           equals: entryId,
                        },
                     },
                     {
                        id: {
                           equals: entryId,
                        },
                     },
                  ],
               },
               depth: 1,
               user,
               overrideAccess: false,
            });

            const entryData = coreEntryData?.docs[0];

            const entry = {
               name: entryData?.name,
               icon: {
                  url: entryData?.icon?.url,
               },
            };

            return entry;
         }
      }
      // Posts version (future)
      // case "posts": {
      //    if (pathSection[3]) {
      //       const postId = pathSection[3];
      //       const doc = await payload.findByID({
      //          collection: "posts",
      //          id: postId,
      //          depth: 1,
      //          overrideAccess: false,
      //          user,
      //       });
      //       const filtered = select({ name: true, banner: true }, doc);
      //       return filtered;
      //    }
      //    return;
      // }
      default:
         return;
   }
}

type Props = {
   element: LinkElement;
   children: ReactNode;
};

type Fields = {
   name: string;
   icon: {
      url: string;
   };
};

export function BlockLink({ element, children }: Props) {
   const { hostname, pathname } = new URL(element.url as string);
   const isSafeLink = ["mana.wiki"].includes(hostname);
   const siteId = useParams()?.siteId ?? customConfig?.siteId;
   const editor = useSlate();

   const linkDataQuery = qs.stringify(
      {
         linkUrl: element.url,
      },
      { addQueryPrefix: true },
   );

   const url = element.url && new URL(element.url).pathname;

   const pathSection = url && url.split("/");

   const canFetch =
      isSafeLink &&
      element.icon == undefined &&
      pathSection &&
      pathSection[2] == "c" &&
      pathSection[3];

   const { data }: { data: Fields } = useSWR(
      canFetch && `/${siteId}/blocks/link${linkDataQuery}`,
      swrRestFetcher,
   );

   // If iconURL property is null and we get data then update
   if (canFetch && data) {
      const path = ReactEditor.findPath(editor, element);

      const newProperties: Partial<CustomElement> = {
         view: "icon-inline",
         ...data,
      };

      Transforms.setNodes<CustomElement>(editor, newProperties, {
         at: path,
      });
      //We update the child text
      Transforms.insertText(editor, data.name, {
         at: path,
      });
      //Move cursor out of the "link" so they can continue typing
      Transforms.move(editor, { unit: "offset" });
   }
   if (isSafeLink && element.icon) {
      return (
         <span
            className="group/link relative inline-flex items-baseline gap-1 whitespace-nowrap
          text-blue-600 visited:text-purple-600 dark:text-blue-500"
         >
            <button
               className="shadow-1 absolute right-0 top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full
               bg-red-500 opacity-0 shadow hover:bg-zinc-500 group-hover/link:opacity-100"
               onClick={() => {
                  const path = ReactEditor.findPath(editor, element);
                  return Transforms.removeNodes(editor, { at: path });
               }}
            >
               <Icon name="trash" className="h-3 w-3 text-white" />
            </button>
            <span
               className="border-color-sub shadow-1 flex h-6 w-6 items-center justify-center
               self-center overflow-hidden bg-2-sub rounded-full border shadow-sm"
            >
               {element?.icon?.url ? (
                  <Image
                     width={30}
                     height={30}
                     url={element.icon.url}
                     options="aspect_ratio=1:1&height=40&width=40"
                  />
               ) : (
                  <Icon name="component" className="text-1 mx-auto" size={12} />
               )}
            </span>
            {children}
         </span>
      );
   }
   if (isSafeLink) {
      return (
         <Link
            className="text-blue-600 visited:text-purple-600 hover:underline dark:text-blue-500"
            to={pathname}
         >
            {children}
         </Link>
      );
   }

   return (
      <a
         rel="nofollow"
         className="inline-flex text-blue-600 visited:text-purple-600 hover:underline dark:text-blue-500"
         href={element.url}
      >
         {children}
      </a>
   );
}
