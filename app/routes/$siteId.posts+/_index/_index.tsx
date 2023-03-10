import type { LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
   Form,
   Link,
   useLoaderData,
   useSearchParams,
   useTransition,
} from "@remix-run/react";
import { zx } from "zodix";
import { z } from "zod";
import {
   ChevronDown,
   ChevronLeft,
   ChevronRight,
   ChevronsUpDown,
   File,
   LayoutTemplate,
   Loader2,
   Search,
   X,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, Fragment } from "react";
import { useDebouncedValue } from "~/hooks";
import { isLoading } from "~/utils";
import { AdminOrOwner } from "~/modules/auth";
import { Listbox, Menu, Transition } from "@headlessui/react";
import { FeedItem } from "./FeedItem";

export const handle = {};

export async function loader({
   context: { payload, user },
   params,
   request,
}: LoaderArgs) {
   const { siteId } = zx.parseParams(params, {
      siteId: z.string().length(10),
   });

   const { q, status, page } = zx.parseQuery(request, {
      q: z.string().optional(),
      status: z.union([z.literal("draft"), z.literal("published")]).optional(),
      page: z.coerce.number().optional(),
   });

   //TODO Should limit this to only logged in users who are admin users of the site
   const myPosts = await payload.find({
      collection: "posts",
      user,
      page: page ?? 1,
      where: {
         isPublished:
            status === "draft"
               ? { equals: false }
               : status === "published"
               ? { equals: true }
               : {},
         site: {
            equals: siteId,
         },
      },
      sort: "-updatedAt",
   });

   const publishedPosts = await payload.find({
      collection: "posts",
      user,
      depth: 2,
      where: {
         title: q ? { contains: q } : {},
         isPublished: {
            equals: true,
         },
         site: {
            equals: siteId,
         },
      },
      sort: "-publishedAt",
   });
   return json({ q, myPosts, publishedPosts });
}

