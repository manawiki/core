import type { Note } from "payload-types";
import {
   type ActionArgs,
   type LoaderArgs,
   json,
   redirect,
} from "@remix-run/node";
import {
   Form,
   Link,
   Outlet,
   useLoaderData,
   useFetcher,
   useNavigation,
   useParams,
} from "@remix-run/react";
import { Fragment, Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { zx } from "zodix";
import { NoteViewer } from "~/modules/note/components/NoteViewer";
import {
   Component,
   Copy,
   EyeOff,
   Loader2,
   MoreVertical,
   Plus,
   Trash2,
   Type,
   X,
} from "lucide-react";
import {
   type FormResponse,
   assertIsPatch,
   getMultipleFormData,
   uploadImage,
   commitSession,
   getSession,
   setSuccessMessage,
   assertIsDelete,
   isAdding,
   isProcessing,
} from "~/utils";
import { format, formatDistanceStrict } from "date-fns";
import { AdminOrOwner, useIsStaffOrSiteAdminOrOwner } from "~/modules/auth";
import { createCustomIssues } from "react-zorm";
import { Menu, Popover, Transition } from "@headlessui/react";
import { Modal } from "~/components/Modal";
import { useTranslation } from "react-i18next";
import { toast } from "~/components/Toaster";
import { Image } from "~/components/Image";
import { DotLoader } from "~/components/DotLoader";
import { InlineEditor } from "./InlineEditor";
import { PostHeaderEdit } from "./PostHeaderEdit";
import { postSchema } from "./postSchema";
import { Editor } from "./Editor";
import { RoomProvider, useStorage } from "~/liveblocks.config";
import { LiveList } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

type Mode = "edit" | "preview";

//get notes list from payload
export async function loader({
   context: { payload, user },
   params,
}: LoaderArgs) {
   const { postId } = zx.parseParams(params, {
      postId: z.string(),
   });

   //ideally, we grab post and notes in one query, but I don't know how to grab the draft notes yet
   const post = await payload.findByID({
      collection: "posts",
      id: postId,
      overrideAccess: false,
      user,
      depth: 2,
   });

   let notes = [] as Note[];

   const authorId =
      typeof post.author === "string" ? post.author : post.author.id;

   //pass in draft docs if the user is the author
   if (post?.notes && authorId === user?.id)
      notes = await Promise.all(
         post?.notes?.map((note) =>
            payload.findByID({
               collection: "notes",
               id: typeof note === "string" ? note : note.id,
               draft: true,
               overrideAccess: false,
               user,
            })
         )
      );

   return { post, notes };
}

export const handle = {
   // i18n key for this route. This will be used to load the correct translation
   i18n: "post",
};

export default function PostPage() {
   const data = useLoaderData<typeof loader>();
   const { post } = data;
   const viewModeDefault = useIsStaffOrSiteAdminOrOwner();
   const [mode, setMode] = useState<Mode>(viewModeDefault ? "edit" : "preview");
   const [isDeleteOpen, setDeleteOpen] = useState(false);
   const [isUnpublishOpen, setUnpublishOpen] = useState(false);
   const { t } = useTranslation(handle?.i18n);
   const fetcher = useFetcher();
   const deleting = isAdding(fetcher, "delete");
   const { siteId, postId } = useParams();
   const transition = useNavigation();
   const isPublishing = isAdding(transition, "publish");
   const disabled = isProcessing(transition.state);

   return (
      <div className="relative">
         {/* Delete Modal */}
         <Modal
            onClose={() => {
               setDeleteOpen(false);
            }}
            show={isDeleteOpen}
         >
            <div
               className="bg-2 mx-5 max-w-sm transform rounded-2xl
               p-6 text-left align-middle shadow-xl transition-all"
            >
               <div className="pb-6">
                  <div className="pb-2 text-center text-lg font-bold">
                     Are you sure you want to delete this post permanently?
                  </div>
                  <div className="text-1 text-center">
                     You cannot undo this action.
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button
                     className="h-10 rounded-md bg-zinc-200 text-sm 
                     font-bold focus:bg-zinc-100 dark:bg-zinc-700 dark:focus:bg-zinc-600"
                     onClick={() => setDeleteOpen(false)}
                  >
                     Cancel
                  </button>
                  <button
                     onClick={() =>
                        fetcher.submit(
                           { intent: "delete" },
                           { method: "delete" }
                        )
                     }
                     className="h-10 w-full rounded-md bg-red-500 text-sm font-bold text-white
                                              focus:bg-red-400 dark:bg-red-600 dark:focus:bg-red-500"
                  >
                     {deleting ? (
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-red-200" />
                     ) : (
                        t("actions.delete")
                     )}
                  </button>
               </div>
            </div>
         </Modal>
         {/* Unpublish Modal */}
         <Modal
            onClose={() => {
               setUnpublishOpen(false);
            }}
            show={isUnpublishOpen}
         >
            <div
               className="border-color bg-1 mx-5 max-w-md transform rounded-2xl
                                    border-2 py-6 px-8 text-left align-middle shadow-xl transition-all"
            >
               <div className="pb-6">
                  <div className="pb-2 text-center text-lg font-bold">
                     Are you sure you want to unpublish this post?
                  </div>
                  <div className="text-1 text-center">
                     Your post will no longer be publically viewable.
                  </div>
               </div>
               <button
                  className="absolute -right-4 -top-4 flex h-8 w-8
                  items-center justify-center rounded-full border-2 border-red-300 bg-1
               hover:bg-red-50 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  onClick={() => setUnpublishOpen(false)}
               >
                  <X className="h-5 w-5 text-red-400" />
               </button>
               <div className="grid grid-cols-2 gap-4">
                  <button
                     className="h-10 rounded-md bg-zinc-200 text-sm 
                     font-bold focus:bg-zinc-100 dark:bg-zinc-700 dark:focus:bg-zinc-600"
                     onClick={() => setUnpublishOpen(false)}
                  >
                     Cancel
                  </button>
                  <button
                     onClick={() =>
                        fetcher.submit(
                           { intent: "unpublish" },
                           { method: "post" }
                        )
                     }
                     className="h-10 w-full rounded-md bg-zinc-500 text-sm font-bold text-white
                                              focus:bg-zinc-400 dark:bg-zinc-600 dark:focus:bg-zinc-500"
                  >
                     {deleting ? (
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-red-200" />
                     ) : (
                        "Unpublish"
                     )}
                  </button>
               </div>
            </div>
         </Modal>
         <AdminOrOwner>
            <div className="flex items-center justify-between max-desktop:px-3 pt-8 laptop:pt-5 mx-auto max-w-[728px]">
               <div className="flex items-center gap-3">
                  <div className="flex cursor-pointer items-center gap-2.5">
                     <span
                        onClick={() => setMode("edit")}
                        className={`${
                           mode == "edit"
                              ? "dark:bg-zinc-300 bg-zinc-700 text-white dark:text-black"
                              : "hover:bg-zinc-100 bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-700"
                        } rounded-lg h-8 flex items-center px-3.5 text-xs font-bold transition 
                        `}
                     >
                        Edit
                     </span>
                     <span
                        onClick={() => setMode("preview")}
                        className={`${
                           mode == "preview"
                              ? "dark:bg-zinc-300 bg-zinc-700 text-white dark:text-black"
                              : "hover:bg-zinc-100 bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-700"
                        } rounded-lg h-8 flex items-center px-3.5 text-xs font-bold transition 
                        `}
                     >
                        Preview
                     </span>
                  </div>
               </div>
               <AdminOrOwner>
                  <div className="flex items-center gap-3 max-laptop:">
                     <Menu as="div" className="relative">
                        <Menu.Button
                           className="bg-2 flex h-9 w-9 items-center justify-center 
                        rounded-full border-2 text-1 transition border-color
                        duration-300 active:translate-y-0.5"
                        >
                           <MoreVertical className="h-5 w-5" />
                        </Menu.Button>
                        <Transition
                           as={Fragment}
                           enter="transition ease-out duration-100"
                           enterFrom="transform opacity-0 scale-95"
                           enterTo="transform opacity-100 scale-100"
                           leave="transition ease-in duration-75"
                           leaveFrom="transform opacity-100 scale-100"
                           leaveTo="transform opacity-0 scale-95"
                        >
                           <Menu.Items
                              className="absolute right-0 mt-1.5 w-full min-w-[200px] max-w-md
                                        origin-top-right transform transition-all z-10"
                           >
                              <div className="border-color rounded-lg border bg-2 p-1.5 shadow shadow-1">
                                 <Menu.Item>
                                    <button
                                       className="text-1 flex w-full items-center gap-3 rounded-lg
                                    py-2 px-2.5 font-bold hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                    >
                                       <Copy
                                          className="text-blue-400"
                                          size="18"
                                       />
                                       Clone
                                    </button>
                                 </Menu.Item>
                                 <Menu.Item>
                                    <button
                                       className="text-1 flex w-full items-center gap-3 rounded-lg
                                    py-2 px-2.5 font-bold hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                       onClick={() => setUnpublishOpen(true)}
                                    >
                                       <EyeOff
                                          className="text-zinc-400"
                                          size="18"
                                       />
                                       Unpublish
                                    </button>
                                 </Menu.Item>
                                 <Menu.Item>
                                    <button
                                       className="text-1 flex w-full items-center gap-3 rounded-lg
                                    py-2 px-2.5 font-bold hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                       onClick={() => setDeleteOpen(true)}
                                    >
                                       <Trash2
                                          className="text-red-400"
                                          size="18"
                                       />
                                       Delete
                                    </button>
                                 </Menu.Item>
                              </div>
                           </Menu.Items>
                        </Transition>
                     </Menu>
                     {post.isPublished ? null : (
                        <Form method="post">
                           {isPublishing ? (
                              <div className="h-9 w-24 rounded-full border-2 border-color flex items-center justify-center bg-2">
                                 <DotLoader />
                              </div>
                           ) : (
                              <button
                                 disabled={disabled}
                                 type="submit"
                                 name="intent"
                                 value="publish"
                              >
                                 <div
                                    className="group inline-flex justify-center h-9 items-center rounded-full bg-emerald-500 
                              w-24 font-bold text-white text-sm transition hover:bg-emerald-600 dark:hover:bg-emerald-400"
                                 >
                                    {t("actions.publish")}
                                    <svg
                                       className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
                                       fill="none"
                                       width="12"
                                       height="12"
                                       viewBox="0 0 12 12"
                                       aria-hidden="true"
                                    >
                                       <path
                                          className="opacity-0 transition group-hover:opacity-100"
                                          d="M0 5h7"
                                       ></path>
                                       <path
                                          className="transition group-hover:translate-x-[3px]"
                                          d="M1 1l4 4-4 4"
                                       ></path>
                                    </svg>
                                 </div>
                              </button>
                           )}
                        </Form>
                     )}
                  </div>
               </AdminOrOwner>
            </div>
         </AdminOrOwner>

         {mode === "edit" ? <PostEdit /> : <PostView />}
         <AdminOrOwner>
            {mode === "edit" && (
               <div
                  className="bg-2 border-color sticky bottom-12 z-30 flex h-12 
                    items-center justify-between
                    border-t px-3 laptop:bottom-0 laptop:h-14"
               >
                  <div className="mx-auto -mt-14 laptop:-mt-11">
                     <Popover className="relative flex items-center justify-center">
                        {({ open }) => (
                           <>
                              <Popover.Button className="focus:outline-none justify-center mx-auto">
                                 <div
                                    className="flex h-14 w-14 items-center justify-center
                              rounded-full border-2 border-emerald-200 active:translate-y-0.5
                              shadow shadow-emerald-100 bg-emerald-100
                              font-semibold text-emerald-500 dark:border-emerald-800 
                              dark:shadow-emerald-900/40 focus-visible:blur-none
                              transition duration-300 dark:bg-emerald-900"
                                 >
                                    <Plus
                                       size={28}
                                       className={`${
                                          open
                                             ? "rotate-45 dark:text-zinc-200 text-zinc-400"
                                             : ""
                                       } transform transition duration-300 ease-in-out`}
                                    />
                                 </div>
                              </Popover.Button>
                              <Transition
                                 as={Fragment}
                                 enter="transition ease-out duration-200"
                                 enterFrom="opacity-0 translate-y-1"
                                 enterTo="opacity-100 translate-y-0"
                                 leave="transition ease-in duration-150"
                                 leaveFrom="opacity-100 translate-y-0"
                                 leaveTo="opacity-0 translate-y-1"
                              >
                                 <Popover.Panel
                                    className="absolute flex items-center gap-3 -top-[50px] 
                                    left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                 >
                                    <Popover.Button
                                       onClick={() =>
                                          fetcher.submit(
                                             {
                                                intent: "addNewInlineSection",
                                                ui: "textarea",
                                             },
                                             {
                                                method: "post",
                                                action: `/${siteId}/posts/${postId}/add`,
                                             }
                                          )
                                       }
                                       className="flex rounded-full text-sm shadow dark:shadow-black/50 font-bold hover:border-zinc-100
                                       border border-color bg-2 items-center gap-2 h-11 justify-center hover:bg-white
                                       dark:hover:bg-zinc-700 dark:hover:border-zinc-600 w-28"
                                    >
                                       <Type
                                          className="text-emerald-500 flex-none -ml-0.5"
                                          size={20}
                                       />
                                       <span>Text</span>
                                    </Popover.Button>
                                    <Link
                                       className="flex rounded-full text-sm shadow dark:shadow-black/50 font-bold hover:border-zinc-100
                                       border border-color bg-2 items-center gap-2 w-28 h-11 justify-center hover:bg-white
                                     dark:hover:bg-zinc-700 dark:hover:border-zinc-600"
                                       to="add"
                                       prefetch="intent"
                                    >
                                       <Component
                                          className="text-emerald-500 flex-none -ml-0.5"
                                          size={20}
                                       />
                                       <span>Widget</span>
                                    </Link>
                                 </Popover.Panel>
                              </Transition>
                           </>
                        )}
                     </Popover>
                     <div className="pt-2 max-laptop:hidden uppercase text-xs text-1 font-bold">
                        Add Section
                     </div>
                  </div>
               </div>
            )}
         </AdminOrOwner>
         <Outlet />
      </div>
   );
}

function PostEdit() {
   const fetcher = useFetcher();
   //Server response toast
   useEffect(() => {
      if (fetcher.type === "done") {
         if (fetcher.data?.success) {
            toast.success(fetcher.data?.success);
         }
         if (fetcher.data?.error) {
            toast.error(fetcher.data?.error);
         }
      }
   }, [fetcher.type]);

   //Get data. This is necessary to determine whether the user should see the draft notes or not.
   const data = useLoaderData<typeof loader>();
   const { post } = data;
   const notes = (data.notes.length ? data.notes : post.notes) as Note[];

   return (
      <main
         className="post-content relative min-h-screen  
         max-laptop:pt-10 max-laptop:pb-20 laptop:py-12"
      >
         <PostHeaderEdit post={post} />
         <RoomProvider
            id={post.id}
            initialPresence={{
               selectedBlockId: null,
            }}
            // initialStorage={{
            //    notes: new LiveList(notes),
            // }}
         >
            <ClientSideSuspense fallback={"Loading"}>
               {() => <Editor />}
            </ClientSideSuspense>
         </RoomProvider>
      </main>
   );
}

function PostView() {
   const data = useLoaderData<typeof loader>();

   const { post } = data;

   //This is necessary to determine whether the user should see the draft notes or not.
   const notes = (data.notes.length ? data.notes : post.notes) as Note[];

   return (
      <main
         className="post-content relative min-h-screen  
         max-laptop:pt-10 max-laptop:pb-20 laptop:py-12"
      >
         <section className="max-w-[728px] mx-auto max-desktop:px-3 mb-6">
            <h1 className="pb-3 font-header text-3xl font-semibold laptop:text-4xl">
               {post?.title}
            </h1>
            <div className="mt-1 py-3 laptop:mx-1 flex items-center gap-3 border-color border-y">
               <div className="bg-1 h-9 w-9 overflow-hidden rounded-full">
                  {/* @ts-expect-error */}
                  {post?.author?.avatar ? (
                     <Image /* @ts-expect-error */
                        url={post.author.avatar.url}
                        options="fit=crop,width=60,height=60 ,gravity=auto"
                        /* @ts-expect-error */
                        alt={post?.author?.username}
                     />
                  ) : null}
               </div>
               <div>
                  {/* @ts-expect-error */}
                  <div className="font-bold">{post?.author?.username}</div>
                  <div className="flex items-center gap-3">
                     <time
                        className="text-1 flex items-center gap-1.5 text-sm"
                        dateTime={post?.updatedAt}
                     >
                        {formatDistanceStrict(
                           new Date(post?.updatedAt as string),
                           new Date(),
                           {
                              addSuffix: true,
                           }
                        )}
                     </time>
                     {post?.publishedAt && (
                        <>
                           <span className="h-1 w-1 rounded-full bg-zinc-300"></span>
                           <time
                              className="text-1 flex items-center gap-1.5 text-sm"
                              dateTime={post?.publishedAt}
                           >
                              {format(new Date(post?.publishedAt), "MMM dd")}
                           </time>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </section>
         <section className="max-w-[800px] mx-auto">
            {post.banner ? (
               <div
                  className="bg-1 border-color flex aspect-[1.91/1] desktop:border 
                        laptop:rounded-none laptop:border-x-0 desktop:rounded-md
                        items-center justify-center overflow-hidden tablet:rounded-md
                        shadow-sm mb-8"
               >
                  <Image
                     alt={post.title}
                     options="fit=crop,height=440,gravity=auto"
                     className="h-full w-full object-cover"
                     //@ts-ignore
                     url={post?.banner?.url}
                  />
               </div>
            ) : null}
         </section>
         <section className="max-w-[728px] px-3 desktop:px-0 mx-auto">
            <Suspense fallback={<div>Loading...</div>}>
               {notes.map((note) => (
                  <NoteViewer
                     key={note.id}
                     note={note}
                     //insert custom components here
                     components={
                        {
                           // h2: (props) => <h2 className="text-2xl" {...props} />,
                        }
                     }
                  />
               ))}
            </Suspense>
         </section>
      </main>
   );
}

export async function action({
   context: { payload, user },
   request,
   params,
}: ActionArgs) {
   const { siteId, postId } = zx.parseParams(params, {
      siteId: z.string().length(10),
      postId: z.string(),
   });

   const { intent } = await zx.parseForm(request, {
      intent: z.string(),
   });

   if (!user || !user.id) return redirect("/login", { status: 302 });

   const session = await getSession(request.headers.get("cookie"));
   const issues = createCustomIssues(postSchema);

   switch (intent) {
      case "updateTitle": {
         assertIsPatch(request);
         const result = await zx.parseFormSafe(request, postSchema);
         if (result.success) {
            const { title } = result.data;
            try {
               return await payload.update({
                  collection: "posts",
                  id: postId,
                  data: {
                     title,
                  },
                  overrideAccess: false,
                  user,
               });
            } catch (error) {
               console.log(error);
               return json({
                  error: "Something went wrong...unable to update title.",
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
            error: "Something went wrong...unable to update title.",
         });
      }
      case "updateBanner": {
         assertIsPatch(request);
         const result = await getMultipleFormData({
            request,
            prefix: "postBanner",
            schema: postSchema,
         });
         if (result.success) {
            const { banner } = result.data;
            try {
               const bannerId = await uploadImage({
                  payload,
                  image: banner,
                  user,
               });
               return await payload.update({
                  collection: "posts",
                  id: postId,
                  data: {
                     banner: bannerId,
                  },
                  overrideAccess: false,
                  user,
               });
            } catch (error) {
               return json({
                  error: "Something went wrong...unable to update banner.",
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
            error: "Something went wrong...unable to update banner.",
         });
      }
      case "deleteBanner": {
         assertIsDelete(request);
         const post = await payload.findByID({
            collection: "posts",
            id: postId,
            overrideAccess: false,
            user,
            depth: 2,
         });
         //@ts-expect-error
         const bannerId = post?.banner?.id;
         await payload.delete({
            collection: "images",
            id: bannerId,
            overrideAccess: false,
            user,
         });
         return await payload.update({
            collection: "posts",
            id: postId,
            data: {
               banner: "",
            },
            overrideAccess: false,
            user,
         });
      }
      case "delete": {
         assertIsDelete(request);
         const post = await payload.delete({
            collection: "posts",
            id: postId,
            overrideAccess: false,
            user,
         });
         //@ts-expect-error
         const bannerId = post?.banner?.id;
         if (bannerId) {
            await payload.delete({
               collection: "images",
               id: bannerId,
               overrideAccess: false,
               user,
            });
         }
         post?.notes &&
            (await Promise.all(
               post?.notes?.map((note) =>
                  payload.delete({
                     collection: "notes",
                     id: typeof note === "string" ? note : note?.id,
                     overrideAccess: false,
                     user,
                  })
               )
            ));
         const postTitle = post?.title;
         setSuccessMessage(session, `"${postTitle}" successfully deleted`);
         return redirect(`/${siteId}/posts`, {
            headers: { "Set-Cookie": await commitSession(session) },
         });
      }
      case "unpublish": {
         const post = await payload.update({
            collection: "posts",
            id: postId,
            data: {
               isPublished: false,
               publishedAt: "",
            },
            overrideAccess: false,
            user,
         });
         post?.notes &&
            (await Promise.all(
               post?.notes?.map((note) =>
                  payload.update({
                     collection: "notes",
                     id: typeof note === "string" ? note : note?.id,
                     data: {
                        _status: "draft",
                     },
                     overrideAccess: false,
                     user,
                  })
               )
            ));
         return redirect(`/${siteId}/posts`);
      }
      case "publish": {
         //Flag post as published
         const post = await payload.update({
            collection: "posts",
            id: postId,
            data: {
               isPublished: true,
            },
            overrideAccess: false,
            user,
         });

         // console.dir(post, { depth: null });

         //publish all notes
         //todo: can we do this in one query?
         post?.notes &&
            (await Promise.all(
               post?.notes?.map((note) =>
                  payload.update({
                     collection: "notes",
                     id: typeof note === "string" ? note : note?.id,
                     data: {
                        _status: "published",
                     },
                     overrideAccess: false,
                     user,
                  })
               )
            ));
         await payload.update({
            collection: "posts",
            id: postId,
            data: {
               publishedAt: new Date().toISOString(),
            },
            overrideAccess: false,
            user,
         });

         // console.dir(notes, { depth: null });

         return redirect(`/${siteId}/posts`);
      }
      default:
         return null;
   }
}
