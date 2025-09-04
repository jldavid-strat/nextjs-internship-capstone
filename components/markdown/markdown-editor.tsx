'use client';

import { commands, EditorContext, ICommand } from '@uiw/react-md-editor';
import dynamic from 'next/dynamic';
import { useContext } from 'react';
import rehypeSanitize from 'rehype-sanitize';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type MardownEditorProps = {
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
};

const CodePreview = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const handleClick = (e: React.MouseEvent) => {
    // prevents form submission
    e.preventDefault();
    e.stopPropagation();
    dispatch!({
      preview: preview === 'edit' ? 'preview' : 'edit',
    });
  };
  return (
    <button type="button" onClick={(e) => handleClick(e)}>
      {preview === 'edit' ? 'Preview' : 'Edit'}
    </button>
  );
};

const codePreview: ICommand = {
  name: 'preview',
  keyCommand: 'preview',
  value: 'preview',
  icon: <CodePreview />,
};

// [CONSIDER]
// https://www.shadcn.io/components/forms/minimal-tiptap

export default function MarkdownEditor({ value, onValueChange, placeholder }: MardownEditorProps) {
  return (
    <div>
      <MDEditor
        value={value}
        preview={'edit'}
        enableScroll
        maxHeight={100}
        commands={[
          commands.bold,
          commands.italic,
          commands.orderedListCommand,
          commands.code,
          commands.codeBlock,
        ]}
        visibleDragbar={false}
        onChange={(val) => onValueChange(val ?? '')}
        textareaProps={{
          placeholder: placeholder,
        }}
        extraCommands={[codePreview, commands.fullscreen]}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
}
