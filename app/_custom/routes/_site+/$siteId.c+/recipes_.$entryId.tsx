import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { Recipe } from "payload/generated-custom-types";
import { Header } from "~/_custom/components/recipes/Header";
import { Ingredients } from "~/_custom/components/recipes/Ingredients";
import { Relics } from "~/_custom/components/recipes/Relics";
import { SpecialMats } from "~/_custom/components/recipes/SpecialMats";
import {
   getAllEntryData,
   getCustomEntryData,
   meta,
} from "~/routes/_site+/$siteId.c_+/$collectionId_.$entryId";
import { Entry } from "~/routes/_site+/$siteId.c_+/components/Entry";

export { meta };

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderFunctionArgs) {
   const { entry } = await getAllEntryData({
      payload,
      params,
      request,
      user,
   });
   const entryDefault = (await getCustomEntryData({
      payload,
      params,
      request,
      depth: 3,
   })) as Recipe;

   return json({ entryDefault, entry });
}

export default function RecipeEntry() {
   const { entryDefault } = useLoaderData<typeof loader>();
   return (
      <Entry>
         {/* Image */}
         <Header pageData={entryDefault} />

         {/* Relic Results */}
         <Relics pageData={entryDefault} />

         {/* Ingredients */}
         <Ingredients pageData={entryDefault} />

         {/* Special Ingredients */}
         <SpecialMats pageData={entryDefault} />
      </Entry>
   );
}