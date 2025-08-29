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

const Button = () => {
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
  icon: <Button />,
};
const Disable = () => {
  const { preview } = useContext(EditorContext);
  return (
    <button disabled={preview === 'preview'}>
      <svg viewBox="0 0 16 16" width="12px" height="12px">
        <path
          d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.9 13H7v-1.8h1.9V13Zm-.1-3.6v.5H7.1v-.6c.2-2.1 2-1.9 1.9-3.2.1-.7-.3-1.1-1-1.1-.8 0-1.2.7-1.2 1.6H5c0-1.7 1.2-3 2.9-3 2.3 0 3 1.4 3 2.3.1 2.3-1.9 2-2.1 3.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

const customButton = {
  name: 'disable',
  keyCommand: 'disable',
  value: 'disable',
  icon: <Disable />,
};

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
