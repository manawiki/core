import { useActive, useChainedCommands } from "@remirror/react";
import {
   Bold,
   Code,
   CurlyBraces,
   Heading2,
   Heading3,
   Italic,
   List,
   ListOrdered,
   Quote,
   Strikethrough,
} from "lucide-react";

export const EditorToolbar = ({
   theme,
}: {
   theme: "yellow" | "emerald" | "purple";
}) => {
   // Using command chaining
   const chain = useChainedCommands();

   const active = useActive();
   const groupDefaultStyle = `bg-4 h-8 w-8 flex items-center justify-center`;
   const activeStyle = `bg-3 text-${theme}-500`;
   const groupParentStyle = `divide-x divide-color overflow-hidden flex-none
    rounded-lg shadow-1 shadow-sm border border-color flex items-center shadow-1`;

   return (
      <div className="overflow-auto max-laptop:mr-32 top-36 sticky laptop:top-20 z-20 pb-0.5">
         <div className="flex items-center gap-3 flex-nowrap ">
            <div className={`${groupParentStyle}`}>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleBold()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.bold() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Bold size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleItalic()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.italic() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Italic size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleStrike()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.strike() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Strikethrough size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleBlockquote()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.blockquote() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Quote size={16} />
               </button>
            </div>
            <div className={`${groupParentStyle}`}>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleBulletList()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.bulletList() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <List size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleOrderedList()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.orderedList() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <ListOrdered size={18} />
               </button>
            </div>
            <div className={`${groupParentStyle}`}>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleHeading({ level: 2 })
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.heading({ level: 2 }) ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Heading2 size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleHeading({ level: 3 })
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.heading({ level: 3 }) ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Heading3 size={18} />
               </button>
            </div>
            <div className={`${groupParentStyle}`}>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleCode()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.code() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <Code size={18} />
               </button>
               <button
                  onClick={() => {
                     chain // Begin a chain
                        .toggleCodeBlock()
                        .focus()
                        .run(); // A chain must always be terminated with `.run()`
                  }}
                  className={`${
                     active.codeBlock() ? `${activeStyle}` : ""
                  } ${groupDefaultStyle}`}
               >
                  <CurlyBraces size={16} />
               </button>
            </div>
         </div>
      </div>
   );
};
