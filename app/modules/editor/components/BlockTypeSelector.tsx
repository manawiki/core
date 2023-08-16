import type { ReactNode } from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
   CheckSquare,
   Codesandbox,
   Heading2,
   Heading3,
   ImagePlus,
   LayoutList,
   List,
   Type,
   Youtube,
} from "lucide-react";
import { nanoid } from "nanoid";

import { CustomBlocksAddConfig } from "~/_custom/blocks";
import Tooltip from "~/components/Tooltip";

import { GROUP_COLORS } from "../blocks/BlockGroup";
import type { CustomElement } from "../types";
import { BlockType } from "../types";

type Props = {
   children: ReactNode;
   onSelect: (block: CustomElement) => void;
};

export default function BlockTypeSelector({ children, onSelect }: Props) {
   const groups = [
      {
         label: "Widgets",
         items: [
            {
               label: "Group",
               icon: <LayoutList size={20} />,
               description: "Create a group of collections",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     viewMode: "2-col",
                     itemsViewMode: "grid",
                     type: BlockType.Group,
                     collection: "",
                     groupItems: [],
                     children: [{ text: "" }],
                  });
               },
            },
            // {
            //    label: "Updates",
            //    icon: <LayoutList size={20} />,
            //    description: "Create a list of Updates",
            //    onSelect: () => {
            //       onSelect({
            //          id: nanoid(),
            //          type: BlockType.Updates,
            //          children: [{ text: "" }],
            //       });
            //    },
            // },
         ],
      },
      {
         label: "Text",
         items: [
            {
               label: "Heading 2",
               icon: <Heading2 size={20} />,
               description: "Large size heading",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.H2,
                     children: [{ text: "" }],
                  });
               },
            },
            {
               label: "Heading 3",
               icon: <Heading3 size={20} />,
               description: "Medium size heading",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.H3,
                     children: [{ text: "" }],
                  });
               },
            },
            {
               label: "Normal text",
               icon: <Type size={20} />,
               description: "Plain text",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.Paragraph,
                     children: [{ text: "" }],
                  });
               },
            },
            {
               label: "Bulleted list",
               icon: <List size={20} />,
               description: "A basic bulleted list",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.BulletedList,
                     children: [{ text: "" }],
                  });
               },
            },
            {
               label: "To do list",
               icon: <CheckSquare size={20} />,
               description: "A basic to do list",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.ToDo,
                     checked: false,
                     children: [{ text: "" }],
                  });
               },
            },
         ],
      },
      {
         label: "Media",
         items: [
            {
               label: "Image",
               icon: <ImagePlus size={20} />,
               description: "Embed from URL",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.Image,
                     refId: null,
                     url: null,
                     children: [{ text: "" }],
                  });
               },
            },
            {
               label: "Youtube Video",
               icon: <Youtube size={20} />,
               description: "Embed YouTube video",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.Video,
                     url: null,
                     children: [{ text: "" }],
                  });
               },
            },
         ],
      },
      {
         label: "Embeds",
         items: [
            {
               label: "CodeSandbox",
               icon: <Codesandbox size={20} />,
               description: "Embed CodeSandbox project",
               onSelect: () => {
                  onSelect({
                     id: nanoid(),
                     type: BlockType.CodeSandbox,
                     url: null,
                     children: [{ text: "" }],
                  });
               },
            },
         ],
      },
   ];

   //If custom site has blocks, add to select options
   const customBlocks = CustomBlocksAddConfig(onSelect);
   if (customBlocks) {
      groups.push(customBlocks);
   }

   return (
      <DropdownMenuPrimitive.Root>
         <Tooltip id="insert-block" content="Insert block below">
            <DropdownMenuPrimitive.Trigger asChild>
               {children}
            </DropdownMenuPrimitive.Trigger>
         </Tooltip>

         <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
               className="shadow-1 border-color bg-2 relative z-10
               h-72 w-60 overflow-scroll rounded-lg border shadow outline-none"
            >
               {groups.map((group, indexGroup) => {
                  return (
                     <DropdownMenuPrimitive.Group key={indexGroup} className="">
                        <DropdownMenuPrimitive.Label
                           className="text-1 bg-2 sticky top-0 px-2.5 pb-1.5 pt-2.5 text-xs
                        font-bold"
                        >
                           {group?.label}
                        </DropdownMenuPrimitive.Label>
                        <div className="border-color divide-color divide-y border-y">
                           {groups[indexGroup]?.items?.map(
                              (item, indexItem) => {
                                 return (
                                    <DropdownMenuPrimitive.DropdownMenuItem
                                       className="bg-3 flex cursor-pointer items-center gap-3 space-y-1 p-3
                                    text-xs outline-none hover:bg-zinc-50 dark:hover:bg-bg2Dark"
                                       key={indexItem}
                                       onSelect={item.onSelect}
                                    >
                                       {item.icon && (
                                          <div
                                             className="flex h-8 w-8 items-center justify-center
                                     rounded-lg bg-zinc-100 dark:bg-bg4Dark"
                                          >
                                             {item.icon}
                                          </div>
                                       )}
                                       <div>
                                          <div className="font-bold text-zinc-500 dark:text-zinc-300">
                                             {item.label}
                                          </div>
                                          <div className="text-1 text-xs">
                                             {item.description}
                                          </div>
                                       </div>
                                    </DropdownMenuPrimitive.DropdownMenuItem>
                                 );
                              }
                           )}
                        </div>
                     </DropdownMenuPrimitive.Group>
                  );
               })}
            </DropdownMenuPrimitive.Content>
         </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
   );
}
