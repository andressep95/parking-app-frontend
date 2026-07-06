import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

function ChevronRightIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRightIcon /> : null}
            {!isLast && item.to !== undefined ? (
              <Link to={item.to} className="text-gray-500 hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-medium text-gray-900' : 'text-gray-500'}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
