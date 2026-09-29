import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';

export default function Privacy() {
  const { language } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t(language, 'privacy.title')}</h1>
        <p className="text-sm text-neutral-400">{t(language, 'privacy.lastUpdated')}</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-card space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Information We Collect</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu collects the following types of information:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
            <li>Account information: Your name and email address when you create an account.</li>
            <li>Profile preferences: Your preferred language setting.</li>
            <li>Service interactions: Services you save or bookmark.</li>
            <li>Contact submissions: Name, email, subject, and message when you use the contact or grievance forms.</li>
            <li>AI conversation history: Messages you send to the JanSetu AI assistant (only when logged in).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Why We Collect Information</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            We collect information to provide and improve our services, personalize your experience,
            respond to your inquiries, and maintain the security of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. How We Use Information</h2>
          <ul className="space-y-1.5 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
            <li>To display your saved services and profile preferences.</li>
            <li>To respond to your contact or grievance submissions.</li>
            <li>To maintain your AI conversation history for your reference.</li>
            <li>To improve our service listings and AI assistant responses.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. How Information Is Stored</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Your data is stored securely using Supabase (a PostgreSQL-based platform) with Row Level Security
            enabled. Your personal data is only accessible to you and authorized administrators.
            Passwords are hashed and managed by Supabase Auth.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Information Sharing</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu does not sell, trade, or rent your personal information to third parties.
            We do not share your data with any external organizations. Your information is used
            solely to provide and improve the JanSetu platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Contact Us</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            If you have questions about this Privacy Policy or your data, please use the
            Contact page to reach us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Independent Platform</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu is an independent citizen-service platform and is not affiliated with any
            government department. We do not claim any official government partnership or certification.
          </p>
        </section>
      </div>
    </div>
  );
}
