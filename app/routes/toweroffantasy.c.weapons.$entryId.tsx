import axios from "axios";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import qs from "qs";

import { useState } from "react";
import { Disclosure } from "@headlessui/react";
import {
   PlayCircle as BsCaretDownFill,
   Star as HiStar,
   Star as HiOutlineStar,
} from "lucide-react";

const entryQuery = {
   id: "primary",
   type: "single",
   collection: "weapons",
   queryString: {
      populate: {
         icon: { fields: ["url"] },
         stats: {
            populate: { stat: { populate: { icon: { populate: "*" } } } },
         },
         rarity: { populate: "*" },
         skills: {
            populate: {
               icon: { populate: "*" },
               subskills: { populate: "*" },
            },
         },
         element: { populate: "*" },
         augments: {
            populate: {
               items: {
                  populate: {
                     item: { populate: { icon: { fields: ["url"] } } },
                  },
               },
            },
         },
         category: { populate: "*" },
         simulacrum: { populate: "*" },
         advancements: {
            populate: {
               items: {
                  populate: {
                     item: { populate: { icon: { fields: ["url"] } } },
                  },
               },
               multipliers: { populate: "*" },
            },
         },
      },
   },
};
export async function loader({ params }: LoaderArgs) {
   const { entryId } = params;

   const { data } = await axios.get(
      `https://toweroffantasy.api.nalu.wiki/api/weapons/${
         entryId ?? "4"
      }?${qs.stringify(entryQuery.queryString)}`
   );

   return { data: { primary: data } };
}

export default function Entry() {
   const { data } = useLoaderData<typeof loader>();
   return <Stats data={data} />;
}

