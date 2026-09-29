import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClass = `bg-white border border-neutral-200 rounded-xl ${hover ? 'shadow-card hover:shadow-card-hover transition-shadow cursor-pointer' : 'shadow-card'} ${className}`;
  return (
    <div className={baseClass} onClick={onClick}>
      {children}
    </div>
  );
}
