import { useId } from 'react';

interface Props {
  label: string;
  help?: string;
  max: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

/** "How many will you get right?" A slider the student has to move before going on. */
export function PredictionSlider({ label, help, max, value, unit = '', onChange }: Props) {
  const id = useId();
  return (
    <div className="field" style={{ width: '100%', maxWidth: 520 }}>
      <label htmlFor={id}>{label}</label>
      {help && <span className="help">{help}</span>}
      <div className="range-row">
        <input
          id={id}
          className="range"
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <output htmlFor={id} className="range-value">
          {value}
          {unit}
        </output>
      </div>
      <span className="help">
        0 means none, {max} means all {max}.
      </span>
    </div>
  );
}
