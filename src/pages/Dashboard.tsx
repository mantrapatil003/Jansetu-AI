import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Bookmark, User, Globe2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t, getLocalizedField, LANGUAGES } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Service, SavedService, Language } from '@/types';
import { getIcon } from '@/lib/icons';
import { EmptyState } from '@/components/ui/States';
import { Input, Select } from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import type { Category } from '@/types';

export default function Dashboard() {
  const { user, profile, loading, language, refreshProfile } = useAuth();
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [fullName, setFullName] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>('en');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPreferredLang(profile.preferred_language);
    }
  }, [profile]);

  useEffect(() => {
    async function fetchSaved() {
      if (!user) {
        setLoadingSaved(false);
        return;
      }
      const { data } = await supabase
        .from('saved_services')
        .select('*, service:services(*, category:categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSavedServices((data as unknown as SavedService[]) || []);
      setLoadingSaved(false);
    }
    fetchSaved();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-48 mb-6" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), preferred_language: preferredLang })
      .eq('id', user.id);
    await refreshProfile();
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          {t(language, 'dashboard.welcome')}{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{savedServices.length}</p>
              <p className="text-xs text-neutral-500">{t(language, 'dashboard.savedServices')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 capitalize">{profile?.role || 'citizen'}</p>
              <p className="text-xs text-neutral-500">Account</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {LANGUAGES.find((l) => l.code === language)?.nativeLabel || 'English'}
              </p>
              <p className="text-xs text-neutral-500">{t(language, 'dashboard.preferredLanguage')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Services */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t(language, 'dashboard.yourServices')}</h2>
        {loadingSaved ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : savedServices.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-12 w-12" />}
            title={t(language, 'dashboard.noSavedServices')}
            action={
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
              >
                {t(language, 'dashboard.exploreServices')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {savedServices.map((saved) => {
              const service = saved.service as Service | null;
              if (!service) return null;
              const cat = service.category as Category | null;
              const Icon = cat ? getIcon(cat.icon) : getIcon(null);
              return (
                <Link
                  key={saved.id}
                  to={`/services/${service.id}`}
                  className="group flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-card-hover hover:border-primary-200 transition-all"
                >
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                      {getLocalizedField(service as unknown as Record<string, unknown>, 'name', language)}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {getLocalizedField(service as unknown as Record<string, unknown>, 'description', language)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Settings */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t(language, 'dashboard.accountInfo')}</h2>
        {profileSaved && (
          <div className="mb-4">
            <Alert variant="success">{t(language, 'dashboard.profileUpdated')}</Alert>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label={t(language, 'dashboard.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Select
            label={t(language, 'dashboard.preferredLanguage')}
            value={preferredLang}
            onChange={(e) => setPreferredLang(e.target.value as Language)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingProfile ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {t(language, 'dashboard.saveProfile')}
          </button>
        </div>
      </div>
    </div>
  );
}
