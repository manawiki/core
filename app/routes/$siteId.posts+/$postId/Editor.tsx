import { useEffect, useState } from "react";
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
import { useDebouncedValue, useIsMount } from "~/hooks";

const theme = {};

function SyncLocal({ liveMdx }: { liveMdx: string }) {
   const [editor] = useLexicalComposerContext();
   useEffect(() => {
      if (liveMdx) {
         const editorState = editor.parseEditorState(liveMdx);
         editor.setEditorState(editorState);
      }
   }, [liveMdx]);
   return null;
}

export const Editor = () => {
   const liveMdx = JSON.stringify(useStorage((root) => root.notes[0]));
   const isMount = useIsMount();
   const [inlineValue, setInlineValue] = useState(liveMdx);
   const debouncedInlineSaveValue = useDebouncedValue(inlineValue, 500);

   const initialConfig = {
      namespace: "MyEditor",
      editorState: liveMdx,
      theme,
      onError(error: any) {
         throw error;
      },
   };
   const updateLive = useMutation(({ storage }, json) => {
      const mutableNote = storage.get("notes");
      mutableNote.set(0, json);
   }, []);

   useEffect(() => {
      if (!isMount) {
         updateLive(inlineValue);
      }
   }, [debouncedInlineSaveValue]);

   function onChange(editorState: any) {
      const json = editorState.toJSON();
      setInlineValue(json);
   }

   return (
      <LexicalComposer initialConfig={initialConfig}>
         <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
         />
         <OnChangePlugin onChange={onChange} />
         <HistoryPlugin />
         <SyncLocal liveMdx={liveMdx} />
      </LexicalComposer>
   );
};
