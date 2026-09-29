import { useAuth } from '@/lib/auth';
import { LANGUAGES } from '@/lib/i18n';
import type { Language } from '@/types';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        {!compact && <span>{current.nativeLabel}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-neutral-200 rounded-lg shadow-elevated z-50 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as Language);
                setOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                lang.code === language
                  ? 'text-primary-700 bg-primary-50 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{lang.nativeLabel}</span>
              {lang.code === language && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
