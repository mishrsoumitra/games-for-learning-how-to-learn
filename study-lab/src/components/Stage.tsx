import type { ReactNode } from 'react';

interface Props {
  frame?: 'a' | 'b' | 'none' | undefined;
  label?: string | undefined;
  count?: string | undefined;
  children: ReactNode;
}

/**
 * The area where an activity happens. The two conditions get two frame colours, kept the
 * same for the whole run, so a student can tell afterwards which phase a memory came from
 * (Yan, Bjork and Bjork, 2016, found this separation matters for believing the result).
 */
export function Stage({ frame = 'none', label, count, children }: Props) {
  const frameClass = frame === 'a' ? ' stage-frame-a' : frame === 'b' ? ' stage-frame-b' : '';
  const labelClass = frame === 'a' ? ' stage-label-a' : frame === 'b' ? ' stage-label-b' : '';
  return (
    <section className={`stage${frameClass}`} aria-live="polite">
      {label && <span className={`stage-label${labelClass}`}>{label}</span>}
      {count && <span className="stage-count">{count}</span>}
      {children}
    </section>
  );
}
