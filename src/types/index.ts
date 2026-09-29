export type UserRole = 'citizen' | 'admin';
export type Language = 'en' | 'hi' | 'mr';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_hi: string | null;
  name_mr: string | null;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  name_hi: string | null;
  name_mr: string | null;
  description: string | null;
  description_hi: string | null;
  description_mr: string | null;
  eligibility: string | null;
  eligibility_hi: string | null;
  eligibility_mr: string | null;
  required_documents: string | null;
  required_documents_hi: string | null;
  required_documents_mr: string | null;
  procedure: string | null;
  procedure_hi: string | null;
  procedure_mr: string | null;
  official_link: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface SavedService {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
  service?: Service | null;
}

export interface Grievance {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  title_hi: string | null;
  title_mr: string | null;
  content: string | null;
  content_hi: string | null;
  content_mr: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ServiceWithCategory extends Service {
  category?: Category | null;
}
