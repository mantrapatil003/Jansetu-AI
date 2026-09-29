import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-neutral-300">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-neutral-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong.',
  description = 'Please try again.',
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-error-300">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0018 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-100 rounded w-full mb-1.5" />
          <div className="h-3 bg-neutral-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
