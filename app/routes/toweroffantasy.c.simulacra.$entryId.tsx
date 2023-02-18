import axios from "axios";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { zx } from "zodix";
import { z } from "zod";
import { useLoaderData } from "@remix-run/react";
import qs from "qs";

import { Link } from "@remix-run/react";
const entryQuery = {
   id: "primary",
   type: "single",
   collection: "simulacra",
   queryString: {
      populate: {
         icon: { fields: ["url"] },
         likes: {
            populate: {
               items_with_hobby: {
                  populate: {
                     icon: { fields: ["url"] },
                     rarity: { fields: ["name"], populate: ["image"] },
                  },
               },
            },
         },
         mimics: {
            populate: { title_picture: { fields: ["name", "url"] } },
         },
         weapon: { populate: "*" },
         imitations: { populate: "*" },
         chat_voices: { populate: "*" },
         fight_voices: { populate: "*" },
         recollections: { populate: "*" },
      },
   },
};

export async function loader({ params }: LoaderArgs) {
   const { entryId } = params;

   const { data } = await axios.get(
      `https://toweroffantasy.api.nalu.wiki/api/simulacra/${
         entryId ?? "4"
      }?${qs.stringify(entryQuery.queryString)}`
   );

   return { data: { primary: data } };
}

export default function Entry() {
   const { data } = useLoaderData<typeof loader>();
   return <Header data={data} />;
}

export const Header = (props: any) => {
   //    console.dir(props, { depth: null });
   //    return <div>{JSON.stringify(props)}</div>;
   return (
      <>
         {props?.data?.primary?.data?.attributes?.mimics?.length ===
         0 ? null : (
            <>
               <div className="">
                  <>
                     <div
                        key={
                           props?.data?.primary?.data?.attributes?.mimics?.[0]
                              ?.id
                        }
                        className="grid gap-4 align-middle laptop:grid-cols-2"
                     >
                        <section>
                           <div
                              className="wiki-cell flex items-center
                   justify-center space-y-3"
                           >
                              <img
                                 width={240}
                                 height={240}
                                 alt="Mimic Title"
                                 src={
                                    props?.data?.primary?.data?.attributes
                                       ?.mimics?.[0]?.title_picture?.data
                                       ?.attributes?.url
                                 }
                              />
                           </div>
                        </section>
                        <section>
                           <div className="wiki-infobox mb-3">
                              <div className="wiki-infobox-row">
                                 <div className="wiki-infobox-label">
                                    Unlock
                                 </div>
                                 <div className="wiki-infobox-value">
                                    {
                                       props.data.primary.data.attributes
                                          .unlock_description
                                    }
                                 </div>
                              </div>
                              <div className="wiki-infobox-row">
                                 <div className="wiki-infobox-label">
                                    Height
                                 </div>
                                 <div className="wiki-infobox-value">
                                    {props.data.primary.data.attributes.height}
                                 </div>
                              </div>
                              <div className="wiki-infobox-row">
                                 <div className="wiki-infobox-label">
                                    Gender
                                 </div>
                                 <div className="wiki-infobox-value">
                                    {props.data.primary.data.attributes.gender}
                                 </div>
                              </div>
                           </div>
                           <Link
                              to={`/toweroffantasy/c/weapons/${props.data.primary.data.attributes.weapon.data.attributes.name}-${props.data.primary.data.attributes.weapon.data.id}`}
                              className="wiki-cell block"
                           >
                              <div className="flex items-center gap-3">
                                 <div
                                    className="border-color-primary h-12 w-12 rounded-full
                              border bg-white font-bold shadow-sm dark:bg-dark_100"
                                 >
                                    <img
                                       width={50}
                                       height={50}
                                       alt={
                                          props.data.primary.data.attributes
                                             .weapon.data.attributes.name
                                       }
                                       src={
                                          props.data.primary.data.attributes
                                             .weapon.data.attributes.icon.data
                                             .attributes.url
                                       }
                                    />
                                 </div>
                                 <div className="font-bold text-gray-500 dark:text-gray-400">
                                    {
                                       props.data.primary.data.attributes.weapon
                                          .data.attributes.name
                                    }
                                 </div>
                              </div>
                           </Link>
                        </section>
                     </div>
                  </>
               </div>
            </>
         )}
      </>
   );
};
