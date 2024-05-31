import { Site } from "~/db/payload-types";
import { Image } from "~/components/Image";

import { Icon } from "~/components/Icon";
import { useState } from "react";
import {
   DndContext,
   DragEndEvent,
   DragOverlay,
   DragStartEvent,
   closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
   SortableContext,
   arrayMove,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SideMenuSection } from "./SideMenuSection";
import { Button } from "~/components/Button";
import { nanoid } from "nanoid";
import { useFetcher } from "@remix-run/react";
import { isAdding } from "~/utils/form";

export function SideMenu({ site }: { site: Site }) {
   const fetcher = useFetcher();

   const [activeId, setActiveId] = useState<string | null>(null);

   const savingMenu = isAdding(fetcher, "saveMenu");

   const activeSection = site?.menu?.find(
      (x) => "id" in x && x.id === activeId,
   );

   function handleDragStart(event: DragStartEvent) {
      if (event.active) {
         setActiveId(event.active.id as string);
      }
   }

   const [menus, setMenu] = useState(site?.menu);

   const isChanged = JSON.stringify(menus) !== JSON.stringify(site?.menu);

   function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (active.id !== over?.id) {
         const oldIndex = menus?.findIndex((x) => x.id == active.id);
         const newIndex = menus?.findIndex((x) => x.id == over?.id);
         //@ts-ignore
         setMenu((items) => {
            //@ts-ignore
            return arrayMove(items, oldIndex, newIndex);
         });
      }
      setActiveId(null);
   }

   return (
      <div>
         <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={closestCenter}
         >
            <SortableContext
               //@ts-ignore
               items={menus}
               strategy={verticalListSortingStrategy}
            >
               {menus?.map((item) => (
                  <SideMenuSection
                     key={item.id}
                     menuSection={item}
                     setMenu={setMenu}
                  />
               ))}
            </SortableContext>
            <DragOverlay adjustScale={false}>
               {activeSection && (
                  <SideMenuSection
                     menuSection={activeSection}
                     setMenu={setMenu}
                  />
               )}
            </DragOverlay>
         </DndContext>
         <div className="py-3 px-2.5 flex items-center">
            <button
               onClick={() =>
                  //@ts-ignore
                  setMenu((existingMenuItems) => {
                     const newMenuSection = [
                        //@ts-ignore
                        ...existingMenuItems,
                        {
                           id: nanoid(),
                           name: "Untitled",
                           links: [
                              { id: nanoid(), name: "Untitled", path: "/" },
                           ],
                        },
                     ];
                     return newMenuSection;
                  })
               }
               className="flex items-center justify-center gap-1.5 dark:hover:bg-dark350 hover:bg-zinc-100 rounded-lg py-2 px-2.5"
            >
               <Icon
                  name="list-plus"
                  className="text-zinc-400 dark:text-zinc-600"
                  size={16}
               />
               <span className="text-xs text-1">Add Menu Section</span>
            </button>
         </div>
         {/* Menu controls */}
         <div
            className="w-full tablet:w-[376px] fixed bottom-0 left-0 tablet:bottom-3 desktop:bottom-0 tablet:left-3 
            desktop:w-[229px] backdrop-blur-lg flex flex-col tablet:rounded-b-lg"
         >
            {isChanged && (
               <div className="grid grid-cols-2 justify-center gap-3 p-4">
                  <Button
                     onClick={() => setMenu(site?.menu)}
                     className="!py-1 !px-2 text-xs"
                     color="zinc"
                  >
                     Cancel
                  </Button>
                  <Button
                     disabled={savingMenu}
                     type="submit"
                     onClick={() => {
                        return fetcher.submit(
                           //@ts-ignore
                           {
                              intent: "saveMenu",
                              siteMenu: JSON.stringify(menus),
                              siteId: site.id,
                           },
                           {
                              method: "POST",
                              action: "/settings/site",
                           },
                        );
                     }}
                     className="!py-1 !px-2 text-xs"
                     color="green"
                  >
                     {savingMenu ? "Saving..." : "Save"}
                  </Button>
               </div>
            )}
         </div>
      </div>
   );
}
