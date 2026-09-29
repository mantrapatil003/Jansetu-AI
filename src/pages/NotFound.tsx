import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';

export default function NotFound() {
  const { language } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-primary-400">
            <path d="M3 18h2v-6H3v6zm4 0h2V8H7v10zm4 0h2v-8h-2v8zm4 0h2V5h-2v13zm4 0h2v-11h-2v11z" fill="currentColor"/>
            <path d="M2 20h20v2H2z" fill="currentColor"/>
          </svg>
        </div>
        <p className="text-6xl font-bold text-neutral-900 mb-4">404</p>
        <h1 className="text-xl font-semibold text-neutral-700 mb-2">{t(language, 'notFound.title')}</h1>
        <p className="text-sm text-neutral-500 mb-6">{t(language, 'notFound.subtitle')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-colors shadow-sm"
        >
          <Home className="h-4 w-4" />
          {t(language, 'notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}
