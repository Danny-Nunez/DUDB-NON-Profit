import React, { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { pageDefaults } from '../lib/pageDefaults';
import { usePageContent } from '../hooks/usePageContent';

const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const defaultContent = pageDefaults.contact;
  const { content } = usePageContent('contact', defaultContent);
  const copy = content[language as keyof typeof defaultContent] as (typeof defaultContent)['en'];

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSubmitting = status === 'submitting';

  const buttonLabel = useMemo(() => {
    if (isSubmitting) {
      return copy.form.submitting ?? copy.form.submit;
    }
    return copy.form.submit;
  }, [copy.form.submit, copy.form.submitting, isSubmitting]);

  const resetForm = () => {
    setFormValues({ name: '', email: '', topic: '', message: '' });
  };

  const handleChange = (field: 'name' | 'email' | 'topic' | 'message') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!formValues.name || !formValues.email || !formValues.topic || !formValues.message) {
      setStatus('error');
      setErrorDetail(
        language === 'en'
          ? 'Please complete all fields before submitting the form.'
          : 'Por favor completa todos los campos antes de enviar el formulario.',
      );
      setToast({ type: 'error', message: copy.form.errorMessage });
      return;
    }

    setStatus('submitting');
    setErrorDetail(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formValues,
          language,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = body?.message as string | undefined;
        throw new Error(detail ?? 'Request failed');
      }

      setStatus('success');
      resetForm();
      setToast({ type: 'success', message: copy.form.successMessage });
    } catch (error) {
      console.error('Contact form submission failed', error);
      setStatus('error');
      if (error instanceof Error && error.message) {
        setErrorDetail(error.message);
      }
      setToast({ type: 'error', message: copy.form.errorMessage });
    }
  };

  React.useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="bg-black text-gray-100 min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#012d62]/40 via-black/60 to-black pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#d6b209] drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
              {copy.title}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm border border-[#012d62]/30 rounded-3xl shadow-2xl shadow-black/40">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative overflow-hidden rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl bg-gradient-to-br from-[#012d62] via-[#020817] to-[#0a1530]">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(214,178,9,0.4),_transparent_55%)]"></div>
                <div className="relative p-10 text-left lg:p-12">
                  <h2 className="text-2xl font-bold text-white">{copy.infoTitle}</h2>
                  <p className="mt-3 text-sm text-gray-200">{copy.infoDescription}</p>
                  <div className="mt-10 space-y-6 text-sm text-gray-100">
                    <div>
                      <p className="uppercase tracking-[0.35em] text-[#d6b209] text-xs">{copy.infoLabels.email}</p>
                      <p className="mt-1 text-base font-semibold">{copy.infoValues.email}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.35em] text-[#d6b209] text-xs">{copy.infoLabels.phone}</p>
                      <p className="mt-1 text-base font-semibold">{copy.infoValues.phone}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.35em] text-[#d6b209] text-xs">{copy.infoLabels.location}</p>
                      <p className="mt-1 text-base font-semibold">{copy.infoValues.location}</p>
                    </div>
                  </div>
                  <div className="mt-10 text-xs text-gray-200/80">{copy.infoFollow}</div>
                </div>
              </div>

              <div className="p-8 sm:p-10 md:p-12">
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-[#d6b209] uppercase tracking-[0.25em]"
                    >
                      {copy.form.nameLabel}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder={copy.form.namePlaceholder}
                      value={formValues.name}
                      onChange={handleChange('name')}
                      required
                      className="mt-3 block w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[#d6b209] uppercase tracking-[0.25em]"
                    >
                      {copy.form.emailLabel}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={copy.form.emailPlaceholder}
                      value={formValues.email}
                      onChange={handleChange('email')}
                      required
                      className="mt-3 block w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="topic"
                      className="block text-sm font-medium text-[#d6b209] uppercase tracking-[0.25em]"
                    >
                      {copy.form.topicLabel}
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      className="mt-3 block w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition"
                      value={formValues.topic}
                      onChange={handleChange('topic')}
                      required
                    >
                      <option value="" disabled>
                        {copy.form.topicPlaceholder}
                      </option>
                      {copy.form.topics.map((topic) => (
                        <option key={topic.value} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-[#d6b209] uppercase tracking-[0.25em]"
                    >
                      {copy.form.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder={copy.form.messagePlaceholder}
                      value={formValues.message}
                      onChange={handleChange('message')}
                      required
                      className="mt-3 block w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition resize-none"
                    ></textarea>
                  </div>

                  {status === 'success' && (
                    <div className="rounded-xl border border-[#1f3b64] bg-[#0d1625] px-4 py-3">
                      <p className="text-sm font-semibold text-[#d6b209]">{copy.form.successTitle}</p>
                      <p className="mt-1 text-sm text-gray-200">{copy.form.successMessage}</p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="rounded-xl border border-[#5b1d1f] bg-[#1e0b0c] px-4 py-3">
                      <p className="text-sm font-semibold text-[#f66]">{copy.form.errorTitle}</p>
                      <p className="mt-1 text-sm text-gray-200">
                        {errorDetail ?? copy.form.errorMessage}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center rounded-xl bg-[#ce1226] hover:bg-[#a70e1f] px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-[#ce1226]/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {buttonLabel}
                  </button>
                </form>
                <p className="mt-6 text-xs text-gray-500">
                  {copy.form.disclaimer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-40 rounded-xl px-5 py-3 shadow-xl border transition-opacity duration-300 ${
            toast.type === 'success'
              ? 'bg-[#13223e]/95 border-[#d6b209]/40 text-[#fef6cc]'
              : 'bg-[#3a1515]/95 border-[#ce1226]/40 text-[#ffdada]'
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ContactPage;

