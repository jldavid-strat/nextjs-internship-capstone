'use client';

import { commands, EditorContext, ICommand } from '@uiw/react-md-editor';
import dynamic from 'next/dynamic';
import { useContext } from 'react';
import rehypeSanitize from 'rehype-sanitize';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type MardownEditorProps = {
  value: string;
  onValueChange: (value: string) => void;
};

const CodePreview = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const click = () => {
    dispatch!({
      preview: preview === 'edit' ? 'preview' : 'edit',
    });
  };
  return <button onClick={() => click()}>{preview === 'edit' ? 'Preview' : 'Edit'}</button>;
};

const codePreview: ICommand = {
  name: 'preview',
  keyCommand: 'preview',
  value: 'preview',
  icon: <CodePreview />,
};

// [CONSIDER]
// https://www.shadcn.io/components/forms/minimal-tiptap

export default function MarkdownEditor({ value, onValueChange }: MardownEditorProps) {
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
          placeholder: 'Enter task details in markdown',
        }}
        extraCommands={[codePreview, commands.fullscreen]}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
}
