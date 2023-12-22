import { getSiteSlug } from "~/routes/_site+/_utils/getSiteSlug.server";
import { gqlEndpoint } from "~/utils";
import { gqlRequestWithCache } from "~/utils/cache.server";

export interface ListFetchType {
   request: Request;
   gql?: {
      query: string;
      variables?: {};
   };
}

export async function fetchList({ request, gql }: ListFetchType) {
   const { siteSlug } = getSiteSlug(request);
   const gqlPath = gqlEndpoint({
      siteSlug,
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
