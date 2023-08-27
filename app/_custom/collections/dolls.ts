import type { CollectionConfig } from "payload/types";

import { isStaff } from "../../access/user";

export const Dolls: CollectionConfig = {
   slug: "dolls",
   labels: { singular: "doll", plural: "dolls" },
   admin: {
      group: "Custom",
      useAsTitle: "name",
   },
   access: {
      create: isStaff,
      read: () => true,
      update: isStaff,
      delete: isStaff,
   },
   fields: [
      {
         name: "id",
         type: "text",
      },
      {
         name: "name",
         type: "text",
      },
      {
         name: "icon",
         type: "upload",
         relationTo: "images",
      },
      {
         name: "bust_img",
         type: "upload",
         relationTo: "images"
      },
      {
         name: "gacha_img",
         type: "upload",
         relationTo: "images"
      },
      {
         name: "half_img",
         type: "upload",
         relationTo: "images"
      },
      {
         name: "whole_img",
         type: "upload",
         relationTo: "images"
      }
   ],
};
