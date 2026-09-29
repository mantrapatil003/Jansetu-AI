import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton extends BaseProps {
  to?: undefined;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface ButtonAsLink extends BaseProps {
  to: string;
  onClick?: undefined;
  type?: undefined;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-600 shadow-sm',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus-visible:ring-primary-500',
  tertiary:
    'text-primary-700 hover:bg-primary-50 focus-visible:ring-primary-500',
  danger:
    'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
  } = props;

  const baseClass = `inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (loading) {
    return (
      <button
        className={baseClass}
        disabled
        type={props.type ?? 'button'}
      >
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {children}
      </button>
    );
  }

  if (props.to) {
    return (
      <Link to={props.to} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={baseClass}
      onClick={props.onClick}
      disabled={disabled}
      type={props.type ?? 'button'}
    >
      {children}
    </button>
  );
}