export default function PostsIndex() {
   const { myPosts, publishedPosts, q } = useLoaderData<typeof loader>();
   const [query, setQuery] = useState(q);
   const debouncedValue = useDebouncedValue(query, 500);
   const transition = useTransition();
   const isSearching = isLoading(transition);
   const [searchParams, setSearchParams] = useSearchParams({});
   const [selectedStatus, setSelectedStatus] = useState("All");
   const [searchToggle, setSearchToggle] = useState(false);

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

   return (
      <>
         <div className="mx-auto max-w-[728px] px-3 py-10 tablet:px-0 laptop:px-3 desktop:px-0">
            <div className="border-color relative mb-16 border-b-2 pb-2">
               <h1 className="text-3xl font-header font-bold">Posts</h1>
               <Menu as="div" className="relative">
                  <Menu.Button className="absolute right-0 -top-5 rounded-full border-8 border-color">
                     {({ open }) => (
                        <div
                           className=" flex h-10 items-center 
                              gap-2 rounded-full bg-emerald-500 pr-4 pl-5 text-white"
                        >
                           <span className="text-sm font-bold">New Post</span>
                           <ChevronDown
                              size={18}
                              className={`${
                                 open ? "rotate-180" : ""
                              } transform transition  duration-300 ease-in-out`}
                           />
                        </div>
                     )}
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
                        className="absolute right-0 z-20 mt-10 w-full min-w-[100px]
                                 max-w-[220px] origin-top-right transform transition-all"
                     >
                        <div className="border-color rounded-lg border bg-2 p-1.5 shadow shadow-1">
                           <Menu.Item>
                              <Form method="post">
                                 <button
                                    className="text-1 flex w-full items-center gap-3 rounded-lg
                                 p-2.5 font-bold hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                    name="intent"
                                    value="createPost"
                                    type="submit"
                                 >
                                    <File
                                       size="18"
                                       className="text-emerald-500"
                                    />
                                    <span>Blank Post</span>
                                 </button>
                              </Form>
                           </Menu.Item>
                           <Menu.Item>
                              <Form method="post">
                                 <button
                                    className="text-1 flex w-full items-center gap-3 rounded-lg
                                 p-2.5 font-bold hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                    name="intent"
                                    value="createPost"
                                    type="submit"
                                 >
                                    <LayoutTemplate
                                       size="18"
                                       className="text-emerald-500"
                                    />
                                    <span>Template</span>
                                 </button>
                              </Form>
                           </Menu.Item>
                        </div>
                     </Menu.Items>
                  </Transition>
               </Menu>
               <ul className="text-1 absolute -bottom-7 left-0 flex items-center gap-3 text-xs uppercase">
                  <li>Changelog</li>
                  <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  <li>Docs</li>
               </ul>
            </div>
            <AdminOrOwner>
               <section className="pb-6">
                  <div className="flex items-center justify-between pb-3">
                     <h2 className="text-1 text-sm font-bold uppercase">
                        Recent Posts
                     </h2>
                     <Listbox
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                     >
                        <div className="relative z-10">
                           <Listbox.Button className="text-1 flex items-center gap-2 text-sm font-semibold hover:underline">
                              {selectedStatus}
                              <ChevronsUpDown
                                 className="text-emerald-500"
                                 size={16}
                              />
                           </Listbox.Button>
                           <Transition
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                           >
                              <Listbox.Options
                                 className="border-color text-1 absolute right-0 mt-2 w-[120px]
                                 rounded-lg border bg-3 p-1.5 shadow-1 shadow-lg"
                              >
                                 <Listbox.Option key="draft" value="Drafts">
                                    {({ selected }) => (
                                       <>
                                          <button
                                             className="text-1 relative flex w-full items-center gap-3 rounded-md
                                              px-2 py-1 text-sm hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                             onClick={() =>
                                                setSearchParams(
                                                   (searchParams) => {
                                                      searchParams.set(
                                                         "status",
                                                         "draft"
                                                      );
                                                      return searchParams;
                                                   }
                                                )
                                             }
                                          >
                                             {selected ? (
                                                <span
                                                   className="absolute right-2 h-1.5 w-1.5 rounded-full
                                                 bg-emerald-500"
                                                />
                                             ) : null}
                                             Draft
                                          </button>
                                       </>
                                    )}
                                 </Listbox.Option>
                                 <Listbox.Option
                                    key="published"
                                    value="Published"
                                 >
                                    {({ selected }) => (
                                       <>
                                          <button
                                             className="text-1 relative flex w-full items-center gap-3 rounded-md
                                           px-2 py-1 text-sm hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                             onClick={() =>
                                                setSearchParams(
                                                   (searchParams) => {
                                                      searchParams.set(
                                                         "status",
                                                         "published"
                                                      );
                                                      return searchParams;
                                                   }
                                                )
                                             }
                                          >
                                             {selected ? (
                                                <span
                                                   className="absolute right-2 h-1.5 w-1.5 rounded-full
                                                 bg-emerald-500"
                                                />
                                             ) : null}
                                             Published
                                          </button>
                                       </>
                                    )}
                                 </Listbox.Option>
                                 <Listbox.Option key="all" value="All">
                                    {({ selected }) => (
                                       <>
                                          <button
                                             className="text-1 relative flex w-full items-center gap-3 rounded-md
                                           px-2 py-1 text-sm hover:bg-zinc-100 hover:dark:bg-zinc-700/50"
                                             onClick={() =>
                                                setSearchParams(
                                                   (searchParams) => {
                                                      searchParams.delete(
                                                         "status"
                                                      );
                                                      return searchParams;
                                                   }
                                                )
                                             }
                                          >
                                             {selected ? (
                                                <span
                                                   className="absolute right-2 h-1.5 w-1.5 rounded-full
                                                 bg-emerald-500"
                                                />
                                             ) : null}
                                             All
                                          </button>
                                       </>
                                    )}
                                 </Listbox.Option>
                              </Listbox.Options>
                           </Transition>
                        </div>
                     </Listbox>
                  </div>
                  <section className="border-color divide-y overflow-hidden rounded-md border divide-color bg-2">
                     {myPosts?.docs.length === 0 ? (
                        <div className="p-3 text-sm ">No posts...</div>
                     ) : (
                        myPosts.docs.map((post) => (
                           <Link
                              prefetch="intent"
                              to={post.id}
                              key={post.id}
                              className="group flex items-center justify-between gap-2 py-3 pl-3"
                           >
                              <span className="truncate text-sm font-semibold group-hover:underline">
                                 {post.title}
                              </span>
                              {post.updatedAt && (
                                 <div className="flex flex-none items-center gap-4">
                                    <time
                                       className="text-1 flex items-center gap-1.5 text-sm"
                                       dateTime={post?.updatedAt}
                                    >
                                       {format(
                                          new Date(post?.updatedAt),
                                          "MMM dd"
                                       )}
                                    </time>
                                    {post.isPublished ? (
                                       <span className="-mr-1.5 h-3 w-3 rounded-full bg-green-300 dark:bg-green-400" />
                                    ) : (
                                       <span className="-mr-1.5 h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-500" />
                                    )}
                                 </div>
                              )}
                           </Link>
                        ))
                     )}
                  </section>
                  {myPosts?.docs.length > 9 && (
                     <div className="text-1 flex items-center justify-between py-3 pl-1 text-sm">
                        <div>
                           Showing{" "}
                           <span className="font-bold">
                              {myPosts.pagingCounter}
                           </span>{" "}
                           to{" "}
                           <span className="font-bold">
                              {myPosts.docs.length + myPosts.pagingCounter - 1}
                           </span>{" "}
                           of{" "}
                           <span className="font-bold">
                              {myPosts.totalDocs}
                           </span>{" "}
                           results
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                           {myPosts.hasPrevPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          myPosts.prevPage as any
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
                           {myPosts.hasNextPage && myPosts.hasPrevPage && (
                              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                           )}
                           {myPosts.hasNextPage ? (
                              <button
                                 className="flex items-center gap-1 font-semibold uppercase hover:underline"
                                 onClick={() =>
                                    setSearchParams((searchParams) => {
                                       searchParams.set(
                                          "page",
                                          myPosts.nextPage as any
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
               </section>
            </AdminOrOwner>
            <div className="relative flex h-12 items-center justify-between">
               {searchToggle ? (
                  <>
                     <div className="relative flex w-full items-center gap-2">
                        <span className="absolute left-0">
                           {isSearching ? (
                              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                           ) : (
                              <Search size={20} className="text-emerald-500" />
                           )}
                        </span>
                        <input
                           type="text"
                           autoFocus
                           placeholder="Search or create a post..."
                           className="w-full !border-0 bg-transparent pl-10 focus:ring-0"
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                        />
                     </div>
                     <button
                        className="absolute right-0 top-3.5"
                        onClick={() => {
                           setSearchParams((searchParams) => {
                              searchParams.delete("q");
                              return searchParams;
                           });
                           setQuery("");
                           setSearchToggle(false);
                        }}
                     >
                        <X size={22} className="text-red-500" />
                     </button>
                  </>
               ) : (
                  <>
                     <h2 className="text-1 text-sm font-bold uppercase">
                        Latest
                     </h2>
                     <button
                        onClick={() => {
                           setSearchToggle(true);
                        }}
                     >
                        <Search size={22} className="text-emerald-500" />
                     </button>
                  </>
               )}
            </div>
            <section className="border-color divide-y overflow-hidden border-y dark:divide-zinc-700">
               {publishedPosts?.docs.length === 0 ? (
                  <div className="flex items-center justify-between py-5 text-sm">
                     <div className="flex items-center gap-1">
                        {searchParams.get("q") ? (
                           <>
                              <span className="text-1">
                                 No results... Create new post with title
                              </span>
                              <span className="font-bold">
                                 "{searchParams.get("q")}"
                              </span>
                              <Form method="post" className="flex items-center">
                                 <button
                                    name="intent"
                                    className="group flex items-center gap-1"
                                    value="createWithTitle"
                                    type="submit"
                                 >
                                    <input
                                       type="hidden"
                                       value={searchParams.get("q") ?? ""}
                                       name="title"
                                    />
                                    <span className="font-bold text-emerald-500 underline-offset-2 group-hover:underline">
                                       New Post
                                    </span>
                                    <ChevronRight
                                       className="text-zinc-400"
                                       size={18}
                                    />
                                 </button>
                              </Form>
                           </>
                        ) : (
                           <>No posts...</>
                        )}
                     </div>
                  </div>
               ) : (
                  publishedPosts.docs.map((post) => (
                     <FeedItem key={post.id} post={post} />
                  ))
               )}
            </section>
         </div>
      </>
   );
}

export const action = async ({
   context: { payload, user },
   request,
   params,
}: LoaderArgs) => {
   const { siteId } = zx.parseParams(params, {
      siteId: z.string().length(10),
   });

   if (!user || !user.id) return redirect("/login", { status: 302 });

   const { intent } = await zx.parseForm(request, {
      intent: z.string(),
   });

   switch (intent) {
      case "createWithTitle": {
         const { title } = await zx.parseForm(request, {
            title: z.string(),
         });
         const note = await payload.create({
            collection: "notes",
            data: { mdx: "", data: [], ui: "textarea", author: user?.id },
            user,
            overrideAccess: false,
            draft: true,
         });

         const post = await payload.create({
            collection: "posts",
            data: {
               title,
               author: user?.id,
               notes: [note.id],
               site: siteId,
            },
            user,
            overrideAccess: false,
         });
         return redirect(`/${siteId}/posts/${post.id}`);
      }
      case "createPost": {
         const note = await payload.create({
            collection: "notes",
            data: { mdx: "", data: [], ui: "textarea", author: user?.id },
            user,
            overrideAccess: false,
            draft: true,
         });

         const post = await payload.create({
            collection: "posts",
            data: {
               title: "Untitled",
               author: user?.id,
               notes: [note.id],
               site: siteId,
            },
            user,
            overrideAccess: false,
         });

         return redirect(`/${siteId}/posts/${post.id}`);
      }
   }
};
