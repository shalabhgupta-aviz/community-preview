// // src/plugins/richTextEditor.jsx
'use client';

import { LexicalComposer }     from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin }      from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable }     from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin }       from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin }      from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS }           from '@lexical/markdown';

import ToolbarPlugin from '../components/ToolBarPlugin'; // ← your new file

export default function RichTextEditorWrapper() {
  const initialConfig = { /* … your composer config … */ };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor" />}
        placeholder={<div>Type something...</div>}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={(editorState) => {/* … */}} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </LexicalComposer>
  );
}