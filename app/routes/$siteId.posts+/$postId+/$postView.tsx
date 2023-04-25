import { Link, useLoaderData } from "@remix-run/react";
import { Suspense, useCallback, useMemo } from "react";
import {
   json,
   redirect,
   type V2_MetaFunction,
   type LoaderArgs,
} from "@remix-run/node";

import { z } from "zod";
import { zx } from "zodix";

import {
   Editable,
   Slate,
   withReact,
   type RenderElementProps,
} from "slate-react";
import { createEditor, type Descendant } from "slate";

import Block from "./edit/forge/blocks/Block";
import Leaf from "./edit/forge/blocks/Leaf";
import { PostHeader } from "./PostHeader";
import { ArrowLeft } from "lucide-react";
import { AdminOrStaffOrOwner } from "~/modules/auth";

export async function loader({
   context: { payload, user },
   params,
}: LoaderArgs) {
   const { postId, siteId, postView } = zx.parseParams(params, {
      postId: z.string(),
      siteId: z.string(),
      postView: z.string(),
   });

   const post = await payload.findByID({
      collection: "posts",
      id: postId,
      overrideAccess: false,
      user,
      depth: 2,
   });

   if (post.isPublished == false) {
      throw json(null, { status: 404 });
   }
   //If slug does not equal slug saved in database, redirect to the correct slug
   if (postView != post.url) {
      throw redirect(`/${siteId}/posts/${postId}/${post.url}`, 301);
   }

   if (post._status != "published")
      throw redirect(`/${siteId}/posts/${postId}/edit`);
   return { post, siteId };
}

export const handle = {
   // i18n key for this route. This will be used to load the correct translation
   i18n: "post",
};

export const meta: V2_MetaFunction = ({ data, matches }) => {
   const siteName = matches.find(({ id }) => id === "routes/$siteId")?.data
      ?.site.name;
   const postTitle = data.post.title;

   return [
      {
         title: `${postTitle} - ${siteName}`,
      },
   ];
};

export default function PostPage() {
   const editor = useMemo(() => withReact(createEditor()), []);
   const { post, siteId } = useLoaderData<typeof loader>();
   const renderElement = useCallback((props: RenderElementProps) => {
      return <Block {...props} />;
   }, []);

   return (
      <div>
         <AdminOrStaffOrOwner>
            <div className="fixed inset-x-0 bottom-24 z-10 mx-auto flex w-full items-center justify-center laptop:bottom-0">
               <Link
                  to={`/${siteId}/posts/${post.id}/edit`}
                  className="shadow-1 group inline-flex w-36 flex-none items-center justify-center gap-2 rounded-2xl 
               border border-emerald-300 bg-emerald-100 py-4 pl-3 pr-5 shadow dark:border-emerald-900 dark:bg-emerald-950 laptop:rounded-b-none laptop:border-b-0 laptop:py-5"
               >
                  <ArrowLeft className="text-emerald-500" size={20} />
                  <div className="font-bold text-emerald-600 group-hover:underline dark:text-emerald-100">
                     Edit post
                  </div>
               </Link>
            </div>
         </AdminOrStaffOrOwner>
         <main>
            <div className="mx-auto max-w-[728px] max-desktop:px-3">
               <h1 className="pt-8 font-header text-3xl !leading-[3rem] laptop:pt-10 laptop:text-4xl">
                  {post.title}
               </h1>
               <PostHeader post={post} />
               {post.subtitle && (
                  <div className="text-1 border-color  mb-6 border-b border-zinc-100 pb-5 font-semibold">
                     {post.subtitle}
                  </div>
               )}
            </div>
            {post?.banner && (
               <>
                  <section className="relative mx-auto mb-5 max-w-[800px]">
                     <div
                        className="bg-1 border-color flex aspect-[1.91/1] items-center 
                         justify-center overflow-hidden shadow-sm
                         tablet:rounded-md laptop:rounded-none laptop:border-x-0 desktop:rounded-md
                         desktop:border"
                     >
                        <img
                           alt="Post Banner"
                           className="h-full w-full object-cover"
                           //@ts-ignore
                           src={`https://mana.wiki/cdn-cgi/image/fit=crop,height=440,gravity=auto/${post?.banner?.url}`}
                        />
                     </div>
                  </section>
               </>
            )}
            <div className="mx-auto max-w-[728px] pb-8 max-desktop:px-4">
               <Suspense fallback={<div>Loading...</div>}>
                  <Slate editor={editor} value={post.content as Descendant[]}>
                     <Editable
                        renderElement={renderElement}
                        renderLeaf={Leaf}
                        readOnly={true}
                     />
                  </Slate>
               </Suspense>
            </div>
         </main>
      </div>
   );
}
