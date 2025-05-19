'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Editor } from 'primereact/editor';
import { motion, AnimatePresence } from 'framer-motion';
import './SimpleRichTextEditor.css';

export default function SimpleRichTextEditor({ initialHtml = '', onChange }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [mentionActive, setMentionActive] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editorRef.current) return;
    const quill = editorRef.current.getQuill();
    if (!quill) return;
    quillRef.current = quill;
    quill.root.addEventListener('keydown', onKeydown);
    quill.on('text-change', onTextChange);
    return () => quill.root.removeEventListener('keydown', onKeydown);
  }, [editorRef.current]);

  function onTextChange() {
    if (!quillRef.current) return;
    onChange(quillRef.current.root.innerHTML);
  }

  async function onKeydown(evt) {
    if (!quillRef.current) return;
    const quill = quillRef.current;
    const sel = quill.getSelection();
    if (!sel) return;

    // backspace while typing a mention
    if (evt.key === 'Backspace' && mentionActive) {
      if (mentionQuery.length <= 1) {
        setMentionActive(false);
        setSuggestions([]);
      } else {
        const q = mentionQuery.slice(0, -1);
        setMentionQuery(q);
        await fetchSuggestions(q, sel.index);
      }
      return;
    }

    // start a mention
    if (evt.key === '@') {
      setMentionStartIndex(sel.index + 1);
      setMentionQuery('');
      setMentionActive(true);
      await fetchSuggestions('', sel.index + 1);
      return;
    }

    // continue typing slug characters
    if (mentionActive && /^[a-z0-9_-]+$/i.test(evt.key)) {
      const q = mentionQuery + evt.key;
      setMentionQuery(q);
      await fetchSuggestions(q, sel.index + 1);
      return;
    }

    // any other key cancels the mention dropdown
    if (mentionActive) {
      setMentionActive(false);
      setSuggestions([]);
    }
  }

  async function fetchSuggestions(query, cursorIndex) {
    if (!quillRef.current) return;
    const bounds = quillRef.current.getBounds(cursorIndex);
    setDropdownPos({ top: bounds.bottom + 8, left: bounds.left });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_V1}/users?username=${encodeURIComponent(
        query
      )}`
    );
    if (!res.ok) {
      setSuggestions([]);
      return;
    }
    const users = await res.json();
    setSuggestions(
      users.map(u => ({
        id: u.id,            // slug
        display: u.label,    // full name
        avatar: u.avatar,
        profile: u.profile
      }))
    );
  }

  function pickSuggestion(user) {
    const quill = quillRef.current;
    const start = mentionStartIndex - 1;
    const end = quill.getSelection().index;

    // 1) remove what was typed
    quill.deleteText(start, end - start);

    // 2) insert `@slug`
    const mentionText = `@${user.id}`;
    quill.insertText(
      start,
      mentionText,
      { background: '#e0f2ff', color: '#0077cc', bold: true },
      'user'
    );

    // 3) add a space
    const spacePos = start + mentionText.length;
    quill.insertText(spacePos, ' ', {}, 'user');

    // 4) clear formats on that space (reset active formats)
    quill.setSelection(spacePos, 1, 'silent');
    quill.format('background', false, 'silent');
    quill.format('color', false, 'silent');
    quill.format('bold', false, 'silent');

    // 5) collapse cursor just after the space
    quill.setSelection(spacePos + 1, 0, 'silent');

    // 6) hide dropdown
    setMentionActive(false);
    setSuggestions([]);
  }

  return (
    <div className="mention-editor-wrapper" style={{ position: 'relative' }}>
      <Editor
        ref={editorRef}
        style={{ height: '180px' }}
        value={initialHtml}
        onTextChange={() => {}}
        headerTemplate={
          <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-link" />
          </span>
        }
      />

      <AnimatePresence>
        {mentionActive && suggestions.length > 0 && (
          <motion.ul
            className="mention-dropdown"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {suggestions.map(u => (
              <li
                key={u.id}
                className="mention-item"
                onMouseDown={() => pickSuggestion(u)}
              >
                <img src={u.avatar} alt={u.display} className="mention-avatar" />
                <div className="mention-texts">
                  <span className="mention-name">@{u.id}</span>
                  <small className="mention-label">{u.display}</small>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}