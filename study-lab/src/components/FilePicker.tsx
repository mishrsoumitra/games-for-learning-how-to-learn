import { useId, useRef, useState } from 'react';
import { readTextFile } from '../lib/download.ts';

interface Props {
  label: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onText: (texts: string[]) => void | Promise<void>;
}

/** A button that opens the file picker and hands back the text of each chosen file. */
export function FilePicker({
  label,
  accept = '.json,application/json',
  multiple = false,
  className,
  onText,
}: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  return (
    <span className="row">
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="visually-hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length === 0) return;
          try {
            const texts = await Promise.all(files.map((f) => readTextFile(f)));
            setError('');
            await onText(texts);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not read that file.');
          }
        }}
      />
      <button
        type="button"
        className={className ?? 'btn btn-secondary'}
        onClick={() => input.current?.click()}
      >
        {label}
      </button>
      {error !== '' && (
        <span className="error-text" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
