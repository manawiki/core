import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Image } from "~/components";
import { Search, SortDesc } from "lucide-react";
import { H2 } from "~/_custom/components/custom";

// export async function loader({
//    context: { payload },
//    request,
// }: LoaderArgs) {
//    const characters = await payload.find({
//       // @ts-ignore
//       collection: "characters",
//       where: {
//          id: {
//             exists: true,
//          },
//       },
//       depth: 3,
//       limit: 50,
//    });
//    return json({ characters });
// }

export async function loader({
   context: { payload },
   params,
   request,
}: LoaderArgs) {
   const { data, errors } = await fetch(
      `https://${process.env.PAYLOAD_PUBLIC_SITE_ID}-db.mana.wiki/api/graphql`,
      {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            query: QUERY_RELIC_SETS
         }),
      }
   ).then((res) => res.json());

   if (errors) {
      console.error(JSON.stringify(errors)); // eslint-disable-line no-console
      throw new Error();
   }

   return json({ relicSets: data.relicSets.docs });
}

export const meta: V2_MetaFunction = () => {
   return [
      {
         title: "Relic Sets - Honkai: Star Rail",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
   ];
};
export default function HomePage() {
   const { relicSets } = useLoaderData<typeof loader>();

   return (
      <div className="mx-auto max-w-[728px] max-laptop:px-3">
         <RelicSetList chars={relicSets} />
      </div>
   );
}

const RelicSetList = ({ chars }: any) => {
   const [filters, setFilters] = useState([]);
   const [sort, setSort] = useState("relicset_id");
   const [search, setSearch] = useState("");
   const [showDesc, setShowDesc] = useState(false);

   const sortOptions = [
      { name: "ID", field: "relicset_id" },
      { name: "Name", field: "name" },
   ];

   const relics = chars.map((c: any) => {
      return {
         ...c,
         settype: c.set_effect?.length > 1 ? "Relic Set" : "Planetary Ornament",
      };
   });

   chars = relics;

   // All Filter Options listed individually atm to control order filter options appear in
   const settypes = [
      {
         id: "Relic Set",
         name: "Relic Set",
      },
      {
         id: "Planetary Ornament",
         name: "Planetary Ornament",
      },
   ];

   // const camps = chars.map((c) => {
   //    return c?.camp;
   // }).filter((v,i,a) => a.indexOf(v) === i);

   // sort((a,b) => {
   // return campsort.findIndex((x) => x.id == a) - campsort.findIndex((x) => x.id == b)})

   const filterOptions = [
      {
         name: "Type",
         field: "settype",
         options: settypes,
      },
   ];

   // var pathlist = filterUnique(chars.map((c: any) => c.path));

   // Sort entries
   var csorted = [...chars];
   csorted.sort((a, b) => (a[sort] > b[sort] ? 1 : b[sort] > a[sort] ? -1 : 0));

   // Filter entries
   // Filter out by each active filter option selected, if matches filter then output 0; if sum of all filters is 0 then show entry.
   var cfiltered = csorted.filter((char: any) => {
      var showEntry = filters
         .map((filt: any) => {
            var matches = 0;
            if (char[filt.field]?.id) {
               matches = char[filt.field]?.id == filt.id ? 0 : 1;
            } else {
               matches = char[filt.field] == filt.id ? 0 : 1;
            }
            return matches;
         })
         .reduce((p, a) => p + a, 0);

      return showEntry == 0;
   });

   // Filter search by name
   var cfiltered = cfiltered.filter((char: any) => {
      return char.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
   });

   return (
      <>
         <div className="">
            {/* Filter Options */}
            <H2 text="Relic Sets" />
            <div className="divide-color bg-2 border-color divide-y rounded-md border">
               {filterOptions.map((cat: any) => {
                  return (
                     <>
                        <div className="cursor-pointer items-center justify-between gap-3 p-3 laptop:flex">
                           <div className="text-1 flex items-center gap-2.5 text-sm font-bold max-laptop:pb-3">
                              {cat.name}
                           </div>
                           <div className="items-center justify-between gap-3 max-laptop:grid max-laptop:grid-cols-4 laptop:flex">
                              {cat.options.map((opt: any) => {
                                 return (
                                    <>
                                       <div
                                          className={`bg-3 shadow-1 border-color rounded-lg border px-2.5 py-1 shadow-sm ${
                                             filters.find(
                                                (a: any) => a.id == opt.id
                                             )
                                                ? `bg-yellow-50 dark:bg-yellow-500/10`
                                                : ``
                                          }`}
                                          onClick={(event) => {
                                             if (
                                                filters.find(
                                                   (a: any) => a.id == opt.id
                                                )
                                             ) {
                                                setFilters(
                                                   filters.filter(
                                                      (a) => a.id != opt.id
                                                   )
                                                );
                                             } else {
                                                setFilters([
                                                   // Allows only one filter per category
                                                   ...filters.filter(
                                                      (a) =>
                                                         a.field != cat.field
                                                   ),
                                                   { ...opt, field: cat.field },
                                                ]);
                                             }
                                          }}
                                       >
                                          {opt.icon ? (
                                             <>
                                                <div className="mx-auto h-7 w-7 rounded-full bg-zinc-800 bg-opacity-50">
                                                   <Image
                                                      alt="Icon"
                                                      className="object-contain"
                                                      url={opt.icon}
                                                   />
                                                </div>
                                             </>
                                          ) : null}

                                          <div className="text-1 truncate pt-0.5 text-center text-xs">
                                             {opt.name}
                                          </div>
                                       </div>
                                    </>
                                 );
                              })}
                           </div>
                        </div>
                     </>
                  );
               })}
            </div>

            {/* Search Text Box */}
            <div
               className="border-color mb-2 mt-4 flex h-12
            items-center justify-between gap-3 border-b"
            >
               <Search className="text-yellow-500" size={20} />
               <input
                  className="h-10 w-full flex-grow bg-transparent focus:outline-none"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => {
                     setSearch(event.target.value);
                  }}
               />
               <div className="text-1 flex items-center gap-1.5 pr-1 text-sm italic">
                  <span>{cfiltered.length}</span> <span>entries</span>
               </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between py-3">
               <div className="text-1 flex items-center gap-2 text-sm font-bold">
                  <SortDesc size={16} className="text-zinc-500" />
                  Sort
               </div>
               <div className="flex items-center gap-2">
                  {sortOptions.map((opt: any) => {
                     return (
                        <div
                           key={opt.field}
                           className={`border-color text-1 shadow-1 relative cursor-pointer rounded-full 
                        border px-4 py-1 text-center text-sm font-bold shadow ${
                           sort == opt.field
                              ? `bg-yellow-50 dark:bg-yellow-500/10`
                              : ``
                        }`}
                           onClick={(event) => {
                              setSort(opt.field);
                           }}
                        >
                           {opt.name}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* List with applied sorting */}
            <div className="text-center">
               {cfiltered?.map((char: any) => {
                  return (
                     <>
                        <EntryWithDescription char={char} />
                     </>
                  );
               })}
            </div>
         </div>
      </>
   );
};

const EntryWithDescription = ({ char }: any) => {
   const cid = char?.id;
   const effect = char?.set_effect;

   return (
      <>
         <a href={`/starrail/collections/relicSets/${cid}`}>
            <div className="relative my-1 inline-block w-full rounded-md bg-opacity-10 p-2 align-middle bg-3 border-color shadow-1 mb-2 border-2 shadow">
               <div className="relative inline-block w-28 rounded-md text-center align-middle">
                  {/* Icon */}
                  <div className="relative inline-block h-20 w-20">
                     <Image
                        className="object-contain"
                        url={char.icon?.url}
                        alt={char?.name}
                     />
                  </div>
                  {/* Name */}
                  <div className="text-center text-xs">{char.name}</div>
               </div>
               <div className="relative inline-block w-2/3 p-3 align-middle text-sm">
                  {effect?.map((eff: any) => {
                     return (
                        <>
                           <div className="bg-2 my-1 rounded-md border border-color p-2 px-3 align-top text-left">
                              <div className="mr-2 inline-block font-bold align-top text-green-900 dark:text-green-200">
                                 {eff.req_no}-pc
                              </div>
                              <div
                                 className="inline-block w-3/4"
                                 dangerouslySetInnerHTML={{
                                    __html: eff.description,
                                 }}
                              ></div>
                           </div>
                        </>
                     );
                  })}
               </div>
            </div>
         </a>
      </>
   );
};

const QUERY_RELIC_SETS = `
query {
   relicSets: RelicSets(limit: 0) {
     docs {
       relicset_id
       name
       id
       icon {
         url
       }
       set_effect {
         req_no
         description
       }
     }
   }
 }
`