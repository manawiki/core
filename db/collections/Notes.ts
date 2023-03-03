import type { CollectionConfig } from "payload/types";
import {
   isStaffFieldLevel,
   isStafforUser,
   isStafforUserorPublished,
   isLoggedIn,
} from "../access";
import type { User } from "payload/generated-types";

export const notesSlug = "notes";
export const Notes: CollectionConfig = {
   slug: notesSlug,
   // auth: true,
   // admin: {
   //     useAsTitle: "name",
   // },
   access: {
      read: isStafforUserorPublished("author"), //isAdminAuthororPublished
      create: isLoggedIn,
      delete: isStafforUser("author"), //isAdminorAuthor
      update: isStafforUser("author"), //isAdminorAuthor
      readVersions: isLoggedIn, //isAdminorAuthor, but not sure why this doesnt' work
   },
   fields: [
      {
         name: "author",
         type: "relationship",
         relationTo: "users",
         required: true,
         defaultValue: ({ user }: { user: User }) => user.id,
         access: {
            update: isStaffFieldLevel,
         },
         maxDepth: 0,
      },
      {
         name: "mdx",
         type: "textarea",
         required: true,
      },
      { name: "source", type: "textarea" },
      { name: "html", type: "textarea" },
      {
         name: "data",
         type: "array",
         fields: [{ name: "endpoints", type: "text" }],
      },
      {
         name: "ui",
         type: "relationship",
         relationTo: "notetypes",
         hasMany: false,
      },
   ],
   versions: {
      drafts: {
         autosave: {
            interval: 2000,
         },
      },
      maxPerDoc: 20,
   },
};
