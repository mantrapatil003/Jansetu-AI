import { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Input, Textarea } from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function Contact() {
  const { language, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t(language, 'auth.requiredField');
    if (!email.trim()) e.email = t(language, 'auth.requiredField');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t(language, 'auth.invalidEmail');
    if (!subject.trim()) e.subject = t(language, 'auth.requiredField');
    if (!message.trim()) e.message = t(language, 'auth.requiredField');
    else if (message.length > 1000) e.message = t(language, 'auth.requiredField');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(false);
    setSuccess(false);

    try {
      const { error } = await supabase.from('grievances').insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        user_id: user?.id || null,
      });

      if (error) throw error;
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t(language, 'contact.title')}</h1>
        <p className="text-neutral-500">{t(language, 'contact.subtitle')}</p>
      </div>

      {success && (
        <div className="mb-4">
          <Alert variant="success">{t(language, 'contact.success')}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert variant="error">{t(language, 'contact.error')}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card space-y-4">
        <Input
          label={t(language, 'contact.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label={t(language, 'contact.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label={t(language, 'contact.subject')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          required
        />
        <Textarea
          label={t(language, 'contact.message')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message}
          rows={5}
          maxLength={1000}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t(language, 'contact.sending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t(language, 'contact.submit')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
