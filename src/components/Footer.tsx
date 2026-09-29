import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';

export default function Footer() {
  const { language } = useAuth();
  const year = new Date().getFullYear();

  const links = [
    { to: '/services', label: t(language, 'footer.services') },
    { to: '/ai-help', label: t(language, 'footer.aiHelp') },
    { to: '/about', label: t(language, 'footer.about') },
    { to: '/contact', label: t(language, 'footer.contact') },
    { to: '/grievance', label: t(language, 'footer.grievance') },
    { to: '/privacy', label: t(language, 'footer.privacy') },
    { to: '/terms', label: t(language, 'footer.terms') },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                  <path d="M3 18h2v-6H3v6zm4 0h2V8H7v10zm4 0h2v-8h-2v8zm4 0h2V5h-2v13zm4 0h2v-11h-2v11z" fill="currentColor"/>
                  <path d="M2 20h20v2H2z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">JanSetu</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-xs">
              {t(language, 'footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-3">Notice</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t(language, 'footer.disclaimer')}
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-500">
            &copy; {year} JanSetu. {t(language, 'footer.rights')}
          </p>
          <p className="text-xs text-neutral-500">
            Independent Citizen-Service Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
