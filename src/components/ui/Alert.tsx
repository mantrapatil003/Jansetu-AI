import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variantConfig: Record<AlertVariant, { bg: string; border: string; text: string; icon: ReactNode }> = {
  info: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
    icon: <Info className="h-5 w-5 text-primary-600" />,
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-800',
    icon: <CheckCircle2 className="h-5 w-5 text-success-600" />,
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-800',
    icon: <AlertTriangle className="h-5 w-5 text-warning-600" />,
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    text: 'text-error-800',
    icon: <XCircle className="h-5 w-5 text-error-600" />,
  },
};

export default function Alert({ variant = 'info', title, children }: AlertProps) {
  const config = variantConfig[variant];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${config.bg} ${config.border}`}>
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        {title && <p className={`font-medium text-sm mb-0.5 ${config.text}`}>{title}</p>}
        <div className={`text-sm ${config.text} opacity-90`}>{children}</div>
      </div>
    </div>
  );
}
