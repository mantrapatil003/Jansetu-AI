import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Search,
  Bot,
  CheckCircle2,
  FileText,
  ArrowRight,
  HandHeart,
  Globe2,
  LifeBuoy,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t, getLocalizedField } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Service, Category, Announcement } from '@/types';
import { getIcon } from '@/lib/icons';

export default function Home() {
  const { language } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [servicesRes, announcementsRes] = await Promise.all([
        supabase
          .from('services')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .limit(6),
        supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);
      setServices((servicesRes.data as unknown as Service[]) || []);
      setAnnouncements((announcementsRes.data as Announcement[]) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const quickActions = [
    { icon: FileText, label: t(language, 'quickActions.findService'), to: '/services', color: 'text-primary-600 bg-primary-50' },
    { icon: Bot, label: t(language, 'quickActions.askAi'), to: '/ai-help', color: 'text-accent-600 bg-accent-50' },
    { icon: CheckCircle2, label: t(language, 'quickActions.checkEligibility'), to: '/services', color: 'text-success-600 bg-success-50' },
    { icon: Search, label: t(language, 'quickActions.searchServices'), to: '/services', color: 'text-primary-600 bg-primary-50' },
  ];

  const whyUseItems = [
    { icon: Sparkles, title: t(language, 'whyUse.simple'), desc: t(language, 'whyUse.simpleDesc') },
    { icon: Globe2, title: t(language, 'whyUse.multilingual'), desc: t(language, 'whyUse.multilingualDesc') },
    { icon: LifeBuoy, title: t(language, 'whyUse.helpful'), desc: t(language, 'whyUse.helpfulDesc') },
    { icon: HandHeart, title: t(language, 'whyUse.accessible'), desc: t(language, 'whyUse.accessibleDesc') },
  ];

  const steps = [
    { num: 1, title: t(language, 'howItWorks.find'), desc: t(language, 'howItWorks.findDesc') },
    { num: 2, title: t(language, 'howItWorks.understand'), desc: t(language, 'howItWorks.understandDesc') },
    { num: 3, title: t(language, 'howItWorks.act'), desc: t(language, 'howItWorks.actDesc') },
  ];

  return (
    <div>
      {/* Announcement bar */}
      {announcements.length > 0 && (
        <div className="bg-primary-700 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="truncate">{getLocalizedField(announcements[0] as unknown as Record<string, unknown>, 'title', language)}</p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50/30 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1e3a8a 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-primary-700 bg-primary-100 rounded-full mb-4">
                {t(language, 'hero.badge')}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight mb-4">
                {t(language, 'hero.title')}
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
                {t(language, 'hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-colors shadow-sm"
                >
                  {t(language, 'hero.explore')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/ai-help"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-primary-700 bg-white border border-primary-200 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  <Bot className="h-5 w-5" />
                  {t(language, 'hero.askAi')}
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="hidden lg:flex justify-center animate-fade-in">
              <div className="relative">
                <div className="w-80 h-80 bg-white rounded-3xl shadow-elevated border border-neutral-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                        <HandHeart className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-xs text-neutral-400 mt-1">JanSetu</span>
                      </div>
                      <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center">
                        <FileText className="h-8 w-8 text-accent-600" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-700">Citizen &rarr; Government</p>
                      <p className="text-xs text-neutral-400 mt-1">Services made simple</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">{t(language, 'quickActions.title')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex flex-col items-start gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-card-hover hover:border-primary-200 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700 transition-colors">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">{t(language, 'services.popular')}</h2>
            <p className="text-sm text-neutral-500 mt-1">{t(language, 'services.subtitle')}</p>
          </div>
          <Link
            to="/services"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {t(language, 'services.viewDetails')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-100 rounded w-full mb-1.5" />
                    <div className="h-3 bg-neutral-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const cat = service.category as Category | null;
              const Icon = cat ? getIcon(cat.icon) : FileText;
              return (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="group flex flex-col p-5 bg-white border border-neutral-200 rounded-xl hover:shadow-card-hover hover:border-primary-200 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                        {getLocalizedField(service as unknown as Record<string, unknown>, 'name', language)}
                      </h3>
                      {cat && (
                        <span className="text-xs text-neutral-400">{getLocalizedField(cat as unknown as Record<string, unknown>, 'name', language)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3 flex-1">
                    {getLocalizedField(service as unknown as Record<string, unknown>, 'description', language)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                    {t(language, 'services.viewDetails')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">{t(language, 'howItWorks.title')}</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary-700 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use JanSetu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">{t(language, 'whyUse.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyUseItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI CTA */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t(language, 'ai.title')}</h2>
          <p className="text-primary-100 mb-6 max-w-xl mx-auto">{t(language, 'ai.subtitle')}</p>
          <Link
            to="/ai-help"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-primary-700 bg-white hover:bg-primary-50 rounded-xl transition-colors shadow-sm"
          >
            {t(language, 'hero.askAi')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trust Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start gap-3 p-4 bg-neutral-100 border border-neutral-200 rounded-xl">
          <Info className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-600">{t(language, 'trust.desc')}</p>
        </div>
      </section>
    </div>
  );
}
