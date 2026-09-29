import { useEffect, useState, useRef } from 'react';
import { Bot, Send, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';
import Alert from '@/components/ui/Alert';

const AI_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jansetu-ai`;

const SUGGESTED_PROMPTS = [
  'ai.prompt1',
  'ai.prompt2',
  'ai.prompt3',
  'ai.prompt4',
] as const;

export default function AIHelp() {
  const { language, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    async function loadHistory() {
      if (!user) {
        setLoadingHistory(false);
        return;
      }
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages(data as ChatMessage[]);
      }
      setLoadingHistory(false);
    }
    loadHistory();
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(false);
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user?.id || '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    if (user) {
      await supabase.from('ai_conversations').insert({
        user_id: user.id,
        role: 'user',
        content: text,
      });
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(AI_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, language }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Invalid response format');
      }

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: user?.id || '',
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (user) {
        await supabase.from('ai_conversations').insert({
          user_id: user.id,
          role: 'assistant',
          content: data.reply,
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{t(language, 'ai.title')}</h1>
            <p className="text-sm text-neutral-500">{t(language, 'ai.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden flex flex-col" style={{ height: '60vh', minHeight: '400px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-neutral-400">{t(language, 'common.loading')}</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
                <Bot className="h-7 w-7 text-primary-500" />
              </div>
              <p className="text-sm text-neutral-500 mb-4">{t(language, 'ai.welcome')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((promptKey) => (
                  <button
                    key={promptKey}
                    onClick={() => sendMessage(t(language, promptKey))}
                    className="text-left px-3 py-2 text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors"
                  >
                    {t(language, promptKey)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-primary-700'
                      : 'bg-primary-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-700 text-white rounded-tr-sm'
                      : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-100 flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-600" />
              </div>
              <div className="px-4 py-3 rounded-xl bg-neutral-100 rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center gap-2 text-sm text-error-600">
                <AlertCircle className="h-4 w-4" />
                {t(language, 'ai.error')}
              </div>
              <button
                onClick={() => sendMessage(messages[messages.length - 1]?.content || '')}
                className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {t(language, 'ai.retry')}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(language, 'ai.placeholder')}
              maxLength={500}
              className="flex-1 px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {t(language, 'ai.send')}
            </button>
          </form>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4">
        <Alert variant="warning">
          {t(language, 'ai.disclaimer')}
        </Alert>
      </div>
    </div>
  );
}
