import type { Access } from "payload/types";

import type { Site, User } from "payload/generated-types";

//Check if user is a site owner or admin?
export const isSiteOwnerOrAdmin = (userId: string, site: Site) => {
   const siteAdmins = site.admins;
   const siteOwner = site.owner;
   const isSiteOwner = userId == (siteOwner as any);
   //@ts-ignore
   const isSiteAdmin = siteAdmins && siteAdmins.includes(userId);
   if (isSiteOwner || isSiteAdmin) return true;
   return false;
};

export const canRead =
   (
      collectionSlug:
         | "collections"
         | "entries"
         | "posts"
         | "updates"
         | "homeContents"
         | "contentEmbeds"
   ): Access =>
   async ({ req: { user, payload }, id }) => {
      if (user && user.roles.includes("staff")) return true;
      if (user && collectionSlug && id) {
         const content = await payload.findByID({
            collection: collectionSlug,
            id,
         });
         if (content.site) return isSiteOwnerOrAdmin(user.id, content.site);
      }
      /**
       * If there is no user,
       * restrict the documents that are returned
       * to only those where `_status` is equal to `published`
       * or where `_status` does not exist
       * */

      return {
         or: [
            {
               _status: {
                  equals: "published",
               },
            },
            {
               _status: {
                  exists: false,
               },
            },
         ],
      };
   };

export const canMutateAsSiteAdmin =
   (
      collectionSlug:
         | "collections"
         | "entries"
         | "posts"
         | "updates"
         | "homeContents"
         | "contentEmbeds"
   ): Access =>
   async ({ req: { user, payload }, id: resultId, data }) => {
      if (user) {
         if (user.roles.includes("staff")) return true;
         const userId = user.id;
         // Update and Delete
         if (resultId) {
            const item = await payload.findByID({
               collection: collectionSlug,
               id: resultId,
               depth: 1,
            });
            if (item.site) return isSiteOwnerOrAdmin(userId, item.site);
         }
         // Create
         if (data) {
            const site = await payload.findByID({
               collection: "sites",
               id: data.site,
               depth: 0,
            });
            return isSiteOwnerOrAdmin(userId, site);
         }
      }
      // Reject everyone else
      return false;
   };
