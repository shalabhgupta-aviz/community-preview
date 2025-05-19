// src/components/ToolBarPlugin.jsx
'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const apply = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="flex space-x-2 mb-2">
      <button
        onClick={() => apply('bold')}
        className="px-2 py-1 font-bold border rounded"
      >
        B
      </button>
      <button
        onClick={() => apply('italic')}
        className="px-2 py-1 italic border rounded"
      >
        I
      </button>
      <button
        onClick={() => apply('underline')}
        className="px-2 py-1 underline border rounded"
      >
        U
      </button>
    </div>
  );
}