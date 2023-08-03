import type { LoaderArgs } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";

import { settings } from "mana-config";
import type { Collection } from "payload/generated-types";

const toXmlSitemap = (urls: string[]) => {
   const urlsAsXml = urls
      .map((url) => `<url><loc>${url}</loc></url>`)
      .join("\n");

   return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
      >
        ${urlsAsXml}
      </urlset>
    `;
};

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderArgs) {
   const { siteId } = zx.parseParams(params, {
      siteId: z.string(),
   });

   const siteData = await payload.find({
      collection: "sites",
      depth: 0,
      where: {
         slug: {
            equals: siteId,
         },
      },
   });
   const id = siteData?.docs[0].id;
   const isCustom = siteData?.docs[0]?.type == "custom";
   const { docs: collections } = await payload.find({
      collection: "collections",
      depth: 0,
      where: {
         hiddenCollection: {
            equals: false,
         },
         site: {
            equals: id,
         },
      },
      limit: 1000,
   });

   const { docs: posts } = await payload.find({
      collection: "posts",
      depth: 0,
      where: {
         site: {
            equals: id,
         },
         _status: {
            equals: "published",
         },
      },
      limit: 1000,
   });

   const { docs: entries } = await payload.find({
      collection: "entries",
      depth: 1,
      where: {
         site: {
            equals: id,
         },
      },
      limit: 1000,
   });

   const processCustomEntries =
      isCustom &&
      (await Promise.all(
         collections.map(async (collection: Collection) => {
            const url = `https://${siteId}-db.${settings.domain}/api/${collection.slug}?depth=0&limit=1000`;
            const { docs } = await (await fetch(url)).json();
            return docs.map(
               ({ id }: { id: string }) =>
                  `${settings.domainFull}/${siteId}/collections/${collection.slug}/${id}`
            );
         })
      ));

   const customEntries = processCustomEntries
      ? processCustomEntries.flatMap((items) => items)
      : [];

   try {
      const sitemap = toXmlSitemap([
         `${settings.domainFull}/${siteId}`,
         `${settings.domainFull}${siteId}/collections`,
         `${settings.domainFull}/${siteId}/posts`,
         ...posts.map(
            ({ url, id }) =>
               `${settings.domainFull}/${siteId}/posts/${id}/${url}`
         ),
         ...collections.map(
            ({ slug }) => `${settings.domainFull}/${siteId}/${slug}`
         ),
         ...entries.map(
            ({ id, collectionEntity }) =>
               `${settings.domainFull}/${siteId}/collections/${collectionEntity?.slug}/${id}`
         ),
         ...customEntries,
      ]);
      return new Response(sitemap, {
         status: 200,
         headers: {
            "Content-Type": "application/xml",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=3600",
         },
      });
   } catch (e) {
      throw new Response("Internal Server Error", { status: 500 });
   }
}
