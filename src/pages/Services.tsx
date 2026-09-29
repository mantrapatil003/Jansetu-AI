import { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { t, getLocalizedField } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Service, Category } from '@/types';
import { getIcon } from '@/lib/icons';
import { EmptyState } from '@/components/ui/States';

export default function Services() {
  const { language } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      const [servicesRes, categoriesRes] = await Promise.all([
        supabase
          .from('services')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      ]);
      setServices((servicesRes.data as unknown as Service[]) || []);
      setCategories((categoriesRes.data as Category[]) || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const name = getLocalizedField(s as unknown as Record<string, unknown>, 'name', language).toLowerCase();
      const desc = getLocalizedField(s as unknown as Record<string, unknown>, 'description', language).toLowerCase();
      const matchesSearch = !search ||
        name.includes(search.toLowerCase()) ||
        desc.includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || s.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t(language, 'services.title')}</h1>
        <p className="text-neutral-500">{t(language, 'services.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(language, 'services.searchPlaceholder')}
          className="w-full pl-11 pr-10 py-3 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-700 text-white'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
        >
          {t(language, 'services.allCategories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary-700 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {getLocalizedField(cat as unknown as Record<string, unknown>, 'name', language)}
          </button>
        ))}
      </div>

      {/* Results */}
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title={t(language, 'services.noResults')}
          description={t(language, 'services.tryAnother')}
          action={
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              {t(language, 'services.clearSearch')}
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const cat = service.category as Category | null;
            const Icon = cat ? getIcon(cat.icon) : getIcon(null);
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
                      <span className="text-xs text-neutral-400">
                        {getLocalizedField(cat as unknown as Record<string, unknown>, 'name', language)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 line-clamp-2 mb-3 flex-1">
                  {getLocalizedField(service as unknown as Record<string, unknown>, 'description', language)}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                  {t(language, 'services.viewDetails')}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
