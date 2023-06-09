import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { zx } from "zodix";
import { nanoid } from "nanoid";
import type { CustomElement } from "~/modules/editor/types";
import { BlockType } from "~/modules/editor/types";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { useCallback, useMemo } from "react";
import { createEditor } from "slate";
import Block from "~/modules/editor/blocks/Block";
import Leaf from "~/modules/editor/blocks/Leaf";
import type { HomeContent } from "payload/generated-types";
import { SoloEditor } from "../editors+/SoloEditor";
import type { PaginatedDocs } from "payload/dist/mongoose/types";
import {
   AdminOrStaffOrOwner,
   useIsStaffOrSiteAdminOrStaffOrOwner,
} from "~/modules/auth";
import {
   Slate,
   Editable,
   withReact,
   type RenderElementProps,
} from "slate-react";
import type { Site } from "payload-types";
import Tooltip from "~/components/Tooltip";
import { isProcessing } from "~/utils";
import { Check, History, Loader2, MoreVertical, RotateCcw } from "lucide-react";

const initialValue: CustomElement[] = [
   {
      id: nanoid(),
      type: BlockType.Paragraph,
      children: [
         {
            text: "",
         },
      ],
   },
];

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderArgs) {
   const { siteId } = zx.parseParams(params, {
      siteId: z.string(),
   });
   const url = new URL(request.url).origin;
   const homeContentUrl = `${url}/api/homeContents?where[site.slug][equals]=${siteId}&depth=1`;
   const { docs: data } = (await (
      await fetch(homeContentUrl, {
         headers: {
            cookie: request.headers.get("cookie") ?? "",
         },
      })
   ).json()) as PaginatedDocs<HomeContent>;

   const homeData = data[0];
   //We need to append the draft paramater to the url if editing
   const siteAdmins = (homeData.site as Site).admins;
   const userId = user?.id;
   const isSiteOwner = userId == (homeData.site as Site).owner;
   const isSiteAdmin = siteAdmins && siteAdmins.includes(userId);
   if (isSiteOwner || isSiteAdmin) {
      const editHomeContentUrl = `${url}/api/homeContents?where[site.slug][equals]=${siteId}&depth=0&draft=true`;
      const { docs: data } = (await (
         await fetch(editHomeContentUrl, {
            headers: {
               cookie: request.headers.get("cookie") ?? "",
            },
         })
      ).json()) as PaginatedDocs<HomeContent>;
      const home = data[0].content;
      const isChanged =
         JSON.stringify(home) != JSON.stringify(homeData.content);
      return json({ home, isChanged });
   }

   //Otherwise return json and cache
   const home = data[0].content;
   return json(
      { home, isChanged: false },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
   );
}

export default function SiteIndexMain() {
   const { home, isChanged } = useLoaderData<typeof loader>();
   const editor = useMemo(() => withReact(createEditor()), []);
   const renderElement = useCallback((props: RenderElementProps) => {
      return <Block {...props} />;
   }, []);
   const hasAccess = useIsStaffOrSiteAdminOrStaffOrOwner();
   const { siteId } = useParams();
   const fetcher = useFetcher();

   const isAutoSaving =
      fetcher.state === "submitting" &&
      fetcher.formData.get("intentType") === "update";
   const isPublishing =
      fetcher.state === "submitting" &&
      fetcher.formData.get("intentType") === "publish";

   const disabled = isProcessing(fetcher.state);
   return (
      <>
         <main className="mx-auto max-w-[728px] pb-3">
            {hasAccess ? (
               <AdminOrStaffOrOwner>
                  <div className="relative min-h-screen pt-20 laptop:pt-12">
                     <SoloEditor
                        key={siteId}
                        fetcher={fetcher}
                        siteId={siteId}
                        intent="homeContent"
                        defaultValue={home != undefined ? home : initialValue}
                     />
                     <div
                        className="shadow-1 border-color bg-2 fixed inset-x-0 bottom-20 z-40 mx-auto flex
                  max-w-[200px] items-center justify-between rounded-full border p-2 shadow-sm"
                     >
                        <div
                           className="shadow-1 border-color bg-3 flex h-10
                     w-10 items-center justify-center rounded-full border shadow-sm"
                        >
                           {isAutoSaving ? (
                              <Loader2 size={18} className="animate-spin" />
                           ) : (
                              <MoreVertical size={18} />
                           )}
                        </div>

                        {isPublishing ? (
                           <div
                              className="shadow-1 inline-flex h-10 w-10 items-center justify-center 
                        rounded-full border border-blue-200/80 bg-gradient-to-b
                        from-blue-50 to-blue-100 text-sm font-bold text-white shadow-sm transition
                        dark:border-blue-900 dark:from-blue-950 dark:to-blue-950/80 
                        dark:shadow-blue-950"
                           >
                              <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
                           </div>
                        ) : (
                           <>
                              {isChanged ? (
                                 <Tooltip
                                    id="save-home-changes"
                                    side="top"
                                    content="Publish latest changes"
                                 >
                                    <button
                                       className="shadow-1 inline-flex h-10 items-center justify-center gap-1.5 
                                    rounded-full border border-blue-200/70 bg-gradient-to-b from-blue-50 to-blue-100
                                    px-3.5 text-sm font-bold text-blue-500 shadow-sm transition dark:border-blue-900
                                    dark:from-blue-950 dark:to-blue-950/80 dark:text-blue-300 
                                    dark:shadow-blue-950"
                                       disabled={disabled}
                                       onClick={() => {
                                          fetcher.submit(
                                             {
                                                intent: "homeContent",
                                                intentType: "publish",
                                                siteId,
                                             },
                                             {
                                                method: "post",
                                                action: "/editors/SoloEditor",
                                             }
                                          );
                                       }}
                                    >
                                       Publish
                                    </button>
                                 </Tooltip>
                              ) : (
                                 <Tooltip
                                    id="no-changes"
                                    side="top"
                                    content="No changes to publish..."
                                 >
                                    <div
                                       className="shadow-1 border-color bg-3 flex h-10
                                       w-10 items-center justify-center rounded-full border shadow-sm"
                                    >
                                       <Check size={18} />
                                    </div>
                                 </Tooltip>
                              )}
                           </>
                        )}
                        <Tooltip
                           id="revert-last-publish"
                           side="top"
                           content="History"
                        >
                           <div
                              className="shadow-1 border-color bg-3 flex h-10
                               w-10 items-center justify-center rounded-full border shadow-sm"
                           >
                              <History size={18} />
                           </div>
                        </Tooltip>
                     </div>
                  </div>
               </AdminOrStaffOrOwner>
            ) : (
               <>
                  {home && (
                     <div className="pt-20 max-desktop:px-3 laptop:pt-12">
                        <Slate key={siteId} editor={editor} value={home}>
                           <Editable
                              renderElement={renderElement}
                              renderLeaf={Leaf}
                              readOnly={true}
                           />
                        </Slate>
                     </div>
                  )}
               </>
            )}
         </main>
      </>
   );
}
