import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Tag,
  Megaphone,
  Users,
  LifeBuoy,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t, getLocalizedField } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Service, Category, Grievance, Announcement } from '@/types';
import { getIcon } from '@/lib/icons';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/ui/States';
import Modal from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';

type Tab = 'overview' | 'services' | 'categories' | 'announcements' | 'grievances';

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const { language } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category_id: '',
    eligibility: '',
    required_documents: '',
    procedure: '',
    official_link: '',
    is_published: true,
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setDataLoading(true);
    const [servicesRes, categoriesRes, grievancesRes, announcementsRes, usersRes] = await Promise.all([
      supabase.from('services').select('*, category:categories(*)').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('grievances').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    setServices((servicesRes.data as unknown as Service[]) || []);
    setCategories((categoriesRes.data as Category[]) || []);
    setGrievances((grievancesRes.data as Grievance[]) || []);
    setAnnouncements((announcementsRes.data as Announcement[]) || []);
    setUserCount(usersRes.count || 0);
    setDataLoading(false);
  }

  const pendingGrievances = grievances.filter((g) => g.status === 'pending').length;

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: t(language, 'admin.dashboard'), icon: LayoutDashboard },
    { key: 'services', label: t(language, 'admin.services'), icon: FileText },
    { key: 'categories', label: t(language, 'admin.categories'), icon: Tag },
    { key: 'announcements', label: t(language, 'admin.announcements'), icon: Megaphone },
    { key: 'grievances', label: t(language, 'admin.grievances'), icon: LifeBuoy },
  ];

  const stats = [
    { label: t(language, 'admin.totalServices'), value: services.length, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { label: t(language, 'admin.totalCategories'), value: categories.length, icon: Tag, color: 'text-accent-600 bg-accent-50' },
    { label: t(language, 'admin.totalGrievances'), value: pendingGrievances, icon: LifeBuoy, color: 'text-warning-600 bg-warning-50' },
    { label: t(language, 'admin.totalUsers'), value: userCount, icon: Users, color: 'text-success-600 bg-success-50' },
  ];

  function openAddService() {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
      eligibility: '',
      required_documents: '',
      procedure: '',
      official_link: '',
      is_published: true,
    });
    setModalOpen(true);
  }

  function openEditService(s: Service) {
    setEditingService(s);
    setServiceForm({
      name: s.name,
      description: s.description || '',
      category_id: s.category_id || '',
      eligibility: s.eligibility || '',
      required_documents: s.required_documents || '',
      procedure: s.procedure || '',
      official_link: s.official_link || '',
      is_published: s.is_published,
    });
    setModalOpen(true);
  }

  async function saveService() {
    if (!serviceForm.name.trim()) return;
    if (editingService) {
      await supabase.from('services').update({
        name: serviceForm.name,
        description: serviceForm.description,
        category_id: serviceForm.category_id || null,
        eligibility: serviceForm.eligibility,
        required_documents: serviceForm.required_documents,
        procedure: serviceForm.procedure,
        official_link: serviceForm.official_link,
        is_published: serviceForm.is_published,
      }).eq('id', editingService.id);
    } else {
      await supabase.from('services').insert({
        name: serviceForm.name,
        description: serviceForm.description,
        category_id: serviceForm.category_id || null,
        eligibility: serviceForm.eligibility,
        required_documents: serviceForm.required_documents,
        procedure: serviceForm.procedure,
        official_link: serviceForm.official_link,
        is_published: serviceForm.is_published,
      });
    }
    setModalOpen(false);
    fetchAllData();
  }

  async function deleteService(id: string) {
    if (!confirm(t(language, 'admin.confirmDelete'))) return;
    await supabase.from('services').delete().eq('id', id);
    fetchAllData();
  }

  async function updateGrievanceStatus(id: string, status: string) {
    await supabase.from('grievances').update({ status }).eq('id', id);
    fetchAllData();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm(t(language, 'admin.confirmDelete'))) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchAllData();
  }

  async function addAnnouncement() {
    const title = prompt('Announcement title:');
    if (!title) return;
    const content = prompt('Announcement content:') || '';
    await supabase.from('announcements').insert({ title, content, is_active: true });
    fetchAllData();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">{t(language, 'admin.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    tab === tabItem.key
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tabItem.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">{t(language, 'admin.services')}</h2>
                <button
                  onClick={openAddService}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t(language, 'admin.addService')}
                </button>
              </div>
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((s) => {
                    const cat = s.category as Category | null;
                    const Icon = cat ? getIcon(cat.icon) : getIcon(null);
                    return (
                      <div key={s.id} className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl p-4 shadow-card">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                            {getLocalizedField(s as unknown as Record<string, unknown>, 'name', language)}
                          </h3>
                          <p className="text-xs text-neutral-500 line-clamp-1">
                            {getLocalizedField(s as unknown as Record<string, unknown>, 'description', language)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditService(s)}
                            className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteService(s.id)}
                            className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'categories' && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t(language, 'admin.categories')}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const Icon = getIcon(cat.icon);
                  return (
                    <div key={cat.id} className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl p-4 shadow-card">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {getLocalizedField(cat as unknown as Record<string, unknown>, 'name', language)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'announcements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">{t(language, 'admin.announcements')}</h2>
                <button
                  onClick={addAnnouncement}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t(language, 'admin.addAnnouncement')}
                </button>
              </div>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 bg-white border border-neutral-200 rounded-xl p-4 shadow-card">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {getLocalizedField(a as unknown as Record<string, unknown>, 'title', language)}
                      </h3>
                      {a.content && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {getLocalizedField(a as unknown as Record<string, unknown>, 'content', language)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <EmptyState
                    icon={<Megaphone className="h-12 w-12" />}
                    title={t(language, 'admin.announcements')}
                  />
                )}
              </div>
            </div>
          )}

          {tab === 'grievances' && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">{t(language, 'admin.grievances')}</h2>
              {grievances.length === 0 ? (
                <EmptyState
                  icon={<LifeBuoy className="h-12 w-12" />}
                  title={t(language, 'admin.noGrievances')}
                />
              ) : (
                <div className="space-y-3">
                  {grievances.map((g) => (
                    <div key={g.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-card">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900">{g.subject}</h3>
                          <p className="text-xs text-neutral-500">{g.name} - {g.email}</p>
                        </div>
                        <select
                          value={g.status}
                          onChange={(e) => updateGrievanceStatus(g.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer ${
                            g.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                            g.status === 'reviewed' ? 'bg-primary-100 text-primary-700' :
                            'bg-success-100 text-success-700'
                          }`}
                        >
                          <option value="pending">{t(language, 'admin.statusPending')}</option>
                          <option value="reviewed">{t(language, 'admin.statusReviewed')}</option>
                          <option value="resolved">{t(language, 'admin.statusResolved')}</option>
                        </select>
                      </div>
                      <p className="text-sm text-neutral-600 mt-2">{g.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Service Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? t(language, 'admin.editService') : t(language, 'admin.addService')}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label={t(language, 'admin.serviceName')}
            value={serviceForm.name}
            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
          />
          <Select
            label={t(language, 'admin.serviceCategory')}
            value={serviceForm.category_id}
            onChange={(e) => setServiceForm({ ...serviceForm, category_id: e.target.value })}
          >
            <option value="">--</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Textarea
            label={t(language, 'admin.serviceDescription')}
            value={serviceForm.description}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            rows={3}
          />
          <Textarea
            label={t(language, 'serviceDetail.eligibility')}
            value={serviceForm.eligibility}
            onChange={(e) => setServiceForm({ ...serviceForm, eligibility: e.target.value })}
            rows={2}
          />
          <Textarea
            label={t(language, 'serviceDetail.requiredDocuments')}
            value={serviceForm.required_documents}
            onChange={(e) => setServiceForm({ ...serviceForm, required_documents: e.target.value })}
            rows={2}
          />
          <Textarea
            label={t(language, 'serviceDetail.howToApply')}
            value={serviceForm.procedure}
            onChange={(e) => setServiceForm({ ...serviceForm, procedure: e.target.value })}
            rows={3}
          />
          <Input
            label={t(language, 'serviceDetail.officialSource')}
            value={serviceForm.official_link}
            onChange={(e) => setServiceForm({ ...serviceForm, official_link: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={serviceForm.is_published}
              onChange={(e) => setServiceForm({ ...serviceForm, is_published: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            {t(language, 'admin.servicePublished')}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {t(language, 'admin.cancel')}
            </button>
            <button
              onClick={saveService}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
            >
              {t(language, 'admin.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
