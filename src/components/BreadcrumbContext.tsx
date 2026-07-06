import { createContext, useContext, useEffect, useState } from 'react';
import type { BreadcrumbItem } from './Breadcrumb';

interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbState(): BreadcrumbContextValue {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbState must be used inside BreadcrumbProvider');
  return ctx;
}

/** Publishes this page's breadcrumb trail to the header bar for as long as the page is mounted. */
export function usePageBreadcrumb(items: BreadcrumbItem[]): void {
  const { setItems } = useBreadcrumbState();
  const key = items.map((item) => `${item.label}|${item.to ?? ''}`).join('>');

  useEffect(() => {
    setItems(items);
    return () => setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
