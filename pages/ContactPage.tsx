import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const content = {
  en: {
    title: 'Get in Touch',
    subtitle:
      'We want to hear from you. Share your ideas, questions, or the ways we can support our community.',
    infoTitle: 'Our Information',
    infoDescription:
      'We are passionate about connecting with the Dominican community in Baltimore and surrounding areas.',
    infoFollow: 'Follow us on social media to learn about upcoming events and opportunities.',
    infoLabels: {
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
    },
    infoValues: {
      email: 'info@dominicanosunidos.org',
      phone: '+1 (410) 555-0123',
      location: 'Baltimore, Maryland',
    },
    form: {
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      topicLabel: 'Topic',
      topicPlaceholder: 'Select a topic',
      topics: [
        { value: 'volunteer', label: 'Volunteering' },
        { value: 'partnerships', label: 'Partnerships & Sponsorships' },
        { value: 'events', label: 'Cultural Events' },
        { value: 'support', label: 'Services & Support' },
        { value: 'other', label: 'Other' },
      ],
      messageLabel: 'Message',
      messagePlaceholder: 'Tell us how we can help…',
      submit: 'Send Message',
      disclaimer: 'By submitting this form, you agree to be contacted by Dominicanos Unidos Baltimore.',
    },
  },
  es: {
    title: 'Ponte en Contacto',
    subtitle:
      'Queremos escuchar de ti. Comparte tus ideas, preguntas o formas en las que podemos apoyar a nuestra comunidad.',
    infoTitle: 'Nuestra Información',
    infoDescription:
      'Nos apasiona conectar con la comunidad dominicana en Baltimore y sus alrededores.',
    infoFollow: 'Síguenos en nuestras redes sociales para conocer eventos y oportunidades.',
    infoLabels: {
      email: 'Correo',
      phone: 'Teléfono',
      location: 'Ubicación',
    },
    infoValues: {
      email: 'info@dominicanosunidos.org',
      phone: '+1 (410) 555-0123',
      location: 'Baltimore, Maryland',
    },
    form: {
      nameLabel: 'Nombre Completo',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Correo Electrónico',
      emailPlaceholder: 'nombre@correo.com',
      topicLabel: 'Tema',
      topicPlaceholder: 'Selecciona un tema',
      topics: [
        { value: 'volunteer', label: 'Voluntariado' },
        { value: 'partnerships', label: 'Alianzas y Patrocinios' },
        { value: 'events', label: 'Eventos Culturales' },
        { value: 'support', label: 'Servicios y Ayuda' },
        { value: 'other', label: 'Otro' },
      ],
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Cuéntanos cómo podemos ayudarte...',
      submit: 'Enviar Mensaje',
      disclaimer: 'Al enviar este formulario, aceptas ser contactado por Dominicanos Unidos Baltimore.',
    },
  },
} as const;

const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const copy = content[language];

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
                <form className="space-y-6">
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
                      defaultValue=""
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
                      className="mt-3 block w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white placeholder-gray-500 focus:border-[#d6b209] focus:ring-2 focus:ring-[#d6b209]/60 transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center rounded-xl bg-[#ce1226] hover:bg-[#a70e1f] px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-[#ce1226]/40 transition"
                  >
                    {copy.form.submit}
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
    </div>
  );
};

export default ContactPage;

