import {
   type ActionFunction,
   type LoaderArgs,
   type V2_MetaFunction,
   json,
   redirect,
} from "@remix-run/node";
import {
   Link,
   Outlet,
   useLoaderData,
   useNavigation,
   useSearchParams,
   Form,
   useActionData,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zx } from "zodix";
import { useEffect, useState } from "react";
import { createCustomIssues, useZorm } from "react-zorm";
import {
   assertIsPost,
   getMultipleFormData,
   uploadImage,
   type FormResponse,
   isAdding,
   isProcessing,
} from "~/utils";

import {
   Component,
   ImagePlus,
   Loader2,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";

import { Image } from "~/components/Image";
import { AdminOrStaffOrOwner } from "~/modules/auth";
import { useDebouncedValue } from "~/hooks";

const EntrySchema = z.object({
   name: z.string(),
   icon: z.any(),
});

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderArgs) {
   const { collectionId, siteId } = zx.parseParams(params, {
      collectionId: z.string(),
      siteId: z.string().length(10),
   });

   const { q, page } = zx.parseQuery(request, {
      q: z.string().optional(),
      page: z.coerce.number().optional(),
   });
   const id = `${collectionId}-${siteId}`;
   const collection = await payload.findByID({
      collection: "collections",
      id,
   });
   const entrylist = await payload.find({
      collection: "entries",
      where: {
         collectionEntity: {
            equals: id,
         },
      },
      user,
      limit: 20,
      page: page ?? 1,
   });
   console.log(entrylist);
   return json({ collection, entrylist, q });
}

export const meta: V2_MetaFunction = ({ data, parentsData }) => {
   const siteName = parentsData["routes/$siteId"].site.name;
   const collectionName = data.collection.name;

   return [
      {
         title: `${collectionName} - ${siteName}`,
      },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
   ];
};

export const handle = {
   i18n: "entry",
};

