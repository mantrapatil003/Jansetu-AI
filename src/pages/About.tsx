import { HandHeart, Target, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import Alert from '@/components/ui/Alert';

export default function About() {
  const { language } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <HandHeart className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t(language, 'about.title')}</h1>
        <p className="text-lg text-neutral-500">{t(language, 'about.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <p className="text-sm text-neutral-700 leading-relaxed">{t(language, 'about.description')}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">{t(language, 'about.mission')}</h2>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{t(language, 'about.missionDesc')}</p>
        </div>

        <Alert variant="info">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{t(language, 'about.independent')}</p>
          </div>
        </Alert>
      </div>
    </div>
  );
}