export const Stats = (props: any) => {
   const weapon = props.data.primary.data.attributes;

   // Usestate Variable Settings
   const [levelSliderValue, setLevelSliderValue] = useState(140);
   const [levelAdvancement, setLevelAdvancement] = useState(0);

   // Initializing Stat information
   // Generally the first stat in weapons is "Attack".
   // =====================================
   // PREPROCESSING STEPS
   // Create an object that can be iterated through to generate data rows of stat data

   var statobj = weapon.stats?.map((a: any, i: any) => {
      // Pulling Advancement Stat array multipliers for each existing weapon stat
      var multdata = weapon.advancements?.map((m: any) => {
         return m.multipliers?.find(
            (s) => s.stat_key == a.stat?.data?.attributes?.stat_key
         )?.multiplier;
      });
      var statdata = {
         stat: a.stat?.data?.attributes?.name,
         stat_key: a.stat?.data?.attributes?.stat_key,
         hash: a.stat?.data?.attributes?.icon?.data?.attributes?.url,
         // colormod: i % 2,
         values: a.values?.map((v: any) => v),
         multipliers: multdata,
      };
      return statdata;
   });

   // Advancement Button # array
   var advobj = [...Array(statobj[0]?.multipliers?.length + 1).keys()];

   // =====================================
   // End Preprocessing for Stat Block, Output HTML Start
   // =====================================

   return (
      <>
         <div className="my-3">
            {/* ======================== */}
            {/* Stat Block Section */}
            {/* ======================== */}
            <div>
               <div className="wiki-infobox">
                  {statobj.map((stat: any, index: any) => {
                     return (
                        /*2b) Alternating background stats for 5 or 6 stats depending on bonus stat */
                        <div className="wiki-infobox-row" key={index}>
                           {/* 2bi) Stat Icon */}
                           <div className="wiki-infobox-label flex items-center gap-2.5">
                              <div>
                                 {stat.hash ? (
                                    <div
                                       className="relative inline-flex h-6 w-6 items-center 
                          justify-center rounded-full bg-gray-300 align-middle"
                                    >
                                       <img
                                          alt="Stat Icon"
                                          src={
                                             stat.hash ?? "no_image_42df124128"
                                          }
                                          className="relative inline-block object-contain"
                                          height="20"
                                          width="20"
                                       />
                                    </div>
                                 ) : null}
                              </div>
                              <div>{stat.stat}</div>
                           </div>
                           {/* 2biii) Stat value */}
                           <div className="">
                              {formatStat(
                                 stat.stat,
                                 levelAdvancement == 0
                                    ? Math.floor(stat.values[levelSliderValue])
                                    : Math.floor(
                                         stat.values[levelSliderValue] *
                                            stat.multipliers[
                                               levelAdvancement - 1
                                            ]
                                      )
                              )}
                           </div>

                           {/* 2bii.a) Show bonus icon if stat is Secondary Stat ? */}
                           {/* 
                    {stat.bonus ? (
                      <div className="inline-flex absolute items-center align-middle justify-center rounded-full h-4 w-4 mt-1 right-2/3 bg-gray-400 text-center">
                        <img
                          src="https://res.cloudinary.com/genshinimpact-nalu/image/upload/v1631645303/UI_Icon_Arrow_Point_1a06775238.png"
                          height="15"
                          width="15"
                        ></img>
                      </div>
                    ) : null}
                     */}
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
         {/* ======================== */}
         {/* Stats Slider and additional top info block */}
         {/* ======================== */}
         {/* 2a) Header for Adjusting Level and Slider */}
         {/* ======================== */}
         <div className="relative w-full">
            <div className="wiki-cell mb-3 !pb-4">
               <div className="flex w-full items-center justify-center gap-2 text-center">
                  {/* Level Label */}
                  <div>Lvl</div>
                  {/* Level Input Box */}
                  <input
                     className="tof-level-input-box bg-nested border-color-primary mx-2 inline-flex
              h-8 w-12 justify-center rounded-md border text-center align-middle "
                     type="number"
                     value={levelSliderValue}
                     onChange={(event) => {
                        const numonly = /^[0-9\b]+$/;
                        const maxval = 140;

                        // Only set the level slider value if the entered value is not blank or a Number. Parseint as well so leading 0s are removed.
                        if (numonly.test(event.target.value)) {
                           var input = parseInt(event.target.value);
                           if (input > maxval) {
                              input = maxval;
                           } else if (input < 1) {
                              input = 1;
                           }
                           setLevelSliderValue(input);
                        }
                     }}
                  ></input>

                  {/* Slider */}
                  <input
                     className="tof-level-slider my-4 inline-flex w-4/5 justify-end rounded-lg align-middle"
                     type="range"
                     min="0"
                     max="140"
                     value={levelSliderValue}
                     onChange={(event) =>
                        setLevelSliderValue(parseInt(event.target.value))
                     }
                  ></input>
               </div>

               {/* 2a-i) Advancement Stat Multiplier Button toggle */}
               {/* ================================================ */}
               {/* Only show if there are actually advancement levels */}
               {advobj.length > 1 ? (
                  <div className="mt-4 flex items-center justify-center">
                     <div
                        className="bg-nested border-color-primary w-full items-center justify-center gap-5
             rounded-md border p-5 laptop:mx-3 laptop:flex laptop:h-12 laptop:rounded-full"
                     >
                        <div className="pb-2 text-center font-bold text-gray-500 dark:text-gray-400 laptop:pb-0">
                           Advancement
                        </div>
                        <div className="flex items-center justify-center gap-3">
                           {/* Create a list of Server buttons to adjust which server is highlighted */}

                           {advobj.map((adv: any) => {
                              return (
                                 <button
                                    className={`${
                                       levelAdvancement >= adv
                                          ? "bg-gray-100 dark:bg-gray-700 "
                                          : " dark:bg-dark_200 "
                                    } 
                  border-color-primary flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm `}
                                    onClick={(e) => {
                                       setLevelAdvancement(adv);
                                    }}
                                    key={"advancement-" + adv}
                                 >
                                    {adv == 0 ? (
                                       <HiOutlineStar className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                       <HiStar className="h-5 w-5 text-yellow-500" />
                                    )}
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               ) : null}
            </div>

            {/* 2c0) Material Summary - Just shows the Talent Mat(s) [Book + Boss mat(s)] and Ascension Mat(s) [Crystal + Ingredient + Monster Drop] */}
            {/* <MaterialSummaryTop charData={charData} talentData={talentData} /> */}

            {/* 2ci) Character Stat Graph */}
            {/* - Should include a drop down stat selector, shading between pre-post ascension breakpoints */}
            {/* <StatGraph statData={statobj} /> */}

            {/* 2d) Collapsible? Tab for Full Stats - We do want to hide this because we wanna make it more work for people to find this? 
        UPDATE: Hidden for now due to slider. CSV version still available for full stat table. */}
            {/* <Stats charData={charData} /> */}
            {/* <CSVStats charData={pageData} /> */}

            {/* 2e) Collapsible Tab for link to Detailed BinOutput (JSON describing detailed parameters for character skills and attacks) */}
            {/* <BinOutputLink charData={charData} /> */}

            {/* 3) Skill Data - Utilize Slider setting */}
            <Skills props={props} levelSliderValue={levelSliderValue} />
         </div>
      </>
   );
};

const Skills = ({ props, levelSliderValue }) => {
   //   console.log(props);
   return (
      <>
         <section>
            {props?.data?.primary?.data?.attributes?.skills?.length ===
            0 ? null : (
               <>
                  <h2>Skills</h2>

                  <div className="space-y-3">
                     {props?.data?.primary?.data?.attributes?.skills?.map(
                        (skill: any) => (
                           <Disclosure key={skill.id}>
                              {({ open }) => (
                                 <>
                                    <Disclosure.Button
                                       className={`${
                                          open ? "!rounded-b-none" : ""
                                       } wiki-cell flex w-full items-center text-left`}
                                    >
                                       <div className="flex flex-grow items-center gap-2.5 font-semibold">
                                          <div className="h-9 w-9 rounded-full bg-gray-400 dark:bg-dark_100">
                                             <img
                                                width={50}
                                                height={50}
                                                alt={skill.name}
                                                src={`${skill.icon.data.attributes.url}?width=80`}
                                             />
                                          </div>
                                          <div>{skill.name}</div>
                                       </div>
                                       <div className="bg-nested flex h-9 w-9 items-center justify-center rounded-full shadow-sm">
                                          <BsCaretDownFill
                                             className={`${
                                                open
                                                   ? "rotate-180 transform"
                                                   : ""
                                             } theme-color h-4 w-4`}
                                          />
                                       </div>
                                    </Disclosure.Button>
                                    <Disclosure.Panel
                                       className={`${
                                          open
                                             ? "!mt-0 !rounded-t-none !border-t-0"
                                             : ""
                                       } wiki-cell divide-y overflow-hidden !p-0 dark:divide-dark_50`}
                                    >
                                       {skill?.subskills.length === 0 ? null : (
                                          <>
                                             {skill?.subskills?.map(
                                                (sub: any, index) => {
                                                   // Usestate Variable Settings
                                                   // ==========================
                                                   const [
                                                      showParamId,
                                                      setShowParamId,
                                                   ] = useState(false);

                                                   // Generate this skill's description with {#} instances replaced with parameter matching level
                                                   // Skill Level = 0 (Lv0-10), 1 (Lv11-20), etc
                                                   const slv =
                                                      levelSliderValue == 0
                                                         ? 0
                                                         : Math.floor(
                                                              (levelSliderValue -
                                                                 1) /
                                                                 10
                                                           );

                                                   // Get list of parameters
                                                   const paramlist =
                                                      Object.keys(sub.params);
                                                   // Get base description, and replace {#} instances
                                                   const basedesc =
                                                      sub.description;
                                                   var replacedesc = basedesc;
                                                   if (paramlist.length > 0) {
                                                      paramlist.forEach((p) => {
                                                         replacedesc =
                                                            replacedesc.replaceAll(
                                                               `{${p}}`,
                                                               sub.params[p][
                                                                  slv
                                                               ]
                                                            );
                                                      });
                                                   }
                                                   return (
                                                      <div key={sub.id}>
                                                         <div
                                                            key={sub.id}
                                                            className="relative overflow-hidden p-3 pb-4"
                                                         >
                                                            <div
                                                               className="absolute top-0 right-0 
                                      h-full w-52  bg-gray-400 dark:bg-dark_100 "
                                                            >
                                                               <div className="flex items-center justify-end">
                                                                  <img
                                                                     width={100}
                                                                     height={
                                                                        100
                                                                     }
                                                                     alt={
                                                                        sub.name
                                                                     }
                                                                     src={`${sub.icon.data.attributes.url}?width=200`}
                                                                  />
                                                               </div>
                                                               <div
                                                                  className="absolute right-0 top-0 h-full w-full bg-gradient-to-r
                                  from-gray-50 to-white/80 dark:from-dark_200 dark:to-dark_bg_main/70"
                                                               ></div>
                                                            </div>
                                                            <div className="pb-1 font-bold">
                                                               {sub.name}
                                                            </div>

                                                            {/* SKILL DESCRIPTION */}
                                                            <div
                                                               className="relative z-10 pr-8 text-sm text-gray-500 dark:text-gray-400"
                                                               dangerouslySetInnerHTML={{
                                                                  __html:
                                                                     showParamId
                                                                        ? basedesc
                                                                        : replacedesc,
                                                               }}
                                                            />
                                                            {/* Only show Skill Table if Params exist */}
                                                            {Object.keys(
                                                               sub?.params
                                                            )?.length > 0 ? (
                                                               <SkillTable
                                                                  params={sub}
                                                                  setShowParamId={
                                                                     setShowParamId
                                                                  }
                                                                  showParamId={
                                                                     showParamId
                                                                  }
                                                               />
                                                            ) : null}
                                                         </div>
                                                      </div>
                                                   );
                                                }
                                             )}
                                          </>
                                       )}
                                    </Disclosure.Panel>
                                 </>
                              )}
                           </Disclosure>
                        )
                     )}
                  </div>
               </>
            )}
         </section>
      </>
   );
};

const SkillTable = ({ params, setShowParamId, showParamId }) => {
   const paramkeys = Object.keys(params.params);
   // Defines levels to display
   const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
   const paramarray = paramkeys.map((p) => {
      var tempparam = {
         id: p,
         values: params?.params[p],
      };
      return tempparam;
   });

   return (
      <>
         <Disclosure key={params.id + "-table"}>
            {({ open }) => (
               <>
                  <Disclosure.Button
                     className="bg-nested border-color-primary relative z-20 mt-3 flex
             w-full items-center justify-between rounded-md border px-3 py-2"
                  >
                     <div className="flex flex-grow items-center gap-2.5 font-semibold">
                        Skill Details
                     </div>
                     <BsCaretDownFill
                        className={`${
                           open ? "rotate-180 transform" : ""
                        } theme-color h-4 w-4`}
                     />
                  </Disclosure.Button>
                  <Disclosure.Panel className="relative z-20 overflow-x-auto">
                     <button
                        className="bg-nested border-color-primary my-2 w-full rounded-md border p-2  text-xs italic"
                        onClick={(e) => {
                           setShowParamId(!showParamId);
                        }}
                     >
                        {showParamId ? (
                           <span className="theme-color pr-1 font-bold">
                              Hide
                           </span>
                        ) : (
                           <span className="theme-color pr-1 font-bold">
                              Show
                           </span>
                        )}
                        Parameter IDs in Description
                     </button>
                     {/* Skill Table Here */}
                     <table className="bg-root mb-0">
                        <th className="text-center text-sm">Lv</th>
                        {paramkeys.map((p) => (
                           <th
                              className="text-center text-sm dark:bg-dark_200"
                              key={p}
                           >
                              {p}
                           </th>
                        ))}
                        {levels.map((lv) => {
                           return (
                              <>
                                 <tr>
                                    <td className="text-center text-xs">
                                       {lv}
                                    </td>
                                    {paramkeys.map((p, index) => (
                                       <td
                                          className="text-center text-xs"
                                          key={p}
                                       >
                                          {params?.params?.[p]?.[lv]}
                                       </td>
                                    ))}
                                 </tr>
                              </>
                           );
                        })}
                     </table>
                  </Disclosure.Panel>
               </>
            )}
         </Disclosure>
      </>
   );
};

// =====================================
// Performs Rounding for Stats as Integers or as Percentages as necessary
// =====================================
function formatStat(type: any, stat: any) {
   // It seems currently all stats are formatted as INTEGER, floored.
   var floatlist = ["STATNAME"]; // Can add stats that should be float here.

   // Apply correct number formatting: Intlist should be rounded, otherwise *100 and display as Percentage of #.0% format
   if (floatlist.indexOf(type) > -1) {
      stat = (Math.round(stat * 1000) / 10).toFixed(1) + "%";
   } else {
      stat = "" + Math.floor(stat);
   }
   return stat;
}
