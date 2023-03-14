import { $getRoot, $getSelection } from "lexical";
import { useEffect } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {
   $convertFromMarkdownString,
   $convertToMarkdownString,
   TRANSFORMERS,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useMutation, useStorage } from "~/liveblocks.config";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";

const theme = {};
// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!

export const Editor = () => {
   const liveMdx = JSON.stringify(useStorage((root) => root.notes[0]));
   const initialConfig = {
      namespace: "MyEditor",
      editorState: liveMdx,
      theme,
      onError(error) {
         throw error;
      },
   };

   function Testing(): JSX.Element | null {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
         console.log(editor);
         const editorState = editor.parseEditorState(liveMdx);
         const json = editorState.toJSON();
         // updateLive(json);
         // editor.setEditorState(editorState);
      }, [liveMdx, editor]);

      return null;
   }

   // function onChange(editorState) {
   //    console.log(editorState);

   //    editorState.read(() => {
   //       const json = editorState.toJSON();
   //       updateLive(json);
   //       editorState.setEditorState(json);
   //    });
   // }

   const updateLive = useMutation(({ storage }, json) => {
      const mutableNote = storage.get("notes");
      mutableNote.set(0, json);
   }, []);

   return (
      <LexicalComposer initialConfig={initialConfig}>
         <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
         />
         {/* <OnChangePlugin onChange={onChange} /> */}
         <HistoryPlugin />
         <Testing />
      </LexicalComposer>
   );
};
