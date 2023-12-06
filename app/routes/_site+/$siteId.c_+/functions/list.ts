import type { MetaFunction, Params } from "@remix-run/react";
import type { Payload } from "payload";
import { select } from "payload-query";

import type { Site, User, Collection } from "~/db/payload-types";
import { gqlFormat, gqlEndpoint } from "~/utils";
import * as cache from "~/utils/cache.server";

import type { CollectionsAllSchema } from "../$collectionId";

const { cacheThis, gql, gqlRequestWithCache } = cache;
export interface ListFetchType {
   params: Params;
   gql?: {
      query: string;
      variables?: {};
   };
}

export async function fetchList({ params, gql }: ListFetchType) {
   const gqlPath = gqlEndpoint({
      siteSlug: params.siteId,
   });

   const data = gql?.query
      ? await gqlRequestWithCache(gqlPath, gql?.query, {
           ...gql?.variables,
        })
      : undefined;

   return {
      list: {
         data,
      },
   };
}
export const customListMeta: MetaFunction = ({ matches }: { matches: any }) => {
   const site = matches.find(
      ({ id }: { id: string }) => id === "routes/_site+/$siteId+/_layout",
   )?.data?.site;

   const collectionId = matches[2].pathname.split("/")[3];

   const collection = site?.collections?.find(
      (collection: any) => collection.slug === collectionId,
   );
   return [
      {
         title: `${collection?.name} | ${site?.name}`,
      },
   ];
};

export async function fetchListCore({
   page = 1,
   payload,
   siteId,
   user,
   collectionId,
}: typeof CollectionsAllSchema._type & {
   payload: Payload;
   collectionId: Collection["slug"];
   siteId: Site["slug"];
   user?: User;
}) {
   const collectionData = await cacheThis(
      () =>
         payload.find({
            collection: "collections",
            where: {
               "site.slug": {
                  equals: siteId,
               },
               slug: {
                  equals: collectionId,
               },
            },
            overrideAccess: false,
            user,
         }),
      `list-collection-${siteId}-${collectionId}`,
   );

   const collectionEntry = collectionData?.docs[0];

   // Get custom collection list data
   if (collectionEntry?.customDatabase) {
      const label = gqlFormat(collectionId, "list");

      const document = gql`
         query($page: Int!) {
            entries: ${label}(page: $page, limit: 20) {
            totalDocs
            totalPages
            limit
            pagingCounter
            hasPrevPage
            prevPage
            nextPage
            hasNextPage
            docs {
               id
               name
               icon {
                  url
               }
            }
            }
         }
      `;

      const endpoint = gqlEndpoint({ siteSlug: collectionEntry?.site.slug });

      const { entries }: any = await gqlRequestWithCache(endpoint, document, {
         page,
      });
      return { entries };
   }

   //Otherwise pull data from core
   const data = await cacheThis(
      () =>
         payload.find({
            collection: "entries",
            where: {
               site: {
                  equals: collectionEntry?.site?.id,
               },
               "collectionEntity.slug": {
                  equals: collectionId,
               },
            },
            depth: 1,
            overrideAccess: false,
            user,
         }),
      `list-entries-${siteId}-${collectionId}`,
   );

   const filtered = data.docs.map((doc) => {
      return {
         ...select(
            {
               id: true,
               name: true,
               slug: true,
            },
            doc,
         ),
         icon: doc.icon && select({ id: false, url: true }, doc.icon),
      };
   });

   //Extract pagination fields
   const { docs, ...pagination } = data;

   //Combine filtered docs with pagination info
   const result = { docs: filtered, ...pagination };

   return { entries: result };
}
