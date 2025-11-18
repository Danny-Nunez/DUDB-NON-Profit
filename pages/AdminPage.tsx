import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { PageSlug } from '../lib/pageDefaults';
import { pageDefaults } from '../lib/pageDefaults';

type AdminTab = 'pages' | 'businesses' | 'events';

const DEFAULT_PAGE_SLUGS: PageSlug[] = ['home', 'about', 'donate', 'businesses', 'events', 'contact', 'footer'];

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  contact?: string;
  hours?: string;
  address?: string;
  createdAt: string;
}

interface BoardMemberCopy {
  name: string;
  role: string;
  description: string;
}

interface BoardMember {
  id: string;
  imageUrl: string;
  imageKey?: string;
  createdAt: string;
  en: BoardMemberCopy;
  es: BoardMemberCopy;
}

interface EventRecord {
  id: string;
  folder: string;
  content: {
    en?: { title?: string; description?: string; date?: string };
    es?: { title?: string; description?: string; date?: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

interface EventAsset {
  key: string;
  url: string;
}

type FormMode = 'create' | 'edit';

const labels = {
  en: {
    title: 'Admin Console',
    loginTitle: 'Administrator Login',
    username: 'Username',
    password: 'Password',
    login: 'Sign In',
    logout: 'Sign out',
    invalidLogin: 'Invalid credentials. Please try again.',
    loggedInAs: 'Logged in as',
    nav: {
      pages: 'Pages',
      businesses: 'Businesses',
      events: 'Events',
    },
    pages: {
      heading: 'Page Content',
      description:
        'Select a page to edit its bilingual content. Changes are saved as JSON and power the live site instantly.',
      selectLabel: 'Select a page',
      loadError: 'Unable to load page content.',
      saveSuccess: 'Page content saved.',
      saveError: 'Failed to save page content.',
      jsonInvalid: 'Content must be valid JSON.',
      useDefaults: 'Load defaults',
      lastUpdated: 'Last updated',
      helper: 'Update both English (en) and Spanish (es) objects to keep translations in sync.',
      saveButton: 'Save Page',
      slugLabels: {
        home: 'Home',
        about: 'About',
        donate: 'Donate',
        businesses: 'Businesses',
        events: 'Events',
        contact: 'Contact',
        footer: 'Footer',
      },
      boardMembers: {
        heading: 'Board Members',
        description:
          'Manage the leadership cards displayed on the About page. Upload portraits and provide bilingual bios for each director.',
        jsonNotice:
          'Board members are managed through the section below. Saving this page will automatically keep the latest board member updates.',
        loading: 'Loading board members…',
        empty: 'No board members yet.',
        listTitle: 'Current Members',
        formTitle: 'Member Details',
        addMember: 'Add member',
        createTitle: 'Add Board Member',
        editTitle: 'Edit Board Member',
        uploadLabel: 'Upload Portrait',
        uploadHint: 'Square PNG or JPG up to 5 MB works best.',
        uploading: 'Uploading portrait…',
        uploadSuccess: 'Portrait uploaded. Save to apply.',
        uploadError: 'We could not upload the portrait. Try again.',
        nameLabel: 'Name (English)',
        roleLabel: 'Role (English)',
        descriptionLabel: 'Bio (English)',
        nameEsLabel: 'Nombre (Español)',
        roleEsLabel: 'Cargo (Español)',
        descriptionEsLabel: 'Biografía (Español)',
        save: 'Save Member',
        cancel: 'Cancel',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this board member?',
        toastCreated: 'Board member added.',
        toastUpdated: 'Board member updated.',
        toastDeleted: 'Board member removed.',
        toastError: 'Something went wrong. Please try again.',
        previewAlt: 'Board member portrait preview',
        error: 'Unable to load board members. Please try again.',
      },
    },
    businesses: {
      heading: 'Business Directory',
      createNew: 'Add Business',
      name: 'Business Name',
      category: 'Category',
      description: 'Description',
      contact: 'Contact Information',
      hours: 'Hours',
      address: 'Address',
      uploadLabel: 'Upload Logo / Photo',
      uploadHint: 'PNG or JPG, up to 5MB.',
      uploading: 'Uploading image…',
      uploadSuccess: 'Image uploaded. Save to apply.',
      uploadError: 'We could not upload the image. Try again.',
      save: 'Save',
      cancel: 'Cancel editing',
      loading: 'Loading businesses…',
      error: 'Unable to load businesses. Please try again.',
      confirmDelete: 'Are you sure you want to delete this business? This cannot be undone.',
      delete: 'Delete',
      edit: 'Edit',
      noBusinesses: 'No businesses have been added yet.',
      showDirectory: 'Show directory list',
      hideDirectory: 'Hide directory list',
      toastSaved: 'Business saved successfully.',
      toastDeleted: 'Business deleted.',
      toastError: 'Something went wrong. Please try again.',
    },
    events: {
      heading: 'Events & Galleries',
      intro:
        'Manage event metadata that appears on the public Events page. Upload images directly to the matching S3 folder.',
      createNew: 'Add Event',
      save: 'Save Event',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this event?',
      folder: 'S3 Folder Name',
      folderHelper: 'Only letters, numbers, dashes, and spaces. This becomes the folder under events/.',
      titleEn: 'Title (English)',
      titleEs: 'Title (Spanish)',
      descriptionEn: 'Description (English)',
      descriptionEs: 'Description (Spanish)',
      dateEn: 'Date (English)',
      dateEs: 'Date (Spanish)',
      contentHelper: 'Leave fields blank if not needed. Descriptions support full sentences.',
      uploadLabel: 'Upload Media',
      uploadHint: 'Images or videos (up to 50 MB).',
      uploading: 'Uploading media…',
      uploadSuccess: 'Media uploaded. Refreshing…',
      uploadError: 'We could not upload the media. Try again.',
      deleteMedia: 'Delete',
      deletingMedia: 'Deleting media…',
      deleteMediaSuccess: 'Media deleted.',
      deleteMediaError: 'We could not delete the media. Try again.',
      deleteMediaConfirm: 'Delete this file?',
      loading: 'Loading events…',
      error: 'Unable to load events. Please try again later.',
      noEvents: 'No events created yet.',
      saveSuccess: 'Event saved.',
      deleteSuccess: 'Event deleted.',
      edit: 'Edit',
      toastEventSaved: 'Event saved successfully.',
      toastEventDeleted: 'Event deleted.',
      toastUploadSuccess: 'Media uploaded.',
      toastDeleteSuccess: 'Media deleted.',
      toastEventError: 'Something went wrong. Please try again.',
      fileLabel: 'File',
      showDirectory: 'Show event directory',
      hideDirectory: 'Hide event directory',
    },
  },
  es: {
    title: 'Consola Administrativa',
    loginTitle: 'Inicio de Sesión',
    username: 'Usuario',
    password: 'Contraseña',
    login: 'Ingresar',
    logout: 'Cerrar sesión',
    invalidLogin: 'Credenciales inválidas. Inténtalo nuevamente.',
    loggedInAs: 'Sesión iniciada como',
    nav: {
      pages: 'Páginas',
      businesses: 'Negocios',
      events: 'Eventos',
    },
    pages: {
      heading: 'Contenido de Páginas',
      description:
        'Selecciona una página para editar su contenido bilingüe. Los cambios se guardan en JSON y se reflejan al instante.',
      selectLabel: 'Selecciona una página',
      loadError: 'No pudimos cargar el contenido de la página.',
      saveSuccess: 'Contenido guardado.',
      saveError: 'No se pudo guardar el contenido.',
      jsonInvalid: 'El contenido debe ser JSON válido.',
      useDefaults: 'Cargar valores predeterminados',
      lastUpdated: 'Última actualización',
      helper: 'Actualiza los objetos en inglés (en) y español (es) para mantener las traducciones sincronizadas.',
      saveButton: 'Guardar Página',
      slugLabels: {
        home: 'Inicio',
        about: 'Sobre Nosotros',
        donate: 'Donar',
        businesses: 'Negocios',
        events: 'Eventos',
        contact: 'Contacto',
        footer: 'Pie de página',
      },
      boardMembers: {
        heading: 'Junta Directiva',
        description:
          'Administra las tarjetas de liderazgo que aparecen en la página Sobre Nosotros. Sube retratos y escribe biografías en ambos idiomas para cada director.',
        jsonNotice:
          'La junta se gestiona en la sección inferior. Al guardar la página se mantendrán automáticamente los últimos cambios en la junta.',
        loading: 'Cargando miembros de la junta…',
        empty: 'Aún no hay miembros agregados.',
        listTitle: 'Miembros Actuales',
        formTitle: 'Detalles del Miembro',
        addMember: 'Agregar miembro',
        createTitle: 'Agregar Miembro de la Junta',
        editTitle: 'Editar Miembro de la Junta',
        uploadLabel: 'Subir Retrato',
        uploadHint: 'PNG o JPG cuadrado de hasta 5 MB funciona mejor.',
        uploading: 'Subiendo retrato…',
        uploadSuccess: 'Retrato cargado. Guarda para aplicar.',
        uploadError: 'No pudimos subir el retrato. Inténtalo nuevamente.',
        nameLabel: 'Nombre (Inglés)',
        roleLabel: 'Cargo (Inglés)',
        descriptionLabel: 'Biografía (Inglés)',
        nameEsLabel: 'Nombre (Español)',
        roleEsLabel: 'Cargo (Español)',
        descriptionEsLabel: 'Biografía (Español)',
        save: 'Guardar Miembro',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        confirmDelete: '¿Seguro que deseas eliminar a este miembro de la junta?',
        toastCreated: 'Miembro agregado.',
        toastUpdated: 'Miembro actualizado.',
        toastDeleted: 'Miembro eliminado.',
        toastError: 'Algo salió mal. Inténtalo nuevamente.',
        previewAlt: 'Vista previa del retrato del miembro de la junta',
        error: 'No pudimos cargar los miembros de la junta. Inténtalo nuevamente.',
      },
    },
    businesses: {
      heading: 'Directorio de Negocios',
      createNew: 'Agregar Negocio',
      name: 'Nombre del Negocio',
      category: 'Categoría',
      description: 'Descripción',
      contact: 'Información de Contacto',
      hours: 'Horario',
      address: 'Dirección',
      uploadLabel: 'Subir Logo / Foto',
      uploadHint: 'PNG o JPG, hasta 5MB.',
      uploading: 'Subiendo imagen…',
      uploadSuccess: 'Imagen cargada. Guarda para aplicar.',
      uploadError: 'No pudimos subir la imagen. Inténtalo nuevamente.',
      save: 'Guardar',
      cancel: 'Cancelar edición',
      loading: 'Cargando negocios…',
      error: 'No pudimos cargar los negocios. Inténtalo de nuevo.',
      confirmDelete: '¿Seguro que deseas eliminar este negocio? Esta acción no se puede deshacer.',
      delete: 'Eliminar',
      edit: 'Editar',
      noBusinesses: 'Aún no se han agregado negocios.',
      showDirectory: 'Mostrar lista del directorio',
      hideDirectory: 'Ocultar lista del directorio',
      toastSaved: 'Negocio guardado correctamente.',
      toastDeleted: 'Negocio eliminado.',
      toastError: 'Algo salió mal. Inténtalo nuevamente.',
    },
    events: {
      heading: 'Eventos y Galerías',
      intro:
        'Administra la información de los eventos que aparece en la página pública. Sube las imágenes directamente a la carpeta S3 indicada.',
      createNew: 'Agregar Evento',
      save: 'Guardar Evento',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      confirmDelete: '¿Deseas eliminar este evento?',
      folder: 'Nombre de la carpeta S3',
      folderHelper: 'Debe coincidir con una carpeta en tu bucket S3 (ej. "Merengue Party FEB 2025").',
      titleEn: 'Título (Inglés)',
      titleEs: 'Título (Español)',
      descriptionEn: 'Descripción (Inglés)',
      descriptionEs: 'Descripción (Español)',
      dateEn: 'Fecha (Inglés)',
      dateEs: 'Fecha (Español)',
      contentHelper: 'Deja campos vacíos si no son necesarios. Las descripciones admiten párrafos completos.',
      uploadLabel: 'Subir Media',
      uploadHint: 'Imágenes o videos (hasta 50 MB).',
      uploading: 'Subiendo media…',
      uploadSuccess: 'Contenido subido. Actualizando…',
      uploadError: 'No pudimos subir ese archivo. Inténtalo nuevamente con otro.',
      deleteMedia: 'Eliminar',
      deletingMedia: 'Eliminando media…',
      deleteMediaSuccess: 'Contenido eliminado.',
      deleteMediaError: 'No pudimos eliminar este archivo. Inténtalo nuevamente.',
      deleteMediaConfirm: '¿Eliminar este archivo?',
      loading: 'Cargando eventos…',
      error: 'No pudimos cargar los eventos. Inténtalo nuevamente más tarde.',
      noEvents: 'Aún no hay eventos creados.',
      saveSuccess: 'Evento guardado.',
      deleteSuccess: 'Evento eliminado.',
      edit: 'Editar',
      toastEventSaved: 'Evento guardado correctamente.',
      toastEventDeleted: 'Evento eliminado.',
      toastUploadSuccess: 'Contenido subido.',
      toastDeleteSuccess: 'Contenido eliminado.',
      toastEventError: 'Algo salió mal. Inténtalo nuevamente.',
      fileLabel: 'Archivo',
      showDirectory: 'Mostrar directorio de eventos',
      hideDirectory: 'Ocultar directorio de eventos',
    },
  },
} as const;

const ADMIN_TOKEN_KEY = 'adminAuthToken';

const useAutoDismissToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return { toast, setToast };
};

const AdminPage: React.FC = () => {
  const { language } = useLanguage();
  const l10n = labels[language];
  const [activeTab, setActiveTab] = useState<AdminTab>('pages');

  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(ADMIN_TOKEN_KEY));
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.trim(), password: passwordInput }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { token: sessionToken } = (await response.json()) as { token: string };
      sessionStorage.setItem(ADMIN_TOKEN_KEY, sessionToken);
      setToken(sessionToken);
      setUsernameInput('');
      setPasswordInput('');
    } catch (error) {
      console.error(error);
      setLoginError(l10n.invalidLogin);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-[#012d62]/30">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">{l10n.loginTitle}</h1>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
                {l10n.username}
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(event) => setUsernameInput(event.target.value)}
                className="w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
                {l10n.password}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60"
              />
            </div>
            {loginError && <p className="text-sm text-[#ce1226]">{loginError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#d6b209] text-black font-semibold py-3 hover:bg-[#b79807] transition"
            >
              {l10n.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const commonProps = {
    language,
    authHeaders,
    onUnauthorized: handleLogout,
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{l10n.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {l10n.loggedInAs}:{' '}
              <span className="font-semibold text-gray-300">{sessionStorage.getItem(ADMIN_TOKEN_KEY) ? 'admin' : ''}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex rounded-2xl border border-[#012d62]/40 overflow-hidden">
              {(['pages', 'businesses', 'events'] as AdminTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? 'bg-[#d6b209] text-black'
                      : 'bg-transparent text-gray-300 hover:bg-[#012d62]/40'
                  }`}
                >
                  {l10n.nav[tab]}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-[#d6b209] hover:text-[#b79807] transition"
            >
              {l10n.logout}
            </button>
          </div>
        </div>

        {activeTab === 'pages' && <PagesPanel {...commonProps} labels={l10n.pages} />}
        {activeTab === 'businesses' && <BusinessesPanel {...commonProps} labels={l10n.businesses} />}
        {activeTab === 'events' && <EventsPanel {...commonProps} labels={l10n.events} />}
      </div>
    </div>
  );
};

interface CommonProps {
  language: 'en' | 'es';
  authHeaders: Record<string, string | undefined>;
  onUnauthorized: () => void;
}

interface PagesPanelProps extends CommonProps {
  labels: (typeof labels)['en']['pages'];
}

const PagesPanel: React.FC<PagesPanelProps> = ({ language, authHeaders, onUnauthorized, labels }) => {
  const [availableSlugs, setAvailableSlugs] = useState<PageSlug[]>(DEFAULT_PAGE_SLUGS);
  const [selectedSlug, setSelectedSlug] = useState<PageSlug>('home');
  const [editorValue, setEditorValue] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAboutPage = selectedSlug === 'about';

  const toEditorString = useCallback(
    (slug: PageSlug, raw: unknown) => {
      const fallback = pageDefaults[slug];
      const clone = JSON.parse(JSON.stringify(raw ?? fallback));
      if (slug === 'about' && clone && typeof clone === 'object') {
        if (clone.en && typeof clone.en === 'object' && 'boardMembers' in clone.en) {
          delete clone.en.boardMembers;
        }
        if (clone.es && typeof clone.es === 'object' && 'boardMembers' in clone.es) {
          delete clone.es.boardMembers;
        }
      }
      return JSON.stringify(clone, null, 2);
    },
    [],
  );

  const loadSlugs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load slugs');
      }
      const data = (await response.json()) as { slugs: string[] };
      const merged = Array.from(new Set([...DEFAULT_PAGE_SLUGS, ...(data.slugs as PageSlug[])]));
      setAvailableSlugs(merged as PageSlug[]);
    } catch (error) {
      console.error(error);
    }
  }, [authHeaders, onUnauthorized]);

  const loadPage = useCallback(
    async (slug: PageSlug) => {
      setIsLoading(true);
      setStatusMessage(null);
      setErrorMessage(null);
      try {
        const response = await fetch(`/api/admin/pages?slug=${encodeURIComponent(slug)}`, {
          headers: authHeaders,
        });
        if (response.status === 401) {
          onUnauthorized();
          return;
        }
        if (response.status === 404) {
          const defaults = pageDefaults[slug];
          setEditorValue(toEditorString(slug, defaults));
          setUpdatedAt(null);
          setIsLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error(labels.loadError);
        }
        const data = (await response.json()) as { content: unknown; updatedAt?: string };
        setEditorValue(toEditorString(slug, data.content ?? pageDefaults[slug]));
        setUpdatedAt(data.updatedAt ?? null);
      } catch (error) {
        console.error(error);
        setErrorMessage(labels.loadError);
        setEditorValue(toEditorString(slug, pageDefaults[slug]));
        setUpdatedAt(null);
      } finally {
        setIsLoading(false);
      }
    },
    [authHeaders, labels.loadError, onUnauthorized, toEditorString],
  );

  useEffect(() => {
    loadSlugs();
  }, [loadSlugs]);

  useEffect(() => {
    loadPage(selectedSlug);
  }, [loadPage, selectedSlug]);

  const handleSave = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(editorValue);
      if (isAboutPage) {
        try {
          const boardResponse = await fetch('/api/admin/board-members', {
            headers: authHeaders,
          });
          if (boardResponse.status === 401) {
            onUnauthorized();
            return;
          }
          if (boardResponse.ok) {
            const data = (await boardResponse.json()) as { members: BoardMember[] };
            const members = data.members ?? [];
            const aboutContent = parsed as Record<string, unknown>;
            const ensureLanguage = (locale: 'en' | 'es') => {
              const current = aboutContent[locale];
              if (!current || typeof current !== 'object') {
                // eslint-disable-next-line no-param-reassign
                aboutContent[locale] = {};
              }
              return aboutContent[locale] as Record<string, unknown>;
            };
            const mapMembers = (locale: 'en' | 'es') =>
              members.map((member) => ({
                id: member.id,
                name: member[locale].name,
                role: member[locale].role,
                description: member[locale].description,
                imageUrl: member.imageUrl,
                imageKey: member.imageKey ?? '',
                createdAt: member.createdAt,
              }));
            const enContent = ensureLanguage('en');
            const esContent = ensureLanguage('es');
            enContent.boardMembers = mapMembers('en');
            esContent.boardMembers = mapMembers('es');
          }
        } catch (boardError) {
          console.error('Failed to sync board members before saving', boardError);
        }
      }
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ slug: selectedSlug, content: parsed }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(labels.saveError);
      }
      const data = (await response.json()) as { updatedAt?: string };
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setStatusMessage(labels.saveSuccess);
    } catch (error) {
      console.error(error);
      if (error instanceof SyntaxError) {
        setErrorMessage(labels.jsonInvalid);
      } else {
        setErrorMessage(labels.saveError);
      }
    }
  };

  return (
    <section className="bg-gray-900/70 border border-[#012d62]/30 rounded-2xl shadow-xl p-6 space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white">{labels.heading}</h2>
        <p className="text-sm text-gray-400">{labels.description}</p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] gap-2">
          {labels.selectLabel}
          <select
            value={selectedSlug}
            onChange={(event) => setSelectedSlug(event.target.value as PageSlug)}
            className="rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60"
          >
            {availableSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {labels.slugLabels[slug] ?? slug}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setEditorValue(toEditorString(selectedSlug, pageDefaults[selectedSlug]))}
          className="self-start rounded-xl border border-[#d6b209]/50 px-4 py-2 text-sm font-semibold text-[#d6b209] hover:bg-[#d6b209]/10 transition"
        >
          {labels.useDefaults}
        </button>
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.helper}</p>
      {isAboutPage && (
        <p className="mt-2 text-xs text-[#d6b209]">{labels.boardMembers.jsonNotice}</p>
      )}

      <textarea
        value={editorValue}
        onChange={(event) => setEditorValue(event.target.value)}
        rows={24}
        className="w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-sm font-mono text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-[#d6b209] text-black font-semibold px-6 py-3 hover:bg-[#b79807] transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (language === 'en' ? 'Saving…' : 'Guardando…') : labels.saveButton}
        </button>
        <div className="text-sm text-gray-500">
          {updatedAt && (
            <span>
              {labels.lastUpdated}:{' '}
              {new Date(updatedAt).toLocaleString(language === 'en' ? 'en-US' : 'es-DO')}
            </span>
          )}
        </div>
      </div>

      {isAboutPage && (
        <BoardMembersManager
          language={language}
          authHeaders={authHeaders}
          onUnauthorized={onUnauthorized}
          labels={labels.boardMembers}
          onAfterChange={() => loadPage('about')}
        />
      )}

      {statusMessage && <p className="text-sm text-[#6bc46d]">{statusMessage}</p>}
      {errorMessage && <p className="text-sm text-[#ce1226]">{errorMessage}</p>}
    </section>
  );
};

interface BusinessesPanelProps extends CommonProps {
  labels: (typeof labels)['en']['businesses'];
}

const BusinessesPanel: React.FC<BusinessesPanelProps> = ({ language, authHeaders, onUnauthorized, labels }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    imageKey: '',
    contact: '',
    hours: '',
    address: '',
  });
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDirectoryVisible, setIsDirectoryVisible] = useState<boolean>(false);
  const { toast, setToast } = useAutoDismissToast();

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'GET',
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load businesses');
      }
      const data = (await response.json()) as { businesses: Business[] };
      setBusinesses(data.businesses);
    } catch (err) {
      console.error(err);
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, labels.error, onUnauthorized]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const startCreate = () => {
    setFormMode('create');
    setEditingBusiness(null);
    setFormValues({
      name: '',
      category: '',
      description: '',
      imageUrl: '',
      imageKey: '',
      contact: '',
      hours: '',
      address: '',
    });
    setUploadingImage(false);
    setUploadStatus('idle');
    setUploadError(null);
  };

  const startEdit = (business: Business) => {
    setFormMode('edit');
    setEditingBusiness(business);
    setFormValues({
      name: business.name,
      category: business.category,
      description: business.description,
      imageUrl: business.imageUrl,
      imageKey: business.imageKey ?? '',
      contact: business.contact ?? '',
      hours: business.hours ?? '',
      address: business.address ?? '',
    });
    setUploadingImage(false);
    setUploadStatus('idle');
    setUploadError(null);
    setIsDirectoryVisible(false);
  };

  const submitBusiness = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploadingImage) {
      alert(language === 'en' ? 'Please wait for the image upload to finish.' : 'Espera a que termine la carga de la imagen.');
      return;
    }
    const payload: Record<string, unknown> = { ...formValues };
    if (!payload.imageUrl) {
      delete payload.imageUrl;
    }
    if (!payload.imageKey) {
      delete payload.imageKey;
    }
    if (!payload.contact) {
      delete payload.contact;
    }
    if (!payload.hours) {
      delete payload.hours;
    }
    if (!payload.address) {
      delete payload.address;
    }
    const isEdit = formMode === 'edit' && editingBusiness;
    try {
      const response = await fetch('/api/admin/businesses', {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(isEdit ? { id: editingBusiness?.id, ...payload } : payload),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to save business');
      }
      await fetchBusinesses();
      startCreate();
      setToast({ message: labels.toastSaved, type: 'success' });
    } catch (err) {
      console.error(err);
      alert(labels.error);
      setToast({ message: labels.toastError, type: 'error' });
    }
  };

  const deleteBusiness = async (business: Business) => {
    if (!window.confirm(labels.confirmDelete)) return;
    try {
      const response = await fetch(`/api/admin/businesses?id=${encodeURIComponent(business.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete business');
      }
      await fetchBusinesses();
      setToast({ message: labels.toastDeleted, type: 'success' });
    } catch (err) {
      console.error(err);
      alert(labels.error);
      setToast({ message: labels.toastError, type: 'error' });
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError(null);
    setUploadStatus('idle');
    try {
      const response = await fetch('/api/admin/businesses?action=upload', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to generate upload URL');
      }
      const data = (await response.json()) as { uploadUrl: string; objectUrl: string; key: string };
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload object to S3');
      }
      setFormValues((state) => ({
        ...state,
        imageUrl: data.objectUrl,
        imageKey: data.key,
      }));
      setUploadStatus('success');
      setUploadError(null);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setUploadError(labels.uploadError);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploadStatus('idle');
    void handleImageUpload(file);
    input.value = '';
  };

  return (
    <section className="bg-gray-900/70 border border-[#012d62]/30 rounded-2xl shadow-xl p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white">{labels.heading}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setIsDirectoryVisible(false);
              startCreate();
            }}
            className={`rounded-xl px-4 py-2 font-semibold transition ${
              isDirectoryVisible
                ? 'bg-transparent border border-[#d6b209]/60 text-[#d6b209] hover:bg-[#d6b209]/10'
                : 'bg-[#d6b209] text-black hover:bg-[#b79807]'
            }`}
          >
            {labels.createNew}
          </button>
          <button
            type="button"
            onClick={() => setIsDirectoryVisible(true)}
            className={`rounded-xl px-4 py-2 font-semibold transition ${
              isDirectoryVisible
                ? 'bg-[#d6b209] text-black hover:bg-[#b79807]'
                : 'bg-transparent border border-[#d6b209]/60 text-[#d6b209] hover:bg-[#d6b209]/10'
            }`}
          >
            {isDirectoryVisible ? labels.hideDirectory : labels.showDirectory}
          </button>
        </div>
      </header>

      {!isDirectoryVisible && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitBusiness}>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
              {labels.uploadLabel}
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#d6b209] file:px-4 file:py-2 file:text-black file:font-semibold file:hover:bg-[#b79807] file:transition"
              />
              <span className="text-xs text-gray-500">{labels.uploadHint}</span>
              {uploadingImage && <span className="text-sm text-gray-400">{labels.uploading}</span>}
              {!uploadingImage && uploadStatus === 'success' && (
                <span className="text-sm text-[#6bc46d]">{labels.uploadSuccess}</span>
              )}
              {!uploadingImage && uploadStatus === 'error' && (
                <span className="text-sm text-[#ce1226]">{uploadError ?? labels.uploadError}</span>
              )}
            </div>
          </div>
          {formValues.imageUrl && (
            <div className="md:col-span-2 flex items-center gap-4">
              <img
                src={formValues.imageUrl}
                alt="Business preview"
                className="h-16 w-16 rounded-lg border border-gray-700 object-cover"
              />
              <span className="text-xs text-gray-500 break-all">{formValues.imageUrl}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <LabeledInput
              label={labels.name}
              value={formValues.name}
              onChange={(value) => setFormValues((state) => ({ ...state, name: value }))}
              required
            />
            <LabeledInput
              label={labels.category}
              value={formValues.category}
              onChange={(value) => setFormValues((state) => ({ ...state, category: value }))}
              required
            />
            <LabeledInput
              label={labels.address}
              value={formValues.address}
              onChange={(value) => setFormValues((state) => ({ ...state, address: value }))}
            />
            <LabeledInput
              label={labels.contact}
              value={formValues.contact}
              onChange={(value) => setFormValues((state) => ({ ...state, contact: value }))}
            />
          </div>
          <LabeledTextArea
            label={labels.description}
            value={formValues.description}
            onChange={(value) => setFormValues((state) => ({ ...state, description: value }))}
            className="md:col-span-2"
          />
          <LabeledTextArea
            label={labels.hours}
            value={formValues.hours}
            onChange={(value) => setFormValues((state) => ({ ...state, hours: value }))}
            className="md:col-span-2"
          />
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={uploadingImage}
              className="rounded-xl bg-[#d6b209] text-black font-semibold px-6 py-3 hover:bg-[#b79807] transition disabled:opacity-50"
            >
              {labels.save}
            </button>
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-xl border border-gray-600 px-6 py-3 hover:bg-gray-800 transition"
              >
                {labels.cancel}
              </button>
            )}
          </div>
        </form>
      )}

      {isDirectoryVisible && (
        <>
          {loading && <p className="text-sm text-gray-400">{labels.loading}</p>}
          {error && <p className="text-sm text-[#ce1226]">{error}</p>}
          {!loading && !error && businesses.length === 0 && (
            <p className="text-sm text-gray-400">{labels.noBusinesses}</p>
          )}
          <div className="space-y-4">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-black/40 border border-gray-800 rounded-xl p-4 flex items-start gap-4"
              >
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-[#012d62] flex-shrink-0">
                  <img
                    src={business.imageUrl}
                    alt={business.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{business.name}</h3>
                    <p className="text-xs uppercase tracking-[0.35em] text-[#d6b209]">{business.category}</p>
                  </div>
                  {business.hours && (
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-white">{labels.hours}:</span> {business.hours}
                    </p>
                  )}
                  {business.description && (
                    <p className="text-sm text-gray-400 line-clamp-1">{business.description}</p>
                  )}
                  {business.address && (
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-white">{labels.address}:</span> {business.address}
                    </p>
                  )}
                  {business.contact && (
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-white">{labels.contact}:</span> {business.contact}
                    </p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => startEdit(business)}
                      className="text-sm rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 transition"
                    >
                      {labels.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBusiness(business)}
                      className="text-sm rounded-lg bg-[#ce1226] px-4 py-2 hover:bg-[#a70e1f] transition"
                    >
                      {labels.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 shadow-xl border ${
            toast.type === 'success'
              ? 'bg-[#13223e]/90 border-[#d6b209]/40 text-[#e8e0b3]'
              : 'bg-[#3a1515]/90 border-[#ce1226]/40 text-[#f6c0c0]'
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </section>
  );
};

interface EventFormState {
  folder: string;
  en: { title: string; description: string; date: string };
  es: { title: string; description: string; date: string };
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const emptyEventForm: EventFormState = {
  folder: '',
  en: { title: '', description: '', date: '' },
  es: { title: '', description: '', date: '' },
};

interface EventsPanelProps extends CommonProps {
  labels: (typeof labels)['en']['events'];
}

const EventsPanel: React.FC<EventsPanelProps> = ({ language, authHeaders, onUnauthorized, labels }) => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EventFormState>(emptyEventForm);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [assetsByEvent, setAssetsByEvent] = useState<Record<string, EventAsset[]>>({});
  const [eventUploadState, setEventUploadState] = useState<Record<string, { status: UploadStatus; error?: string }>>(
    {},
  );
  const [assetDeleteState, setAssetDeleteState] = useState<
    Record<string, { status: UploadStatus; error?: string }>
  >({});
  const [pendingDeletion, setPendingDeletion] = useState<{ eventId: string; assetKey: string } | null>(null);
  const [isDirectoryVisible, setIsDirectoryVisible] = useState<boolean>(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const { toast, setToast } = useAutoDismissToast();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/events', {
        method: 'GET',
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load events');
      }
      const data = (await response.json()) as { events: EventRecord[] };
      const metadataEvents = data.events ?? [];
      setEvents(metadataEvents);

      try {
        const publicResponse = await fetch('/api/events');
        if (publicResponse.ok) {
        const publicData = (await publicResponse.json()) as Array<{
          id?: string;
          folder: string;
          assets: EventAsset[];
        }>;
        const map: Record<string, EventAsset[]> = {};
        for (const entry of publicData) {
          const key = entry.id ?? entry.folder;
          map[key] = entry.assets ?? [];
          if (entry.id && entry.folder) {
            map[entry.folder] = entry.assets ?? [];
          }
        }
          setAssetsByEvent(map);
        }
      } catch (assetError) {
        console.error('Failed to load event assets', assetError);
      }
    } catch (err) {
      console.error(err);
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, labels.error, onUnauthorized]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setFormMode('create');
    setEditingId(null);
    setFormValues(emptyEventForm);
    setStatusMessage(null);
    setActiveEventId(null);
  };

  const startEdit = (event: EventRecord) => {
    setFormMode('edit');
    setEditingId(event.id);
    setIsDirectoryVisible(false);
    setActiveEventId(null);
    setFormValues({
      folder: event.folder,
      en: {
        title: event.content?.en?.title ?? '',
        description: event.content?.en?.description ?? '',
        date: event.content?.en?.date ?? '',
      },
      es: {
        title: event.content?.es?.title ?? '',
        description: event.content?.es?.description ?? '',
        date: event.content?.es?.date ?? '',
      },
    });
    setStatusMessage(null);
  };

  const sanitize = (value: string) => (value.trim() === '' ? undefined : value.trim());

  const buildPayload = () => ({
    folder: formValues.folder.trim(),
    content: {
      en: {
        title: sanitize(formValues.en.title),
        description: sanitize(formValues.en.description),
        date: sanitize(formValues.en.date),
      },
      es: {
        title: sanitize(formValues.es.title),
        description: sanitize(formValues.es.description),
        date: sanitize(formValues.es.date),
      },
    },
  });

  const submitEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.folder.trim()) {
      alert(labels.folderHelper);
      return;
    }
    setStatusMessage(null);
    try {
      const payload = buildPayload();
      const response = await fetch('/api/admin/events', {
        method: formMode === 'edit' ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(
          formMode === 'edit'
            ? { id: editingId, ...payload }
            : payload,
        ),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(labels.error);
      }
      const result = await response.json();
      const savedEventId = formMode === 'edit' ? editingId : (result?.event?.id as string | undefined);
      await fetchEvents();
      setStatusMessage(labels.saveSuccess);
      setToast({ message: labels.toastEventSaved, type: 'success' });
      resetForm();
      if (savedEventId && typeof savedEventId === 'string') {
        setActiveEventId(savedEventId);
      }
      setIsDirectoryVisible(true);
    } catch (err) {
      console.error(err);
      alert(labels.error);
      setToast({ message: labels.toastEventError, type: 'error' });
    }
  };

  const deleteEventHandler = async (eventRecord: EventRecord) => {
    if (!window.confirm(labels.confirmDelete)) return;
    try {
      const response = await fetch(`/api/admin/events?id=${encodeURIComponent(eventRecord.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error(labels.error);
      }
      await fetchEvents();
      setStatusMessage(labels.deleteSuccess);
      setToast({ message: labels.toastEventDeleted, type: 'success' });
      if (editingId === eventRecord.id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert(labels.error);
      setToast({ message: labels.toastEventError, type: 'error' });
    }
  };

  const handleEventFileChange = async (eventId: string, file?: File | null) => {
    if (!file) return;
    setEventUploadState((state) => ({
      ...state,
      [eventId]: { status: 'uploading' },
    }));
    try {
      const response = await fetch('/api/admin/events?action=upload', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ eventId, fileName: file.name, fileType: file.type }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to generate upload URL');
      }
      const data = (await response.json()) as { uploadUrl: string; objectUrl: string; key: string };
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3');
      }
      setEventUploadState((state) => ({
        ...state,
        [eventId]: { status: 'success' },
      }));
      await fetchEvents();
      setToast({ message: labels.toastUploadSuccess, type: 'success' });
      setTimeout(() => {
        setEventUploadState((state) => {
          const next = { ...state };
          delete next[eventId];
          return next;
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      setEventUploadState((state) => ({
        ...state,
        [eventId]: { status: 'error', error: labels.uploadError },
      }));
      setToast({ message: labels.toastEventError, type: 'error' });
    }
  };

  const handleEventAssetDelete = async (eventId: string, assetKey: string) => {
    const targetEvent = events.find((item) => item.id === eventId);
    if (!targetEvent) {
      setToast({ message: labels.toastEventError, type: 'error' });
      return;
    }
    const deleteKey = `${eventId}:${assetKey}`;
    setAssetDeleteState((state) => ({
      ...state,
      [deleteKey]: { status: 'uploading' },
    }));
    try {
      const response = await fetch('/api/admin/events?action=delete-asset', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ eventId, assetKey }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      setAssetsByEvent((state) => {
        const next = { ...state };
        const keys = [targetEvent.id, targetEvent.folder];
        keys.forEach((key) => {
          if (next[key]) {
            next[key] = next[key]!.filter((item) => item.key !== assetKey);
            if (next[key]!.length === 0) {
              delete next[key];
            }
          }
        });
        return next;
      });
      setEvents((state) =>
        state.map((item) =>
          item.id === targetEvent.id || item.folder === targetEvent.folder
            ? {
                ...item,
                assets: (item.assets ?? []).filter((existingAsset) => existingAsset.key !== assetKey),
              }
            : item,
        ),
      );
      setAssetDeleteState((state) => ({
        ...state,
        [deleteKey]: { status: 'success' },
      }));
      setToast({ message: labels.toastDeleteSuccess, type: 'success' });
      setTimeout(() => {
        setAssetDeleteState((state) => {
          const next = { ...state };
          delete next[deleteKey];
          return next;
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      setAssetDeleteState((state) => ({
        ...state,
        [deleteKey]: { status: 'error', error: labels.deleteMediaError },
      }));
      setToast({ message: labels.toastEventError, type: 'error' });
    }
  };

  const cancelPendingDeletion = () => setPendingDeletion(null);

  const confirmPendingDeletion = () => {
    if (!pendingDeletion) return;
    const { eventId, assetKey } = pendingDeletion;
    setPendingDeletion(null);
    void handleEventAssetDelete(eventId, assetKey);
  };

  useEffect(() => {
    if (isDirectoryVisible && activeEventId === null && events.length > 0) {
      setActiveEventId(events[0].id);
    }
  }, [isDirectoryVisible, activeEventId, events]);

  return (
    <section className="bg-gray-900/70 border border-[#012d62]/30 rounded-2xl shadow-xl p-6 space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">{labels.heading}</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                setIsDirectoryVisible(false);
                resetForm();
              }}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                isDirectoryVisible
                  ? 'bg-transparent border border-[#d6b209]/60 text-[#d6b209] hover:bg-[#d6b209]/10'
                  : 'bg-[#d6b209] text-black hover:bg-[#b79807]'
              }`}
            >
              {labels.createNew}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDirectoryVisible(true);
                if (events.length > 0) {
                  setActiveEventId((current) => current ?? events[0].id);
                }
              }}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                isDirectoryVisible
                  ? 'bg-[#d6b209] text-black hover:bg-[#b79807]'
                  : 'bg-transparent border border-[#d6b209]/60 text-[#d6b209] hover:bg-[#d6b209]/10'
              }`}
            >
              {isDirectoryVisible ? labels.hideDirectory : labels.showDirectory}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400">{labels.intro}</p>
      </header>

      {!isDirectoryVisible && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitEvent}>
          <LabeledInput
            label={labels.folder}
            value={formValues.folder}
            onChange={(value) => {
              if (formMode === 'edit') return;
              setFormValues((state) => ({ ...state, folder: value }));
            }}
            required
            helper={
              formMode === 'edit'
                ? language === 'en'
                  ? 'Folder names cannot be changed after creation. Delete and recreate the event to use a different folder.'
                  : 'El nombre de la carpeta no se puede cambiar después de crear el evento. Elimina y vuelve a crear el evento para usar otra carpeta.'
                : labels.folderHelper
            }
            className="md:col-span-2"
            disabled={formMode === 'edit'}
            readOnly={formMode === 'edit'}
          />

          <LabeledInput
            label={labels.titleEn}
            value={formValues.en.title}
            onChange={(value) => setFormValues((state) => ({ ...state, en: { ...state.en, title: value } }))}
          />
          <LabeledInput
            label={labels.titleEs}
            value={formValues.es.title}
            onChange={(value) => setFormValues((state) => ({ ...state, es: { ...state.es, title: value } }))}
          />

          <LabeledTextArea
            label={labels.descriptionEn}
            value={formValues.en.description}
            onChange={(value) => setFormValues((state) => ({ ...state, en: { ...state.en, description: value } }))}
          />
          <LabeledTextArea
            label={labels.descriptionEs}
            value={formValues.es.description}
            onChange={(value) => setFormValues((state) => ({ ...state, es: { ...state.es, description: value } }))}
          />

          <LabeledInput
            label={labels.dateEn}
            value={formValues.en.date}
            onChange={(value) => setFormValues((state) => ({ ...state, en: { ...state.en, date: value } }))}
          />
          <LabeledInput
            label={labels.dateEs}
            value={formValues.es.date}
            onChange={(value) => setFormValues((state) => ({ ...state, es: { ...state.es, date: value } }))}
          />

          <p className="md:col-span-2 text-xs uppercase tracking-[0.3em] text-gray-500">
            {labels.contentHelper}
          </p>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[#d6b209] text-black font-semibold px-6 py-3 hover:bg-[#b79807] transition"
            >
              {labels.save}
            </button>
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-600 px-6 py-3 hover:bg-gray-800 transition"
              >
                {labels.cancel}
              </button>
            )}
          </div>
        </form>
      )}

      {!isDirectoryVisible && statusMessage && <p className="text-sm text-[#6bc46d]">{statusMessage}</p>}

      {isDirectoryVisible && (
        <>
          {loading && <p className="text-sm text-gray-400">{labels.loading}</p>}
          {error && <p className="text-sm text-[#ce1226]">{error}</p>}
          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-gray-400">{labels.noEvents}</p>
          )}
        </>
      )}

      {isDirectoryVisible && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-3">
            {events.map((event) => {
              const localized = event.content?.[language];
              const isActive = activeEventId === event.id;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setActiveEventId(event.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition shadow-sm ${
                    isActive
                      ? 'border-[#d6b209]/70 bg-[#1a2235] text-white'
                      : 'border-gray-800 bg-black/40 text-gray-200 hover:border-[#d6b209]/50 hover:bg-black/60'
                  }`}
                >
                  <h3 className="text-base font-bold">{localized?.title ?? event.folder}</h3>
                  {localized?.date && (
                    <p className="text-xs text-[#d6b209] uppercase tracking-[0.35em] mt-1">{localized.date}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-2 font-mono">
                    {language === 'en' ? 'Media files:' : 'Archivos:'}{' '}
                    {assetsByEvent[event.id]?.length ?? assetsByEvent[event.folder]?.length ?? 0}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {events
              .filter((event) => event.id === activeEventId)
              .map((event) => {
                const localized = event.content?.[language];
                const assets = assetsByEvent[event.id] ?? assetsByEvent[event.folder] ?? [];
                const uploadState = eventUploadState[event.id]?.status ?? 'idle';
                const uploadErrorMessage = eventUploadState[event.id]?.error;
                return (
                  <div
                    key={event.id}
                    className="bg-black/40 border border-gray-800 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{localized?.title ?? event.folder}</h3>
                        {localized?.date && (
                          <p className="text-sm text-[#d6b209] uppercase tracking-[0.35em]">{localized.date}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          S3: <span className="font-mono text-gray-300">events/{event.folder}</span>
                        </p>
                        {localized?.description && (
                          <p className="text-sm text-gray-400 mt-2">{localized.description}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(event)}
                          className="text-sm rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 transition"
                        >
                          {labels.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEventHandler(event)}
                          className="text-sm rounded-lg bg-[#ce1226] px-4 py-2 hover:bg-[#a70e1f] transition"
                        >
                          {labels.delete}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                      <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
                        {labels.uploadLabel}
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(eventTarget) => {
                            const file = eventTarget.target.files?.[0];
                            void handleEventFileChange(event.id, file);
                            eventTarget.target.value = '';
                          }}
                          disabled={uploadState === 'uploading'}
                          className="text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#d6b209] file:px-4 file:py-2 file:text-black file:font-semibold file:hover:bg-[#b79807] file:transition"
                        />
                        <span className="text-xs text-gray-500">{labels.uploadHint}</span>
                        {uploadState === 'uploading' && (
                          <span className="text-sm text-gray-400">{labels.uploading}</span>
                        )}
                        {uploadState === 'success' && (
                          <span className="text-sm text-[#6bc46d]">{labels.uploadSuccess}</span>
                        )}
                        {uploadState === 'error' && (
                          <span className="text-sm text-[#ce1226]">{uploadErrorMessage ?? labels.uploadError}</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                      {assets.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          {language === 'en' ? 'No media uploaded yet.' : 'Aún no hay media cargada.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {assets.map((asset) => {
                            const deleteKey = `${event.id}:${asset.key}`;
                            const deleteState = assetDeleteState[deleteKey]?.status ?? 'idle';
                            const deleteErrorMessage = assetDeleteState[deleteKey]?.error;
                            return (
                              <MediaThumbnail
                                key={asset.key}
                                asset={asset}
                                onDelete={() => setPendingDeletion({ eventId: event.id, assetKey: asset.key })}
                                deleteState={deleteState}
                                deleteError={deleteErrorMessage}
                                labels={{
                                  delete: labels.deleteMedia,
                                  deleting: labels.deletingMedia,
                                  success: labels.deleteMediaSuccess,
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {pendingDeletion && (() => {
        const pendingEvent = events.find((item) => item.id === pendingDeletion.eventId);
        const pendingAsset = pendingEvent
          ? (pendingEvent.assets ?? []).find((asset) => asset.key === pendingDeletion.assetKey)
          : undefined;
        const fileName = pendingAsset?.key.split('/').pop() ?? pendingDeletion.assetKey.split('/').pop();
        const assetUrl = pendingAsset?.url;
        const isVideoPreview = assetUrl ? MEDIA_VIDEO_REGEX.test(assetUrl) : false;
        return (
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={cancelPendingDeletion}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md rounded-2xl bg-gray-950 border border-[#012d62]/40 shadow-2xl p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={cancelPendingDeletion}
                className="absolute right-4 top-4 text-white text-2xl font-bold hover:text-[#d6b209] transition"
                aria-label={labels.cancel}
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-white mb-3">{labels.deleteMediaConfirm}</h3>
              <p className="text-sm text-gray-300 mb-6">
                {language === 'en'
                  ? 'Are you sure you want to permanently delete this media file?'
                  : '¿Seguro que deseas eliminar permanentemente este archivo?'}
              </p>
              {assetUrl && (
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-800 bg-black/50">
                  {isVideoPreview ? (
                    <video src={assetUrl} className="h-48 w-full object-cover" muted playsInline controls />
                  ) : (
                    <img src={assetUrl} alt={fileName ?? 'Preview'} className="h-48 w-full object-cover" />
                  )}
                </div>
              )}
              <div className="rounded-lg border border-gray-800 bg-black/40 p-4 mb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#d6b209] mb-1">{labels.fileLabel}</p>
                <p className="text-sm text-gray-200 break-all">{fileName}</p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelPendingDeletion}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
                >
                  {labels.cancel}
                </button>
                <button
                  type="button"
                  onClick={confirmPendingDeletion}
                  className="rounded-xl bg-[#ce1226] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a70e1f] transition"
                >
                  {labels.delete}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 shadow-xl border ${
            toast.type === 'success'
              ? 'bg-[#13223e]/90 border-[#d6b209]/40 text-[#e8e0b3]'
              : 'bg-[#3a1515]/90 border-[#ce1226]/40 text-[#f6c0c0]'
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </section>
  );
};

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helper?: string;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChange,
  required,
  helper,
  className,
  readOnly,
  disabled,
}) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
      {label}
    </label>
    <input
      type="text"
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      readOnly={readOnly}
      disabled={disabled}
      className={`w-full rounded-xl border border-[#012d62]/40 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60 ${
        disabled ? 'bg-black/40 text-gray-400 cursor-not-allowed' : 'bg-black/70'
      }`}
    />
    {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
  </div>
);

interface LabeledTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}

const LabeledTextArea: React.FC<LabeledTextAreaProps> = ({ label, value, onChange, rows = 4, className }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em] mb-2">
      {label}
    </label>
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-[#012d62]/40 bg-black/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d6b209]/60 resize-none"
    />
  </div>
);

const MEDIA_VIDEO_REGEX = /\.(mp4|webm|ogg|mov)$/i;

interface MediaThumbnailProps {
  asset: EventAsset;
  onDelete?: () => void;
  deleteState?: UploadStatus;
  deleteError?: string;
  labels?: {
    delete: string;
    deleting: string;
    success: string;
  };
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  asset,
  onDelete,
  deleteState = 'idle',
  deleteError,
  labels,
}) => {
  const isVideo = MEDIA_VIDEO_REGEX.test(asset.url);
  const fileName = asset.key.split('/').pop() ?? asset.key;
  const resolvedLabels = {
    delete: labels?.delete ?? 'Delete',
    deleting: labels?.deleting ?? 'Deleting…',
    success: labels?.success ?? 'Deleted.',
  };
  const errorMessage = deleteError ?? resolvedLabels.delete;

  return (
    <div className="space-y-1">
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border border-gray-700 hover:border-[#d6b209]/60 transition"
      >
        {isVideo ? (
          <video
            src={asset.url}
            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            muted
            playsInline
          />
        ) : (
          <img
            src={asset.url}
            alt={fileName}
            className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-[10px] font-mono text-gray-300 truncate">
          {fileName}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (deleteState !== 'uploading') {
                onDelete();
              }
            }}
            disabled={deleteState === 'uploading'}
            className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-gray-200 hover:bg-[#ce1226] hover:text-white transition"
            aria-label={deleteState === 'uploading' ? resolvedLabels.deleting : resolvedLabels.delete}
          >
            {deleteState === 'uploading' ? '…' : '✕'}
          </button>
        )}
      </a>
      {deleteState === 'error' && (
        <p className="text-xs text-[#ce1226]">{errorMessage}</p>
      )}
      {deleteState === 'uploading' && (
        <p className="text-xs text-gray-400">{resolvedLabels.deleting}</p>
      )}
      {deleteState === 'success' && <p className="text-xs text-[#6bc46d]">{resolvedLabels.success}</p>}
    </div>
  );
};

const createEmptyBoardMemberForm = () => ({
  imageUrl: '',
  imageKey: '',
  en: { name: '', role: '', description: '' },
  es: { name: '', role: '', description: '' },
});

interface BoardMembersManagerProps extends CommonProps {
  labels: (typeof labels)['en']['pages']['boardMembers'];
  onAfterChange: () => void;
}

const BoardMembersManager: React.FC<BoardMembersManagerProps> = ({
  language,
  authHeaders,
  onUnauthorized,
  labels,
  onAfterChange,
}) => {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState(() => createEmptyBoardMemberForm());
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast, setToast } = useAutoDismissToast();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/board-members', {
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load board members');
      }
      const data = (await response.json()) as { members: BoardMember[] };
      setMembers(data.members ?? []);
    } catch (err) {
      console.error(err);
      setError(labels.error);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, labels.error, onUnauthorized]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  const resetForm = useCallback(() => {
    setFormMode('create');
    setEditingId(null);
    setFormValues(createEmptyBoardMemberForm());
    setUploadStatus('idle');
    setUploadError(null);
  }, []);

  const startEdit = (member: BoardMember) => {
    setFormMode('edit');
    setEditingId(member.id);
    setFormValues({
      imageUrl: member.imageUrl,
      imageKey: member.imageKey ?? '',
      en: { ...member.en },
      es: { ...member.es },
    });
    setUploadStatus('idle');
    setUploadError(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus('idle');
    setUploadError(null);
    try {
      const response = await fetch('/api/admin/board-members?action=upload', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to request upload URL');
      }
      const data = (await response.json()) as { uploadUrl: string; objectUrl: string; key: string };
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error('Upload to S3 failed');
      }
      setFormValues((previous) => ({
        ...previous,
        imageUrl: data.objectUrl,
        imageKey: data.key,
      }));
      setUploadStatus('success');
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setUploadError(labels.uploadError);
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const validateRequiredFields = () => {
    const enValid = formValues.en.name.trim() && formValues.en.role.trim();
    const esValid = formValues.es.name.trim() && formValues.es.role.trim();
    return Boolean(enValid && esValid);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.imageUrl) {
      alert(language === 'en' ? 'Please upload a portrait before saving.' : 'Por favor sube un retrato antes de guardar.');
      return;
    }
    if (!validateRequiredFields()) {
      alert(language === 'en' ? 'Name and role are required in both languages.' : 'El nombre y el cargo son obligatorios en ambos idiomas.');
      return;
    }
    const payload = {
      imageUrl: formValues.imageUrl,
      imageKey: formValues.imageKey || undefined,
      en: {
        name: formValues.en.name.trim(),
        role: formValues.en.role.trim(),
        description: formValues.en.description.trim(),
      },
      es: {
        name: formValues.es.name.trim(),
        role: formValues.es.role.trim(),
        description: formValues.es.description.trim(),
      },
    };
    try {
      const response = await fetch('/api/admin/board-members', {
        method: formMode === 'edit' ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(
          formMode === 'edit'
            ? {
                id: editingId,
                ...payload,
              }
            : payload,
        ),
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to save board member');
      }
      await fetchMembers();
      onAfterChange();
      resetForm();
      setToast({ message: formMode === 'edit' ? labels.toastUpdated : labels.toastCreated, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: labels.toastError, type: 'error' });
    }
  };

  const handleDelete = async (member: BoardMember) => {
    if (!window.confirm(labels.confirmDelete)) return;
    try {
      const response = await fetch(`/api/admin/board-members?id=${encodeURIComponent(member.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete board member');
      }
      await fetchMembers();
      onAfterChange();
      if (editingId === member.id) {
        resetForm();
      }
      setToast({ message: labels.toastDeleted, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: labels.toastError, type: 'error' });
    }
  };

  const localizedMembers = members.map((member) => {
    const primary = member[language].name || member.en.name || member.es.name;
    const secondary = language === 'en' ? member.es.name : member.en.name;
    const role = member[language].role || member.en.role || member.es.role;
    const description = member[language].description || member.en.description || member.es.description;
    return {
      ...member,
      primaryName: primary,
      secondaryName: secondary,
      role,
      description,
    };
  });

  return (
    <section className="mt-10 space-y-6 rounded-2xl border border-[#012d62]/30 bg-gray-900/60 p-6 shadow-xl">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <h3 className="text-xl font-bold text-white">{labels.heading}</h3>
          <p className="text-sm text-gray-400">{labels.description}</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="self-start rounded-xl bg-[#d6b209] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#b79807]"
        >
          {labels.addMember}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d6b209]">{labels.listTitle}</h4>
          {loading && <p className="text-sm text-gray-400">{labels.loading}</p>}
          {error && <p className="text-sm text-[#ce1226]">{error}</p>}
          {!loading && !error && localizedMembers.length === 0 && (
            <p className="text-sm text-gray-400">{labels.empty}</p>
          )}
          <div className="space-y-4">
            {localizedMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-black/40 p-4 shadow-inner shadow-black/40 sm:flex-row"
              >
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-full border border-[#012d62]/60 bg-[#012d62]/40">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.primaryName} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h5 className="text-lg font-semibold text-white">{member.primaryName}</h5>
                    {member.secondaryName && member.secondaryName !== member.primaryName && (
                      <p className="text-xs text-gray-500">{member.secondaryName}</p>
                    )}
                    <p className="text-sm text-[#d6b209] uppercase tracking-[0.35em]">{member.role}</p>
                  </div>
                  {member.description && <p className="text-sm text-gray-300">{member.description}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(member)}
                      className="inline-flex min-w-[80px] items-center justify-center rounded-lg bg-[#012d62] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b417f]"
                    >
                      {labels.edit ?? 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      className="rounded-lg bg-[#ce1226] px-4 py-2 text-sm text-white transition hover:bg-[#a70e1f]"
                    >
                      {labels.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form className="space-y-4 rounded-xl border border-gray-800 bg-black/40 p-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">
              {formMode === 'edit' ? labels.editTitle : labels.createTitle}
            </h4>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.formTitle}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#d6b209] uppercase tracking-[0.25em]">
              {labels.uploadLabel}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#d6b209] file:px-4 file:py-2 file:text-black file:font-semibold file:hover:bg-[#b79807] file:transition"
            />
            <span className="text-xs text-gray-500">{labels.uploadHint}</span>
            {uploading && <span className="text-sm text-gray-400">{labels.uploading}</span>}
            {!uploading && uploadStatus === 'success' && <span className="text-sm text-[#6bc46d]">{labels.uploadSuccess}</span>}
            {!uploading && uploadStatus === 'error' && (
              <span className="text-sm text-[#ce1226]">{uploadError ?? labels.uploadError}</span>
            )}
          </div>

          {formValues.imageUrl && (
            <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-black/50 p-3">
              <img src={formValues.imageUrl} alt={labels.previewAlt} className="h-16 w-16 rounded-lg object-cover" />
              <div className="text-xs text-gray-500 break-all">{formValues.imageKey || formValues.imageUrl}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <LabeledInput
              label={labels.nameLabel}
              value={formValues.en.name}
              onChange={(value) => setFormValues((previous) => ({ ...previous, en: { ...previous.en, name: value } }))}
              required
            />
            <LabeledInput
              label={labels.roleLabel}
              value={formValues.en.role}
              onChange={(value) => setFormValues((previous) => ({ ...previous, en: { ...previous.en, role: value } }))}
              required
            />
            <LabeledTextArea
              label={labels.descriptionLabel}
              value={formValues.en.description}
              onChange={(value) => setFormValues((previous) => ({ ...previous, en: { ...previous.en, description: value } }))}
              rows={3}
            />
            <LabeledInput
              label={labels.nameEsLabel}
              value={formValues.es.name}
              onChange={(value) => setFormValues((previous) => ({ ...previous, es: { ...previous.es, name: value } }))}
              required
            />
            <LabeledInput
              label={labels.roleEsLabel}
              value={formValues.es.role}
              onChange={(value) => setFormValues((previous) => ({ ...previous, es: { ...previous.es, role: value } }))}
              required
            />
            <LabeledTextArea
              label={labels.descriptionEsLabel}
              value={formValues.es.description}
              onChange={(value) => setFormValues((previous) => ({ ...previous, es: { ...previous.es, description: value } }))}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-[#d6b209] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#b79807]"
              disabled={uploading}
            >
              {labels.save}
            </button>
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                {labels.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 shadow-xl border ${
            toast.type === 'success'
              ? 'bg-[#13223e]/90 border-[#d6b209]/40 text-[#e8e0b3]'
              : 'bg-[#3a1515]/90 border-[#ce1226]/40 text-[#f6c0c0]'
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </section>
  );
};

export default AdminPage;

