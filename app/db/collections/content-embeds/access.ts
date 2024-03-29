import type { Access } from "payload/types";

import { isSiteAdmin } from "../../access/isSiteAdmin";
import { isSiteContributor } from "../../access/isSiteContributor";
import { isSiteOwner } from "../../access/isSiteOwner";
import { isSiteStaff } from "../../access/isSiteStaff";

//@ts-ignore
export const canReadContentEmbed: Access = async ({ req: { user } }) => {
   if (user) {
      const isStaff = isSiteStaff(user?.roles);
      if (isStaff) return true;
      return {
         or: [
            {
               _status: {
                  equals: "published",
               },
            },
            {
               author: { equals: user.id },
            },
            {
               "site.owner": {
                  equals: user.id,
               },
            },
            {
               "site.admins": {
                  contains: user.id,
               },
            },
            {
               "site.contributors": {
                  contains: user.id,
               },
            },
         ],
      };
   }
   return {
      _status: {
         equals: "published",
      },
   };
};

export const canCreateContentEmbed: Access = async ({
   req: { user, payload },
   data,
}) => {
   if (user) {
      const isStaff = isSiteStaff(user?.roles);
      if (isStaff) return true;

      if (data) {
         const site = await payload.findByID({
            collection: "sites",
            id: data.site,
            depth: 0,
         });
         const isOwner = isSiteOwner(user?.id, site?.owner as any);
         const isAdmin = isSiteAdmin(user?.id, site?.admins as any[]);
         const isContributor = isSiteContributor(
            user?.id,
            site?.contributors as any[],
         );

         return isOwner || isAdmin || isContributor;
      }
   }
   // Reject everyone else
   return false;
};

//@ts-ignore
export const canDeleteContentEmbed: Access = async ({ req: { user } }) => {
   if (user) {
      const isStaff = isSiteStaff(user?.roles);
      if (isStaff) return true;
      return {
         or: [
            {
               "site.owner": {
                  equals: user.id,
               },
            },
            {
               "site.admins": {
                  contains: user.id,
               },
            },
         ],
      };
   }
   // Reject everyone else
   return false;
};

//@ts-ignore
export const canUpdateContentEmbed: Access = async ({ req: { user } }) => {
   if (user) {
      const isStaff = isSiteStaff(user?.roles);
      if (isStaff) return true;
      return {
         or: [
            {
               "site.owner": {
                  equals: user.id,
               },
            },
            {
               "site.admins": {
                  contains: user.id,
               },
            },
            {
               "site.contributors": {
                  contains: user.id,
               },
            },
         ],
      };
   }
   // Reject everyone else
   return false;
};
