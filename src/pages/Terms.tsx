import { FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';

export default function Terms() {
  const { language } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t(language, 'terms.title')}</h1>
        <p className="text-sm text-neutral-400">{t(language, 'terms.lastUpdated')}</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-card space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            By accessing and using JanSetu, you agree to be bound by these Terms and Conditions.
            If you do not agree with any part of these terms, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Service Description</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu is an independent citizen-service platform that helps users discover and understand
            government services in India. We provide information for assistance purposes only and
            do not process applications on behalf of any government department.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. User Accounts</h2>
          <ul className="space-y-1.5 text-sm text-neutral-600 leading-relaxed list-disc pl-5">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You may not use another person's account without authorization.</li>
            <li>JanSetu reserves the right to suspend accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. AI Assistant</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            The JanSetu AI assistant provides general information about government services.
            AI-generated responses may contain errors or outdated information. Always verify
            important information with official government sources before taking any action.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Limitation of Liability</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu is provided "as is" without warranties of any kind. We are not liable for any
            damages arising from the use of this platform or reliance on its information. Users are
            responsible for verifying all information with official sources.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Independent Platform</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu is an independent platform and is not affiliated with, endorsed by, or
            connected to any government department or agency. All government service names and
            links are provided for informational purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Changes to Terms</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            JanSetu reserves the right to update these Terms and Conditions at any time. Continued
            use of the platform after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
