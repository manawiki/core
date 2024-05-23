import { useState, type ReactNode } from "react";

import { useLocation, useParams } from "@remix-run/react";
import clsx from "clsx";

import type { Collection } from "~/db/payload-types";
import { useSiteLoaderData } from "~/utils/useSiteLoaderData";

import { Section } from "./Section";
import { CollectionHeader } from "../../_components/CollectionHeader";
import type { Section as SectionType } from "../../_components/List";

export function Entry({
   children,
   customData,
   customComponents,
   className,
}: {
   children?: ReactNode;
   customData?: unknown;
   customComponents?: unknown;
   className?: string;
}) {
   const { site } = useSiteLoaderData();

   //Get path for custom site, cant use useParams since it doesn't exist when using a custom template
   const { pathname } = useLocation();
   const collectionSlug = pathname.split("/")[2];
   const collectionId = useParams()?.collectionId ?? collectionSlug;
   const collection = site?.collections?.find(
      (collection) => collection.slug === collectionId,
   ) as Collection;

   const [allSections, setAllSections] = useState(
      collection?.sections as SectionType[],
   );
   const [isChanged, setIsChanged] = useState(false);

   return (
      <>
         <CollectionHeader
            collection={collection}
            allSections={allSections}
            setAllSections={setAllSections}
            setIsChanged={setIsChanged}
            isChanged={isChanged}
         />
         <div
            className={clsx(
               "max-tablet:px-3 py-3 laptop:py-5 laptop:pb-44 max-w-[728px] mx-auto",
               className,
            )}
         >
            {children ? (
               children
            ) : (
               <Section
                  customData={customData}
                  customComponents={customComponents}
               />
            )}
         </div>
      </>
   );
}
