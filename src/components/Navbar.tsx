import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function Navbar() {
  const { user, profile, signOut, language } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: t(language, 'nav.home') },
    { to: '/services', label: t(language, 'nav.services') },
    { to: '/ai-help', label: t(language, 'nav.aiHelp') },
    { to: '/about', label: t(language, 'nav.about') },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm' : 'bg-white border-b border-neutral-200'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M3 18h2v-6H3v6zm4 0h2V8H7v10zm4 0h2v-8h-2v8zm4 0h2V5h-2v13zm4 0h2v-11h-2v11z" fill="currentColor"/>
                <path d="M2 20h20v2H2z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-neutral-900 leading-none">JanSetu</span>
              <span className="block text-[10px] text-neutral-500 leading-none mt-0.5">Citizen Services</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-700 hover:bg-accent-50 rounded-lg transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    {t(language, 'nav.admin')}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t(language, 'nav.dashboard')}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t(language, 'nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors shadow-sm"
              >
                {t(language, 'nav.login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3 animate-slide-up">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-neutral-200 mt-2 pt-2">
                {user ? (
                  <>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-accent-700 hover:bg-accent-50 rounded-lg"
                      >
                        <Shield className="h-4 w-4" />
                        {t(language, 'nav.admin')}
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t(language, 'nav.dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        navigate('/');
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      {t(language, 'nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg"
                  >
                    {t(language, 'nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
