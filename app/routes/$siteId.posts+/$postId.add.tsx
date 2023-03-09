import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import { NewNoteType } from "~/modules/note/components/NewNoteType";
import { assertIsPost } from "~/utils";

export async function loader({
   context: { payload, user },
   params,
}: LoaderArgs) {
   const noteTypes = await payload.find({
      collection: "notetypes",
      user,
   });

   return { noteTypes };
}

export default function AddNoteModal() {
   const { noteTypes } = useLoaderData<typeof loader>();

   return <NewNoteType noteTypes={noteTypes} />;
}

export async function action({
   context: { payload, user },
   request,
   params,
}: ActionArgs) {
   if (!user || !user.id) return redirect("/login", { status: 302 });

   const { intent } = await zx.parseForm(request, {
      intent: z.string(),
   });

   const { siteId, postId } = zx.parseParams(params, {
      siteId: z.string(),
      postId: z.string(),
   });

   const { ui } = await zx.parseForm(request, {
      ui: z.string(),
   });

   switch (intent) {
      case "addNewSection": {
         assertIsPost(request);
         const note = await payload.create({
            collection: "notes",
            data: {
               ui,
               mdx: "",
               data: [],
               author: user?.id,
            },
            draft: true,
            overrideAccess: false,
            user,
         });

         const post = await payload.findByID({
            collection: "posts",
            id: postId,
            user,
            depth: 2,
         });

         const notes = post?.notes
            ? [
                 ...post?.notes.map((note) =>
                    typeof note === "string" ? note : note.id
                 ),
                 note.id,
              ]
            : [note.id];

         await payload.update({
            collection: "posts",
            id: postId,
            data: {
               notes,
            },
            overrideAccess: false,
            user,
         });

         return redirect(`/${siteId}/posts/${postId}/edit/${note.id}`);
      }
      case "addNewInlineSection": {
         assertIsPost(request);
         const note = await payload.create({
            collection: "notes",
            data: {
               ui,
               mdx: "",
               data: [],
               author: user?.id,
            },
            draft: true,
            overrideAccess: false,
            user,
         });

         const post = await payload.findByID({
            collection: "posts",
            id: postId,
            user,
            depth: 2,
         });

         const notes = post?.notes
            ? [
                 ...post?.notes.map((note) =>
                    typeof note === "string" ? note : note.id
                 ),
                 note.id,
              ]
            : [note.id];

         return await payload.update({
            collection: "posts",
            id: postId,
            data: {
               notes,
            },
            overrideAccess: false,
            user,
         });
      }

      default:
         return null;
   }
}
