import { Transition } from "@headlessui/react";
import type { FetcherWithComponents } from "@remix-run/react";
import { Link, useFetcher, useParams } from "@remix-run/react";
import {
   Trash2,
   Check,
   Redo2,
   Pencil,
   Expand,
   X,
   Info,
   MoreHorizontal,
} from "lucide-react";
import type { Note } from "payload/generated-types";
import { useState, useEffect } from "react";
import { DotLoader } from "~/components/DotLoader";
import { useIsMount, useDebouncedValue } from "~/hooks";
import { NoteViewer } from "~/modules/note/components/NoteViewer";
import { NoteText } from "~/modules/note/gui/NoteText";
import { isProcessing } from "~/utils";

import {
   RoomProvider,
   useList,
   useMutation,
   useOthers,
   useRoom,
   useStorage,
   useUpdateMyPresence,
} from "~/liveblocks.config";

const showNoteStyle = `w-9 h-9 rounded-full flex dark:!text-zinc-400 !text-zinc-500
items-center justify-center bg-3 border border-color transition
duration-300 active:translate-y-0.5`;

const DeleteNote = ({
   noteId,
   fetcher,
}: {
   noteId: Note["id"];
   fetcher: FetcherWithComponents<any>;
}) => {
   const { siteId, postId } = useParams();
   const [noteDeleteStatus, setNoteDeleteStatus] = useState("default");

   if (noteDeleteStatus === "default") {
      return (
         <button
            onClick={() => setNoteDeleteStatus("shouldDelete")}
            className={`${showNoteStyle}`}
         >
            <Trash2 size={16} />
         </button>
      );
   }
   if (noteDeleteStatus === "shouldDelete") {
      return (
         <div
            className="text-xs gap-0.5 px-1 flex font-bold h-9 rounded-full
             dark:!text-zinc-400 !text-zinc-500
             items-center justify-center bg-2 border border-color
             dark:border-zinc-600"
         >
            <button
               className="w-7 h-7 dark:hover:bg-zinc-700 hover:bg-zinc-100 rounded-full flex items-center justify-center"
               onClick={() =>
                  fetcher.submit(
                     {
                        intent: "deleteNote",
                     },
                     {
                        method: "delete",
                        action: `/${siteId}/posts/${postId}/edit/${noteId}`,
                     }
                  )
               }
            >
               <Check size={20} className="text-green-500" />
            </button>
            <button
               className="w-7 h-7 dark:hover:bg-zinc-700 hover:bg-zinc-100 rounded-full flex items-center justify-center"
               onClick={() => setNoteDeleteStatus("default")}
            >
               <Redo2 className="text-1" size={18} />
            </button>
         </div>
      );
   }
   return (
      <button className={`${showNoteStyle}`}>
         <Trash2 size={16} />
      </button>
   );
};

const View = ({
   note,
   setIsActive,
   isNoteAdding,
}: {
   note: Note;
   setIsActive: (prevCheck: boolean) => void;
   isNoteAdding: boolean | undefined;
}) => {
   return (
      <button
         //@ts-ignore
         onClick={() => setIsActive((prevCheck) => !prevCheck)}
         disabled={isNoteAdding}
         className="relative block text-left w-full"
      >
         <div className="group-hover:cursor-pointer relative">
            <section className="max-w-[728px] px-3 desktop:px-0 mx-auto">
               <div
                  className="w-full h-[calc(100%+18px)] absolute
               group-hover:visible 
             left-0 -top-2 border-dashed border-y-2 border-color invisible"
               />
               {note.mdx == "" && (
                  <div className="italic text-1">Empty...click to edit</div>
               )}
               <span
                  className="invisible cursor-pointer absolute top-1 right-3 
             text-sm text-1 group-hover:visible"
               >
                  <Pencil size={18} />
               </span>
               <NoteViewer className="relative z-10" note={note} />
            </section>
         </div>
      </button>
   );
};