export default function CollectionList() {
   const { collection, entrylist, q } = useLoaderData<typeof loader>();

   const entries = entrylist?.docs;

   // Paging Variables!
   const [query, setQuery] = useState(q);
   const debouncedValue = useDebouncedValue(query, 500);
   const [searchParams, setSearchParams] = useSearchParams({});

   const currentEntry = entrylist?.pagingCounter;
   const totalEntries = entrylist?.totalDocs;
   const totalPages = entrylist?.totalPages;
   const limit = entrylist?.limit;
   const hasNextPage = entrylist?.hasNextPage;
   const hasPrevPage = entrylist?.hasPrevPage;

   useEffect(() => {
      if (debouncedValue) {
         setSearchParams((searchParams) => {
            searchParams.set("q", debouncedValue);
            return searchParams;
         });
      } else {
         setSearchParams((searchParams) => {
            searchParams.delete("q");
            return searchParams;
         });
      }
   }, [debouncedValue]);

   const transition = useNavigation();
   const disabled = isProcessing(transition.state);
   const { t } = useTranslation(handle?.i18n);

   //Image preview after upload
   const [, setPicture] = useState(null);
   const [imgData, setImgData] = useState(null);

   const onChangePicture = (e: any) => {
      if (e.target.files[0]) {
         setPicture(e.target.files[0]);
         const reader = new FileReader() as any;
         reader.addEventListener("load", () => {
            setImgData(reader.result);
         });
         reader.readAsDataURL(e.target.files[0]);
      }
   };
   const adding = isAdding(transition, "addEntry");
   const formResponse = useActionData<FormResponse>();
   const zoEntry = useZorm("newEntry", EntrySchema, {
      //@ts-ignore
      customIssues: formResponse?.serverIssues,
   });

   useEffect(() => {
      if (!adding) {
         //@ts-ignore
         zoEntry.refObject.current && zoEntry.refObject.current.reset();
         setImgData(null);
      }
   }, [adding, zoEntry.refObject]);

   return (
      <>
         <Outlet />
         <div className="mx-auto max-w-[728px] max-desktop:px-3 pb-12">
            <h2 className="pb-3 text-xl font-bold pl-1">{collection.name}</h2>
            <AdminOrStaffOrOwner>
               <Form
                  ref={zoEntry.ref}
                  method="post"
                  encType="multipart/form-data"
                  className="pb-3.5"
                  replace
               >
                  <div className="flex items-center gap-4">
                     <div>
                        <label className="cursor-pointer">
                           {imgData ? (
                              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
                                 <img
                                    width={80}
                                    height={80}
                                    className="aspect-square object-contain"
                                    alt="preview"
                                    src={imgData}
                                 />
                              </div>
                           ) : (
                              <div
                                 className="flex h-11 w-11 
                                    items-center justify-center rounded-full border-2 border-dashed
                                  border-zinc-400 bg-white hover:border-zinc-600 hover:bg-zinc-100 dark:border-zinc-500
                                  dark:bg-zinc-600 dark:hover:border-zinc-400"
                              >
                                 <ImagePlus className="h-5 w-5 text-zinc-400" />
                              </div>
                           )}
                           <input
                              //@ts-ignore
                              name={zoEntry.fields.icon()}
                              type="file"
                              className="hidden"
                              onChange={onChangePicture}
                           />
                        </label>
                     </div>
                     <div className="flex-grow">
                        <input
                           required
                           placeholder={t("new.namePlaceholder") ?? undefined}
                           autoFocus={true}
                           name={zoEntry.fields.name()}
                           type="text"
                           className="input-text mt-0"
                           disabled={disabled}
                        />
                        {zoEntry.errors.name()?.message && (
                           <div
                              className="pt-1 text-red-700"
                              id="entryName-error"
                           >
                              {zoEntry.errors.name()?.message}
                           </div>
                        )}
                     </div>
                     <button
                        name="intent"
                        value="addEntry"
                        type="submit"
                        className="h-10 w-16 rounded bg-zinc-500 px-4 text-sm font-bold 
                        text-white hover:bg-zinc-600 focus:bg-zinc-400"
                        disabled={disabled}
                     >
                        {adding ? (
                           <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-300" />
                        ) : (
                           t("new.action")
                        )}
                     </button>
                  </div>
               </Form>
            </AdminOrStaffOrOwner>

            {entries?.length === 0 ? null : (
               <>
                  <div className="divide-y overflow-hidden rounded-lg border border-color divide-color bg-2">
                     {entries?.map((entry) => (
                        <Link
                           key={entry.id}
                           to={`${
                              // @ts-expect-error
                              entry?.collectionEntity?.customTemplate == true
                                 ? `${entry.id}/c`
                                 : `${entry.id}/w`
                           }`}
                           prefetch="intent"
                           className="flex items-center gap-3 p-2 bg-2 hover:underline"
                        >
                           <div
                              className="flex h-8 w-8 items-center justify-between border-color
                                    overflow-hidden rounded-full border-2 shadow-sm shadow-1"
                           >
                              {/* @ts-expect-error */}
                              {entry.icon?.url ? (
                                 <Image /* @ts-ignore */
                                    url={entry.icon?.url}
                                    options="fit=crop,width=60,height=60,gravity=auto"
                                    alt="List Icon"
                                 />
                              ) : (
                                 <Component
                                    className="mx-auto text-1"
                                    size={18}
                                 />
                              )}
                           </div>
                           <span>{entry.name}</span>
                        </Link>
                     ))}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                     <div className="text-1 flex items-center justify-between py-3 pl-1 text-sm">
                        <div>
                           Showing{" "}
                           <span className="font-bold">{currentEntry}</span> to{" "}
                           <span className="font-bold">
                              {limit + currentEntry - 1 > totalEntries
                                 ? totalEntries
                                 : limit + currentEntry - 1}
                           </span>{" "}
                           of <span className="font-bold">{totalEntries}</span>{" "}
                           results
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                           {hasPrevPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          entrylist.prevPage as any
                                       );
                                       return searchParams;
                                    })
                                 }
                              >
                                 <ChevronLeft
                                    size={18}
                                    className="text-emerald-500"
                                 />
                                 Prev
                              </button>
                           ) : null}
                           {hasNextPage && hasPrevPage && (
                              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                           )}
                           {hasNextPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          entrylist.nextPage as any
                                       );
                                       return searchParams;
                                    })
                                 }
                              >
                                 Next
                                 <ChevronRight
                                    size={18}
                                    className="text-emerald-500"
                                 />
                              </button>
                           ) : null}
                        </div>
                     </div>
                  )}
               </>
            )}
         </div>
      </>
   );
}

export const action: ActionFunction = async ({
   context: { payload, user },
   request,
   params,
}) => {
   if (!user || !user.id) return redirect("/login", { status: 302 });

   const { collectionId } = zx.parseParams(params, {
      collectionId: z.string(),
   });
   const { intent } = await zx.parseForm(request, {
      intent: z.string(),
   });

   const issues = createCustomIssues(EntrySchema);

   // Add Entry
   if (intent === "addEntry") {
      assertIsPost(request);

      const result = await getMultipleFormData({
         request,
         prefix: "eIcon",
         schema: EntrySchema,
      });

      if (result.success) {
         const { name, icon } = result.data;
         // Respond with custom issues that require checks on server
         if (issues.hasIssues()) {
            return json<FormResponse>(
               { serverIssues: issues.toArray() },
               { status: 400 }
            );
         }
         const iconId = await uploadImage({
            payload,
            image: icon,
            user,
         });
         try {
            await payload.create({
               collection: "entries",
               data: {
                  name,
                  author: user?.id,
                  icon: iconId,
                  collectionEntity: collectionId,
               },
               user,
               overrideAccess: false,
            });
            return json<FormResponse>({
               success: "New entry added.",
            });
         } catch (error) {
            return json({
               error: "Something went wrong...unable to add entry.",
            });
         }
      }
      //If user input has problems
      if (issues.hasIssues()) {
         return json<FormResponse>(
            { serverIssues: issues.toArray() },
            { status: 400 }
         );
      }
      // Last resort error message
      return json({
         error: "Something went wrong...unable to add entry.",
      });
   }
};
