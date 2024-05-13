import type { CollectionConfig } from "payload/types";

import { afterDeleteHook, afterChangeHook } from "./collection-hooks";
import { canMutateAsSiteAdmin } from "../../access/canMutateAsSiteAdmin";
import { isStaffFieldLevel } from "../users/access";

export const collectionsSlug = "collections";

export const Collections: CollectionConfig = {
   slug: collectionsSlug,
   admin: {
      useAsTitle: "name",
   },
   access: {
      create: canMutateAsSiteAdmin("collections"),
      read: (): boolean => true,
      update: canMutateAsSiteAdmin("collections"),
      delete: canMutateAsSiteAdmin("collections"),
   },
   hooks: {
      afterChange: [afterChangeHook],
      afterDelete: [afterDeleteHook],
   },
   fields: [
      {
         name: "id",
         type: "text",
         required: true,
      },
      {
         name: "name",
         type: "text",
         required: true,
      },
      {
         name: "customDatabase",
         type: "checkbox",
         label: "Pull data from custom database",
         defaultValue: false,
         access: {
            update: isStaffFieldLevel,
         },
      },
      {
         name: "customEntryTemplate",
         type: "checkbox",
         label: "Enable custom entry template",
         defaultValue: false,
         access: {
            update: isStaffFieldLevel,
         },
      },
      {
         name: "customListTemplate",
         type: "checkbox",
         label: "Enable custom list template",
         defaultValue: false,
         access: {
            update: isStaffFieldLevel,
         },
      },
      {
         name: "hiddenCollection",
         type: "checkbox",
         label: "Hide Collection",
         defaultValue: false,
         access: {
            update: isStaffFieldLevel,
         },
      },
      {
         name: "slug",
         type: "text",
         required: true,
         index: true,
      },
      {
         name: "site",
         type: "relationship",
         relationTo: "sites",
         maxDepth: 1,
         required: true,
         hasMany: false,
         index: true,
      },
      {
         name: "icon",
         type: "upload",
         relationTo: "images",
      },
      {
         name: "sortGroups",
         type: "array",
         label: "Sort Groups",
         fields: [
            {
               name: "default",
               type: "checkbox",
            },
            {
               name: "label",
               type: "text",
               required: true,
            },
            {
               name: "value",
               type: "text",
               required: true,
            },
            {
               name: "defaultSortType",
               type: "select",
               defaultValue: "descending",
               options: [
                  {
                     label: "Ascending",
                     value: "ascending",
                  },
                  {
                     label: "Descending",
                     value: "descending",
                  },
               ],
            },
         ],
      },
      {
         name: "filterGroups",
         type: "array",
         label: "Filter Groups",
         fields: [
            {
               name: "label",
               type: "text",
               required: true,
            },
            {
               name: "filterKey",
               type: "text",
               required: true,
            },
            {
               name: "queryLogic",
               type: "select",
               required: true,
               defaultValue: "or",
               options: [
                  {
                     label: "or",
                     value: "or",
                  },
                  {
                     label: "and",
                     value: "and",
                  },
               ],
            },
            {
               name: "queryOperator",
               type: "select",
               required: true,
               defaultValue: "equals",
               options: [
                  {
                     label: "Equals",
                     value: "equals",
                  },
                  {
                     label: "Contains",
                     value: "contains",
                  },
               ],
            },
            {
               type: "array",
               name: "filterItem",
               fields: [
                  { name: "name", type: "text", required: true },
                  { name: "value", type: "text", required: true },
                  { name: "icon", type: "text" },
               ],
            },
         ],
      },
      {
         name: "sections",
         type: "array",
         label: "Sections",
         labels: {
            singular: "Section",
            plural: "Sections",
         },
         fields: [
            {
               name: "id",
               type: "text",
               required: true,
            },
            {
               name: "slug",
               type: "text",
               required: true,
            },
            {
               name: "name",
               type: "text",
            },
            {
               name: "showTitle",
               type: "checkbox",
               label: "Display Title",
               defaultValue: true,
            },
            {
               name: "showAd",
               type: "checkbox",
               label: "Show Ad",
               defaultValue: false,
            },
            {
               name: "viewType",
               type: "select",
               required: true,
               defaultValue: "tabs",
               options: [
                  {
                     label: "Tabs",
                     value: "tabs",
                  },
                  {
                     label: "Rows",
                     value: "rows",
                  },
               ],
            },
            {
               name: "subSections",
               type: "array",
               label: "Sub-Sections",
               fields: [
                  {
                     name: "id",
                     type: "text",
                     required: true,
                  },
                  {
                     name: "slug",
                     type: "text",
                     required: true,
                  },
                  {
                     name: "name",
                     type: "text",
                  },
                  {
                     name: "showTitle",
                     type: "checkbox",
                     label: "Display Title",
                     defaultValue: false,
                  },
                  {
                     name: "type",
                     type: "select",
                     required: true,
                     options: [
                        {
                           label: "Editor",
                           value: "editor",
                        },
                        {
                           label: "Custom Template",
                           value: "customTemplate",
                        },
                        {
                           label: "Q & A",
                           value: "qna",
                        },
                        {
                           label: "Comments",
                           value: "comments",
                        },
                     ],
                  },
               ],
            },
         ],
      },
   ],
};