const Editor = ({
   index,
   note,
   isNoteAdding,
   fetcher,
}: {
   index: number;
   note: Note;
   isNoteAdding: boolean | undefined;
   fetcher: FetcherWithComponents<any>;
}) => {
   const isMount = useIsMount();
   const [showNoteOptions, setShowNoteOptions] = useState(false);
   const [inlineValue, setInlineValue] = useState({ mdx: "", id: "" });
   const debouncedInlineSaveValue = useDebouncedValue(inlineValue, 500);

   const updateLive = useMutation(({ storage }, newValue) => {
      const mutableNote = storage.get("notes");
      mutableNote.set(index, { mdx: newValue });
   }, []);

   useEffect(() => {
      if (!isMount) {
         const { id, mdx } = inlineValue;
         fetcher.submit(
            { mdx, autosave: "yes", intent: "updateNote" },
            {
               method: "post",
               action: `/edit/${id}`,
            }
         );
         updateLive(mdx);
      }
   }, [debouncedInlineSaveValue]);

   const liveMdx = useStorage((root) => root.notes[index].mdx);

   return (
      <div className="px-3 desktop:px-0 border-y my-10 pt-4 border-color relative">
         <div className="top-[180px] sticky laptop:top-28 z-30">
            <div className="flex items-center gap-3 absolute right-0 laptop:right-10 -top-9">
               <Transition
                  show={showNoteOptions}
                  enter="ease-in-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
               >
                  <div className="flex items-center gap-2">
                     <Link
                        className={`${showNoteStyle}`}
                        to={`edit/${note.id}`}
                     >
                        <Expand size={16} />
                     </Link>
                     <DeleteNote fetcher={fetcher} noteId={note.id} />
                  </div>
               </Transition>
               <button
                  className="w-9 h-9 rounded-full flex !text-1
                     items-center justify-center bg-2 border-2 border-color transition
                     duration-300 active:translate-y-0.5
                     relative z-10"
                  onClick={() =>
                     setShowNoteOptions((showNoteOptions) => !showNoteOptions)
                  }
               >
                  {showNoteOptions ? (
                     <X className="text-red-500" size={20} />
                  ) : (
                     <MoreHorizontal size={20} />
                  )}
               </button>
               {isNoteAdding ? (
                  <div
                     className="h-9 w-16 rounded-full bg-white border-2 border-color
                        flex items-center justify-center bg-2"
                  >
                     <DotLoader />
                  </div>
               ) : (
                  <button
                     disabled={isNoteAdding}
                     //@ts-ignore
                     onClick={() => setIsActive((prevCheck) => !prevCheck)}
                     className="flex text-sm h-9 w-16 items-center bg-emerald-500 justify-center
                        rounded-full text-white font-bold"
                  >
                     Done
                  </button>
               )}
            </div>
         </div>
         <section className="max-w-[728px] relative mx-auto -mt-9">
            <div className="absolute -top-0.5 -left-11">
               <Link
                  className="w-9 h-9 rounded-full flex
                items-center justify-center transition !text-zinc-300
                active:translate-y-0.5 dark:!text-zinc-600"
                  to={"/help"}
               >
                  <Info className="bg-2 rounded-full" size={24} />
               </Link>
            </div>
            <NoteText
               theme="emerald"
               defaultValue={liveMdx}
               onChange={(value: any) =>
                  setInlineValue({
                     mdx: value,
                     id: note.id,
                  })
               }
            />
         </section>
      </div>
   );
};

export const InlineEditor = ({
   note,
   index,
   notes,
}: {
   note: Note;
   index: number;
   notes: Note[];
}) => {
   const fetcher = useFetcher();
   const isNoteAdding = isProcessing(fetcher.state);
   const [isActive, setIsActive] = useState<boolean>(true);
   const lastIndex = notes.length - 1;

   // if (
   //    (note.mdx == "" && index == 0) ||
   //    (index == 0 && lastIndex == 0) ||
   //    (index == lastIndex && note.mdx == "") ||
   //    note.mdx == ""
   // ) {
   //    return isActive ? (
   //       <Editor
   //          fetcher={fetcher}
   //          note={note}
   //          setIsActive={setIsActive}
   //          isNoteAdding={isNoteAdding}
   //       />
   //    ) : (
   //       <View
   //          note={note}
   //          setIsActive={setIsActive}
   //          isNoteAdding={isNoteAdding}
   //       />
   //    );
   // }
   // return isActive ? (
   //    <View note={note} setIsActive={setIsActive} isNoteAdding={isNoteAdding} />
   // ) : (
   return (
      <Editor
         fetcher={fetcher}
         index={index}
         note={note}
         isNoteAdding={isNoteAdding}
      />
   );
   // );
};
