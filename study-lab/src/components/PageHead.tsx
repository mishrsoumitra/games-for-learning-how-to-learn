import type { ReactNode } from 'react';

interface Props {
  kicker?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}

export function PageHead({ kicker, title, lead, children }: Props) {
  return (
    <div className="page-head">
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </div>
  );
}
