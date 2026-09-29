import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FileText,
  FolderOpen,
  GraduationCap,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t, getLocalizedField } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Service, Category } from '@/types';
import { getIcon } from '@/lib/icons';
import Breadcrumbs from '@/components/ui/States';
import { ErrorState } from '@/components/ui/States';
import Alert from '@/components/ui/Alert';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchService() {
      if (!id) return;
      const { data, error } = await supabase
        .from('services')
        .select('*, category:categories(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setError(true);
      } else {
        setService(data as unknown as Service);
      }
      setLoading(false);
    }
    fetchService();
  }, [id]);

  useEffect(() => {
    async function checkSaved() {
      if (!user || !id) return;
      const { data } = await supabase
        .from('saved_services')
        .select('id')
        .eq('service_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setSaved(!!data);
    }
    checkSaved();
  }, [user, id]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;
    setSaving(true);
    if (saved) {
      await supabase
        .from('saved_services')
        .delete()
        .eq('service_id', id)
        .eq('user_id', user.id);
      setSaved(false);
    } else {
      await supabase
        .from('saved_services')
        .insert({ service_id: id, user_id: user.id });
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-48 mb-4" />
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-neutral-100 rounded w-full mb-2" />
          <div className="h-4 bg-neutral-100 rounded w-5/6 mb-6" />
          <div className="space-y-3">
            <div className="h-24 bg-neutral-100 rounded-xl" />
            <div className="h-24 bg-neutral-100 rounded-xl" />
            <div className="h-24 bg-neutral-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState onRetry={() => navigate('/services')} retryLabel={t(language, 'common.back')} />
      </div>
    );
  }

  const cat = service.category as Category | null;
  const Icon = cat ? getIcon(cat.icon) : FileText;
  const name = getLocalizedField(service as unknown as Record<string, unknown>, 'name', language);
  const description = getLocalizedField(service as unknown as Record<string, unknown>, 'description', language);
  const eligibility = getLocalizedField(service as unknown as Record<string, unknown>, 'eligibility', language);
  const documents = getLocalizedField(service as unknown as Record<string, unknown>, 'required_documents', language);
  const procedure = getLocalizedField(service as unknown as Record<string, unknown>, 'procedure', language);

  const sections = [
    { key: 'overview', icon: Info, title: t(language, 'serviceDetail.overview'), content: description },
    { key: 'eligibility', icon: CheckCircle2, title: t(language, 'serviceDetail.eligibility'), content: eligibility },
    { key: 'documents', icon: FolderOpen, title: t(language, 'serviceDetail.requiredDocuments'), content: documents },
    { key: 'procedure', icon: FileText, title: t(language, 'serviceDetail.howToApply'), content: procedure, isSteps: true },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: t(language, 'nav.home'), to: '/' },
          { label: t(language, 'nav.services'), to: '/services' },
          { label: name },
        ]}
      />

      {/* Header */}
      <div className="mt-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="h-7 w-7 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{name}</h1>
            {cat && (
              <span className="inline-block text-sm text-neutral-500">
                {t(language, 'serviceDetail.category')}: {getLocalizedField(cat as unknown as Record<string, unknown>, 'name', language)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors mb-6 ${
          saved
            ? 'text-success-700 bg-success-50 border border-success-200'
            : 'text-primary-700 bg-white border border-primary-200 hover:bg-primary-50'
        }"
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? t(language, 'serviceDetail.saved') : t(language, 'serviceDetail.save')}
      </button>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const hasContent = section.content && section.content.trim();
          return (
            <div key={section.key} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <SectionIcon className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">{section.title}</h2>
              </div>
              {hasContent ? (
                section.isSteps ? (
                  <ol className="space-y-3">
                    {section.content.split('\n').map((step, i) => {
                      const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
                      if (!cleanStep) return null;
                      return (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {i + 1}
                          </span>
                          <p className="text-sm text-neutral-700 leading-relaxed pt-0.5">{cleanStep}</p>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                )
              ) : (
                <p className="text-sm text-neutral-400 italic">{t(language, 'serviceDetail.infoNotAvailable')}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Source */}
      {service.official_link && (
        <div className="mt-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-success-600" />
            <h2 className="text-lg font-semibold text-neutral-900">{t(language, 'serviceDetail.officialSource')}</h2>
          </div>
          <a
            href={service.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {t(language, 'serviceDetail.visitWebsite')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Important Info */}
      <div className="mt-6">
        <Alert variant="info">
          {t(language, 'serviceDetail.infoNotAvailable')}
        </Alert>
      </div>

      <div className="mt-6">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t(language, 'nav.services')}
        </Link>
      </div>
    </div>
  );
}
