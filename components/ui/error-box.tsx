'use client';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

type ErrorBoxProps = {
  message: string | string[];
  dismissible?: boolean;
};

export function ErrorBox({ message, dismissible = true }: ErrorBoxProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="border-destructive bg-destructive/10 text-destructive relative flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-sm">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

      <div className="flex-1">
        {Array.isArray(message) ? (
          <ul className={`${message.length > 1 ? 'list-disc' : 'list-none'} pl-4`}>
            {message.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        ) : (
          <p>{message}</p>
        )}
      </div>

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="hover:bg-destructive/20 absolute top-2 right-2 rounded-sm p-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
