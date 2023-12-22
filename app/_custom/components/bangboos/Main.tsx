import type { Bangboo as BangbooType } from "payload/generated-custom-types";
import { Disclosure } from "@headlessui/react";
import { Image } from "~/components/Image";
import { useState } from "react";

export function Main({ data: char }: { data: BangbooType }) {
   const [level, setLevel] = useState(0);

   const mainImage = char?.icon_full?.url;
   const mainName = char?.name;
   const mainDesc = char?.desc;
   const mainStatDisplay = [
      {
         label: "Rarity",
         value: "",
         icon: char.rarity?.icon?.url,
      },
   ];
   const basicStatDisplay = [
      {
         label: "HP",
         value: char?.hp,
         icon: "https://static.mana.wiki/zzz/IconHpMax.png",
      },
      {
         label: "ATK",
         value: char?.atk,
         icon: "https://static.mana.wiki/zzz/IconAttack.png",
      },
      {
         label: "Impact",
         value: char?.impact,
         icon: "https://static.mana.wiki/zzz/IconBreakStun.png",
      },
      {
         label: "DEF",
         value: char?.def,
         icon: "https://static.mana.wiki/zzz/IconDef.png",
      },
   ];

   return (
      <>
         <div className="laptop:grid laptop:grid-cols-2 laptop:gap-4">
            <section>
               <div className="flex items-center justify-center shadow-sm shadow-1 border border-color-sub rounded-lg dark:bg-dark350 bg-zinc-50 h-full p-3">
                  <Image
                     height={280}
                     className="object-contain"
                     url={
                        mainImage ??
                        "https://static.mana.wiki/zzz/Run2_00016.png"
                     }
                     options="height=280"
                     alt={mainName ?? "Icon"}
                  />
               </div>
            </section>
            <section>
               <div
                  className="border border-color-sub divide-y divide-color-sub shadow-sm shadow-1 rounded-lg 
          [&>*:nth-of-type(odd)]:bg-zinc-50 dark:[&>*:nth-of-type(odd)]:bg-dark350 overflow-hidden"
               >
                  {mainStatDisplay?.map((row) => (
                     <div className="px-3 py-2 justify-between flex items-center gap-2">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-sm">
                              {row.label}
                           </span>
                        </div>
                        <div className="text-sm font-semibold">
                           <span className="inline-block align-middle">
                              {row.value}
                           </span>
                           {row.icon ? (
                              <>
                                 <div className="items-center inline-block align-middle rounded-md justify-center dark:bg-dark350 bg-zinc-600 h-full ml-2">
                                    <Image
                                       width={30}
                                       className="object-contain"
                                       url={row?.icon}
                                       options="width=30"
                                       alt={mainName ?? "Icon"}
                                    />
                                 </div>
                              </>
                           ) : null}
                        </div>
                     </div>
                  ))}

                  {basicStatDisplay?.map((stat) => <StatBlock attr={stat} />)}

                  {/* Description */}
                  <div className="px-3 py-2 justify-between flex items-center gap-2">
                     {mainDesc}
                  </div>
               </div>
            </section>
         </div>
      </>
   );
}

const StatBlock = ({ attr }: any) => {
   const attr_icon = attr?.icon;
   const attr_name = attr?.label;
   const attr_val = attr?.value;
   const attr_perc = attr?.percent;

   return (
      <>
         <div className="px-3 py-2 justify-between flex items-center gap-2">
            <div className="flex items-center gap-2">
               {attr_icon ? (
                  <>
                     <div className="items-center inline-block align-middle justify-center h-full mr-1 invert-[0.3]">
                        <Image
                           height={30}
                           className="object-contain"
                           url={attr_icon}
                           options="height=30"
                           alt={attr_name ?? "Icon"}
                        />
                     </div>
                  </>
               ) : null}
               <span className="font-semibold text-sm inline-block align-middle">
                  {attr_name}
               </span>
            </div>
            <div className="text-sm font-semibold">
               <span className="inline-block align-middle">
                  {attr_perc ? attr_val / 100 + "%" : attr_val}
               </span>
            </div>
         </div>
      </>
   );
};