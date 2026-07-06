import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbProvider, useBreadcrumbState } from './BreadcrumbContext';

function HeaderBar() {
  const { items } = useBreadcrumbState();
  return (
    <header className="flex h-[60px] w-full shrink-0 items-center border-b border-gray-200 bg-white px-4">
      {items.length > 0 ? <Breadcrumb items={items} /> : null}
    </header>
  );
}

export function Layout() {
  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <HeaderBar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
