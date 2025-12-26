import { ReactNode } from 'react';
import { Header } from './Header';

interface PageContainerProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function PageContainer({ children, showHeader = true }: PageContainerProps) {
  return (
    <div className="min-h-screen">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-24 pb-12' : 'py-12'}>
        {children}
      </main>
    </div>
  );
}
