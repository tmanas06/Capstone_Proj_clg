import { ReactNode } from 'react';

export default function EventsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
