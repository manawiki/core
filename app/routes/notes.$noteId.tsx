import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import { Suspense, useDeferredValue, useRef, useState } from "react";

import { MDXProvider } from "@mdx-js/react";
import type { CompileOptions } from "@mdx-js/mdx";
import { compile } from "@mdx-js/mdx";
import DOMPurify from "isomorphic-dompurify";

import { lazily } from "react-lazily";
import { deferComponents } from "~/modules/note/utils";
import { NoteLive } from "~/modules/note/components/NoteLive";
import { NoteView, NoteStatic } from "~/modules/note/components/NoteView";

import { loader as entryLoader } from "~/routes/toweroffantasy.c.simulacra.$entryId";
import { loader as weaponLoader } from "~/routes/toweroffantasy.c.weapons.$entryId";

const { Header } = lazily(
   () => import("~/routes/toweroffantasy.c.simulacra.$entryId")
);

const { Stats } = lazily(
   () => import("~/routes/toweroffantasy.c.weapons.$entryId")
);

const mdxOptions = {
   outputFormat: "function-body",
   useDynamicImport: true,
   development: true,
   providerImportSource: "@mdx-js/react",
} satisfies CompileOptions;

//get notes list from payload
export async function loader({
   context: { payload, user },
   request,
   params,
}: LoaderArgs) {
   const { noteId } = zx.parseParams(params, {
      noteId: z.string(),
   });

   const note = await payload.findByID({
      collection: "notes",
      id: noteId,
      draft: true,
      overrideAccess: false,
      user,
   });

   const data = {
      meryl: entryLoader({ params: { entryId: "1" } }),
      nemesis: entryLoader({ params: { entryId: "2" } }),
      echo: entryLoader({ params: { entryId: "3" } }),
      "bai ling": entryLoader({ params: { entryId: "4" } }),
      "absolute zero": weaponLoader({ params: { entryId: "13" } }),
   };

   return defer({
      note,
      ...data,
   });
}

//This is a test note editor
export default function EditNote() {
   const { note, ...data } = useLoaderData<typeof loader>();

   const [mdx, setMDX] = useState(note?.mdx ?? "");
   const debouncedMDX = useDeferredValue(mdx);
   const fetcher = useFetcher();
   const viewRef = useRef<HTMLDivElement>(null);

   return (
      <div className="grid grid-cols-2 space-x-2">
         <fetcher.Form method="post">
            <input type="submit" className="bg-blue-500" />
            <textarea
               defaultValue={note?.mdx}
               name="mdx"
               className="w-full h-full"
               onChange={(e) => {
                  setMDX(e.target.value);
                  fetcher.submit({ mdx: e.target.value }, { method: "post" });
               }}
            />
            {/* <input
               hidden
               name="innerHTML"
               value={viewRef?.current?.innerHTML}
            /> */}
         </fetcher.Form>
         <div className="mdx-content" ref={viewRef}>
            <MDXProvider
               components={deferComponents({
                  components: { Header, Stats },
                  scope: data,
               })}
            >
               <Suspense fallback={<div>Loading...</div>}>
                  {/* <NoteView source={note?.source} /> */}
                  <NoteLive mdx={debouncedMDX} />
                  {/* <NoteStatic html={note?.html} /> */}
               </Suspense>
            </MDXProvider>
         </div>
      </div>
   );
}

export async function action({
   context: { payload, user },
   request,
   params,
}: ActionArgs) {
   const { noteId } = zx.parseParams(params, {
      noteId: z.string(),
   });
   const { mdx, autosave, innerHTML } = await zx.parseForm(request, {
      mdx: z.string(),
      autosave: z.string().optional(),
      innerHTML: z.string().optional(),
   });

   if (!user) {
      return redirect("/home");
   }

   //Generate source from mdx
   let source = undefined;
   try {
      source = String(await compile(mdx, mdxOptions));
   } catch (error) {
      console.log(error);
   }

   //Purify html
   let html = undefined;
   try {
      if (innerHTML)
         html = DOMPurify.sanitize(innerHTML, {
            //add iframe exception
            //T-1600 double check for potential XSS vectors
            ADD_TAGS: ["iframe"],
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
         });
   } catch (e) {
      console.log(e);
   }

   const note = await payload.update({
      collection: "notes",
      id: noteId,
      data: {
         mdx,
         source,
         html,
      },
      overrideAccess: false,
      user,
      autosave: Boolean(autosave),
      draft: true,
   });

   // console.log(note);
   return json({ note });
}
