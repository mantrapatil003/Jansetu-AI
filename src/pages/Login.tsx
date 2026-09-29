import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function Login() {
  const { language, user, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  if (user && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t(language, 'auth.requiredField');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t(language, 'auth.invalidEmail');
    if (!password) e.password = t(language, 'auth.requiredField');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login')) {
          setAuthError(t(language, 'auth.invalidCredentials'));
        } else {
          setAuthError(error.message);
        }
      } else {
        navigate('/dashboard');
      }
    } catch {
      setAuthError(t(language, 'common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white">
              <path d="M3 18h2v-6H3v6zm4 0h2V8H7v10zm4 0h2v-8h-2v8zm4 0h2V5h-2v13zm4 0h2v-11h-2v11z" fill="currentColor"/>
              <path d="M2 20h20v2H2z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">{t(language, 'auth.welcome')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t(language, 'auth.subtitle')}</p>
        </div>

        {authError && (
          <div className="mb-4">
            <Alert variant="error">{authError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card space-y-4">
          <Input
            label={t(language, 'auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label={t(language, 'auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {t(language, 'auth.forgotPassword')}
            </Link>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {t(language, 'auth.login')}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-4">
          {t(language, 'auth.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            {t(language, 'auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}
