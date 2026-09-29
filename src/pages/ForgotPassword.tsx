import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ForgotPassword() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t(language, 'auth.invalidEmail'));
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t(language, 'common.error'));
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
          <h1 className="text-2xl font-bold text-neutral-900">{t(language, 'auth.resetPassword')}</h1>
        </div>

        {success ? (
          <div className="space-y-4">
            <Alert variant="success">{t(language, 'auth.resetLinkSent')}</Alert>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(language, 'auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card space-y-4">
              <Input
                label={t(language, 'auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
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
                {t(language, 'auth.resetPassword')}
              </button>
            </form>
            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(language, 'auth.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
