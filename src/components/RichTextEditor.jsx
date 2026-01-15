import React, { useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Write content here..." }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className='border rounded'>
      {/* Toolbar */}
      <div className='flex gap-2 p-2 border-b bg-gray-50 flex-wrap'>
        <button
          type="button"
          onClick={() => formatText('bold')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h3')}
          className='px-3 py-1 border rounded hover:bg-gray-200'
          title="Heading"
        >
          H3
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className='min-h-[120px] p-3 outline-none'
        style={{ whiteSpace: 'pre-wrap' }}
        suppressContentEditableWarning={true}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;