import { useState } from 'react';

interface Props {
  prompt: string;
  placeholder?: string;
  buttonLabel?: string;
  /** A new key gives a fresh, focused, empty box. */
  itemKey: string;
  inputMode?: 'text' | 'decimal';
  onSubmit: (typed: string) => void;
}

/** A single text box with a submit button. Enter submits. Focus lands in the box on each item. */
export function TypedAnswer(props: Props) {
  return <TypedAnswerBox key={props.itemKey} {...props} />;
}

function TypedAnswerBox({
  prompt,
  placeholder = 'Type here',
  buttonLabel = 'Check',
  inputMode = 'text',
  onSubmit,
}: Props) {
  const [value, setValue] = useState('');
  return (
    <form
      className="stack"
      style={{ width: '100%', maxWidth: 420 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <label className="field-label" htmlFor="typed-answer">
        {prompt}
      </label>
      <input
        id="typed-answer"
        ref={(el) => el?.focus()}
        className="input input-lg"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode={inputMode}
        maxLength={80}
      />
      <button type="submit" className="btn btn-block">
        {buttonLabel}
      </button>
    </form>
  );
}
