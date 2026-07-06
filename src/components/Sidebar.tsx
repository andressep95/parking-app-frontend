import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';
import { usePermissions } from '../hooks/usePermissions';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function IconBuilding() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuthContext();
  const { isAdmin, canManageOrgs } = usePermissions();

  const navItems: NavItem[] = [
    ...(canManageOrgs ? [{ to: '/clients', label: 'Clientes', icon: <IconBuilding /> }] : []),
  ];

  const roleBadge = isAdmin ? 'ADMIN' : 'CUSTOMER';
  const initials = [user?.givenName?.[0], user?.familyName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <aside className="group flex h-screen w-12 hover:w-52 shrink-0 flex-col bg-white border-r border-gray-200 overflow-x-hidden transition-[width] duration-200 ease-in-out">

      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center border-b border-gray-200 px-3 gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-900">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14M5 3v18M5 3H3m16 0v18m0-18h2M5 21h14M9 8h3a2 2 0 110 4H9V8z" />
          </svg>
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
          Parking App
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        <ul className="space-y-px">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                {item.icon}
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 px-1.5 py-2 space-y-px">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
            {initials}
          </div>
          <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
            <p className="whitespace-nowrap text-xs font-medium text-gray-700">
              {user?.givenName} {user?.familyName}
            </p>
            <p className="whitespace-nowrap text-[10px] text-gray-400">{roleBadge}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          title="Cerrar sesión"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <IconSignOut />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
