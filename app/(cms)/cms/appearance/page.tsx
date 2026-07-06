'use client';

import { useState, useEffect } from 'react';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import webservice from '@/utils/webservice';
import {
  Settings,
  Image as ImageIcon,
  Trash2,
  Save,
  MapPin,
  Building,
  Clock,
  Smartphone,
  Upload,
  Search,
  FileText,
  ToggleLeft,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LayoutDashboard,
  Calendar,
  Scissors,
  Sparkles,
  Users,
  MessageSquare
} from 'lucide-react';

interface ImpostazioniFrontend {
  _id?: string;
  logo?: string;
  logoAlt?: string;
  logoCentrale?: string;
  logoCMS?: string;
  favicon?: string;
  nomeAzienda: string;
  tagline?: string;
  descrizione?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  coordinate?: { lat: number; lng: number };
  social?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; tiktok?: string; youtube?: string };
  orariApertura?: { lunedi?: string; martedi?: string; mercoledi?: string; giovedi?: string; venerdi?: string; sabato?: string; domenica?: string };
  seo?: { titoloPagina?: string; descrizioneMeta?: string; keywords?: string; ogImage?: string };
  testiHomepage?: { titoloHero?: string; sottotitoloHero?: string; badgeHero?: string; testoCtaPrimario?: string; testoCtaSecondario?: string; titoloServizi?: string; sottotitoloServizi?: string; titoloOrari?: string; sottotitoloOrari?: string; titoloCtaFinale?: string; sottotitoloCtaFinale?: string };
  testiPrenotazione?: { titoloPagina?: string; sottotitoloPagina?: string; stepLocatie?: string; stepSpecialist?: string; stepServizio?: string; stepData?: string; stepOrario?: string; stepConferma?: string };
  funzionalita?: { mostraOrari?: boolean; mostraServizi?: boolean; mostraSocial?: boolean; mostraContatti?: boolean; abilitaPrenotazioni?: boolean; mostraPrezziFrontend?: boolean; richiestaConfermaEmail?: boolean; oreAnticipo?: number };
  linkPrivacyPolicy?: string;
  linkCookiePolicy?: string;
}

const INPUT_CLASS = 'w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none';

const TABS = [
  { id: 'generale', label: 'General', icon: Building },
  // { id: 'orar', label: 'Orar', icon: Clock },
  { id: 'testi', label: 'Texte in rezervare', icon: FileText },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'funzionalita', label: 'Funcționalități', icon: ToggleLeft },
  { id: 'legal', label: 'Legal', icon: Shield },
  { id: 'ghid', label: 'Ghid', icon: BookOpen },
];

function CampoInput({ label, value, onChange, type = 'text', placeholder, required, maxLength, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; maxLength?: number; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-bold mb-2">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} placeholder={placeholder} required={required} maxLength={maxLength} />
    </div>
  );
}

function CampoTextarea({ label, value, onChange, placeholder, rows = 3, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-bold mb-2">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} rows={rows} placeholder={placeholder} />
    </div>
  );
}

function SezioneMobile({ titolo, icona: Icona, children, defaultOpen = true }: {
  titolo: string; icona: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="md:hidden mb-4 group">
      <summary className="flex items-center gap-2 cursor-pointer select-none p-4 bg-white rounded-xl border border-gray-200 font-bold text-lg list-none [&::-webkit-details-marker]:hidden">
        <Icona className="w-5 h-5" />
        {titolo}
        <ChevronDown className="w-5 h-5 ml-auto transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function SezioneDesktop({ titolo, icona: Icona, children, defaultOpen = true }: {
  titolo: string; icona: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <Card className="hidden md:block">
      <details open={defaultOpen} className="group">
        <summary className="flex items-center gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
          <Icona className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold flex-1">{titolo}</h2>
          <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-5 pt-5 border-t border-gray-100">{children}</div>
      </details>
    </Card>
  );
}

export default function FrontendPage() {
  const [impostazioni, setImpostazioni] = useState<ImpostazioniFrontend>({ nomeAzienda: '' });
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [tabAttiva, setTabAttiva] = useState<string>('generale');

  useEffect(() => { caricaImpostazioni(); }, []);

  const caricaImpostazioni = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/settings');
      if (risposta.dati) setImpostazioni(risposta.dati);
    } catch { console.log('Nessuna impostazione trovata, uso valori default'); }
    finally { setCaricamento(false); }
  };

  const handleSalva = async () => {
    try {
      setSalvando(true); setErrore('');
      await webservice.put('/api/settings', impostazioni);
      setSuccesso('Setări salvate cu succes!');
      await caricaImpostazioni();
    } catch (err: any) { setErrore(err.response?.data?.errore || 'Errore nel salvataggio'); }
    finally { setSalvando(false); }
  };

  const aggiorna = (campo: string, valore: any) => {
    setImpostazioni(prev => {
      const nuove = { ...prev };
      const parti = campo.split('.');
      let obj: any = nuove;
      for (let i = 0; i < parti.length - 1; i++) {
        if (!obj[parti[i]]) obj[parti[i]] = {};
        obj = obj[parti[i]];
      }
      obj[parti[parti.length - 1]] = valore;
      return nuove;
    });
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>, tipoLogo: 'logo' | 'logoCentrale' | 'logoCMS') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) { setErrore('Format imagine neacceptat. Folosește JPG, PNG, GIF, WEBP sau SVG'); return; }
    if (file.size > 10 * 1024 * 1024) { setErrore('Imagine prea mare. Maxim 10MB'); return; }
    try {
      setUploadingLogo(tipoLogo); setErrore('');
      const formData = new FormData();
      formData.append('file', file); formData.append('tipo', 'logo');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errore || 'Errore upload');
      const nuoveImpostazioni = { ...impostazioni, [tipoLogo]: data.url };
      setImpostazioni(nuoveImpostazioni);
      await webservice.put('/api/settings', nuoveImpostazioni);
      sessionStorage.removeItem('logoCMS'); sessionStorage.removeItem('nomeAzienda');
      setSuccesso('Logo încărcat și salvat cu succes!');
    } catch (err: any) { setErrore(err.message || 'Errore durante il caricamento del logo'); }
    finally { setUploadingLogo(null); }
  };

  const handleUploadDocumento = async (e: React.ChangeEvent<HTMLInputElement>, campo: 'linkPrivacyPolicy' | 'linkCookiePolicy') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setErrore('Doar fișiere PDF sunt acceptate'); return; }
    if (file.size > 10 * 1024 * 1024) { setErrore('Fișier prea mare. Maxim 10MB'); return; }
    try {
      setUploadingDoc(campo); setErrore('');
      const formData = new FormData();
      formData.append('file', file); formData.append('tipo', 'documento');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errore || 'Eroare upload');
      const nuoveImpostazioni = { ...impostazioni, [campo]: data.url };
      setImpostazioni(nuoveImpostazioni);
      await webservice.put('/api/settings', nuoveImpostazioni);
      setSuccesso('PDF încărcat și salvat cu succes!');
    } catch (err: any) { setErrore(err.message || 'Eroare în timpul încărcării PDF-ului'); }
    finally { setUploadingDoc(null); }
  };

  const LogoUpload = ({ tipo, titolo, descrizione, uploading, value, onChange, previewAlt }: {
    tipo: 'logo' | 'logoCentrale' | 'logoCMS'; titolo: string; descrizione: string; uploading: string | null; value: string; onChange: (v: string) => void; previewAlt?: string;
  }) => (
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      <h3 className="text-lg font-bold mb-3">{titolo}</h3>
      <p className="text-sm text-gray-600 mb-4">{descrizione}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors text-center">
            <input type="file" accept="image/*" onChange={(e) => handleUploadLogo(e, tipo)} className="hidden" disabled={uploading === tipo} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium">{uploading === tipo ? 'Încărcare...' : 'Click pentru încărcare'}</span>
              <span className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, SVG (max 10MB)</span>
            </div>
          </div>
        </label>
        <div className="flex-1">
          <label className="block text-sm font-bold mb-2">Sau introdu URL</label>
          <input type="url" value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} placeholder="https://exemplu.com/logo.png" />
        </div>
      </div>
      {value && (
        <div className="bg-gray-50 rounded-lg p-4 mt-3">
          <p className="text-sm font-bold mb-2">Previzualizare:</p>
          <img src={value} alt={previewAlt || "Logo"} className="max-h-24 object-contain" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'Eroare încărcare logo'; }} />
          <button onClick={() => onChange('')} className="mt-2 text-sm text-red-600 hover:text-red-700">
            <Trash2 className="w-3 h-3 inline mr-1" /> Elimină logo
          </button>
        </div>
      )}
    </div>
  );

  const SocialInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <CampoInput label={label} value={value} onChange={onChange} type="url" placeholder={placeholder} />
  );

  if (caricamento) return <div className="flex items-center justify-center min-h-screen"><Caricamento /></div>;

  return (
    <div className="p-4 md:p-6 pb-12 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Settings className="w-7 h-7" /> Aspect
            </h1>
            <p className="text-gray-600">Gestionează logo, informații companie și social media</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={caricaImpostazioni} disabled={salvando}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Resetează
            </button>
            <Bottone onClick={handleSalva} disabled={salvando || !impostazioni.nomeAzienda} className="w-full sm:w-auto">
              {salvando ? 'Salvare...' : (
                <span className="flex items-center gap-2 justify-center">
                  <Save className="w-4 h-4" />
                  Salvează Setări
                </span>
              )}
            </Bottone>
          </div>
        </div>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* TABS */}
      <div className="mb-6 md:mb-8">
        {/* Mobile: navigazione con frecce */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === tabAttiva);
                if (idx > 0) setTabAttiva(TABS[idx - 1].id);
              }}
              disabled={TABS.findIndex(t => t.id === tabAttiva) === 0}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white rounded-xl border border-gray-200 font-semibold text-sm text-gray-800 min-h-[44px]">
              {(() => {
                const tab = TABS.find(t => t.id === tabAttiva);
                if (!tab) return null;
                const Icona = tab.icon;
                return <><Icona className="w-4 h-4 shrink-0" /> {tab.label}</>;
              })()}
            </div>
            <button
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === tabAttiva);
                if (idx < TABS.length - 1) setTabAttiva(TABS[idx + 1].id);
              }}
              disabled={TABS.findIndex(t => t.id === tabAttiva) === TABS.length - 1}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Desktop: card-style tabs */}
        <div className="hidden md:block">
          <div className="flex gap-3">
            {TABS.map(tab => {
              const attivo = tabAttiva === tab.id;
              return (
                <button key={tab.id} onClick={() => setTabAttiva(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                    attivo
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200/50'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-sm'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ==================== GENERALE ==================== */}
        {tabAttiva === 'generale' && <>
          {/* === Mobile: collassabile === */}
          {/* <SezioneMobile titolo="Informații Companie" icona={Building}>
            <div className="grid grid-cols-1 gap-4">
              <CampoInput label="Nume Companie" value={impostazioni.nomeAzienda} onChange={(v) => setImpostazioni({ ...impostazioni, nomeAzienda: v })} required placeholder="Ex: Beauty Salon Premium" />
              <CampoInput label="Slogan" value={impostazioni.tagline || ''} onChange={(v) => setImpostazioni({ ...impostazioni, tagline: v })} placeholder="Ex: Stilul tău, pasiunea noastră" />
              <CampoTextarea label="Descriere" value={impostazioni.descrizione || ''} onChange={(v) => setImpostazioni({ ...impostazioni, descrizione: v })} placeholder="Scurtă descriere a salonului tău" />
              <CampoInput label="Email" value={impostazioni.email || ''} onChange={(v) => setImpostazioni({ ...impostazioni, email: v })} type="email" placeholder="info@beautysalon.ro" />
              <CampoInput label="Telefono" value={impostazioni.telefono || ''} onChange={(v) => setImpostazioni({ ...impostazioni, telefono: v })} type="tel" placeholder="+40 712 345 678" />
              <CampoInput label="Adresă" value={impostazioni.indirizzo || ''} onChange={(v) => setImpostazioni({ ...impostazioni, indirizzo: v })} placeholder="Strada Exemplu 123" />
              <CampoInput label="Oraș" value={impostazioni.citta || ''} onChange={(v) => setImpostazioni({ ...impostazioni, citta: v })} placeholder="București" />
              <CampoInput label="Cod Poștal" value={impostazioni.cap || ''} onChange={(v) => setImpostazioni({ ...impostazioni, cap: v })} placeholder="010101" />
              <CampoInput label="Județ" value={impostazioni.provincia || ''} onChange={(v) => setImpostazioni({ ...impostazioni, provincia: v })} placeholder="B" maxLength={2} />
              <CampoInput label="Țară" value={impostazioni.paese || 'Italia'} onChange={(v) => setImpostazioni({ ...impostazioni, paese: v })} placeholder="România" />
            </div>
          </SezioneMobile> */}

          {/* <SezioneMobile titolo="Locație și Hartă" icona={MapPin} defaultOpen={false}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Sugestie:</strong> Introdu coordonatele GPS pentru Google Maps.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <CampoInput label="Latitudine" value={impostazioni.coordinate?.lat?.toString() || ''} onChange={(v) => setImpostazioni({ ...impostazioni, coordinate: { ...impostazioni.coordinate, lat: parseFloat(v) || 0, lng: impostazioni.coordinate?.lng || 0 } })} placeholder="Ex: 44.4268" />
              <CampoInput label="Longitudine" value={impostazioni.coordinate?.lng?.toString() || ''} onChange={(v) => setImpostazioni({ ...impostazioni, coordinate: { ...impostazioni.coordinate, lat: impostazioni.coordinate?.lat || 0, lng: parseFloat(v) || 0 } })} placeholder="Ex: 26.1025" />
            </div>
            {impostazioni.coordinate?.lat && impostazioni.coordinate?.lng && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-bold mb-2">Previzualizare Hartă:</p>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe src={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
                <div className="mt-2 flex gap-2">
                  <a href={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">Deschide în Google Maps</a>
                  <button onClick={() => setImpostazioni({ ...impostazioni, coordinate: undefined })} className="text-sm text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3 inline mr-1" /> Elimină coordonate
                  </button>
                </div>
              </div>
            )}
          </SezioneMobile> */}

          <SezioneMobile titolo="Logo-uri" icona={ImageIcon} defaultOpen={false}>
            <div className="space-y-3">
              <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                  <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-sm flex-1">Header &amp; Footer</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Logo afișat în bara de navigare și în footer</p>
                  <LogoUpload tipo="logo" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logo || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logo: v })} previewAlt={impostazioni.logoAlt || "Logo"} />
                  <div className="mt-2">
                    <CampoInput label="Text alternativ" value={impostazioni.logoAlt || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoAlt: v })} placeholder="Ex: Logo Beauty Salon" />
                  </div>
                </div>
              </details>
              <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                  <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-sm flex-1">Pagina Principală</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Logo mare afișat în centrul paginii principale</p>
                  <LogoUpload tipo="logoCentrale" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logoCentrale || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoCentrale: v })} previewAlt="Logo Centrale" />
                </div>
              </details>
              <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                  <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-sm flex-1">Bară Laterală CMS</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Logo afișat în bara laterală a panoului CMS</p>
                  <LogoUpload tipo="logoCMS" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logoCMS || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoCMS: v })} previewAlt="Logo CMS" />
                </div>
              </details>
            </div>
          </SezioneMobile>

          <SezioneMobile titolo="Social Media" icona={Smartphone} defaultOpen={false}>
            <div className="grid grid-cols-1 gap-4">
              <SocialInput label="Facebook" value={impostazioni.social?.facebook || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, facebook: v } })} placeholder="https://facebook.com/pagina ta" />
              <SocialInput label="Instagram" value={impostazioni.social?.instagram || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, instagram: v } })} placeholder="https://instagram.com/profilul tau" />
              <SocialInput label="Twitter" value={impostazioni.social?.twitter || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, twitter: v } })} placeholder="https://twitter.com/profilul tau" />
              <SocialInput label="LinkedIn" value={impostazioni.social?.linkedin || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, linkedin: v } })} placeholder="https://linkedin.com/company/compania ta" />
              <SocialInput label="TikTok" value={impostazioni.social?.tiktok || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, tiktok: v } })} placeholder="https://tiktok.com/@profilul tau" />
              <SocialInput label="YouTube" value={impostazioni.social?.youtube || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, youtube: v } })} placeholder="https://youtube.com/@canalul tau" />
            </div>
            <div className="mt-4">
              <CampoInput label="WhatsApp (număr cu prefix internațional)" value={impostazioni.whatsapp || ''} onChange={(v) => setImpostazioni({ ...impostazioni, whatsapp: v })} type="tel" placeholder="+40712345678" />
              <p className="text-xs text-gray-500 mt-1">Număr cu prefix internațional (fără spații)</p>
            </div>
          </SezioneMobile>

          {/* === Desktop: Cards classici === */}
          {/* <SezioneDesktop titolo="Informații Companie" icona={Building}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoInput label="Nume Companie" value={impostazioni.nomeAzienda} onChange={(v) => setImpostazioni({ ...impostazioni, nomeAzienda: v })} required placeholder="Ex: Beauty Salon Premium" />
              <CampoInput label="Slogan" value={impostazioni.tagline || ''} onChange={(v) => setImpostazioni({ ...impostazioni, tagline: v })} placeholder="Ex: Stilul tău, pasiunea noastră" />
              <CampoTextarea label="Descriere" value={impostazioni.descrizione || ''} onChange={(v) => setImpostazioni({ ...impostazioni, descrizione: v })} placeholder="Scurtă descriere a salonului tău" className="md:col-span-2" />
              <CampoInput label="Email" value={impostazioni.email || ''} onChange={(v) => setImpostazioni({ ...impostazioni, email: v })} type="email" placeholder="info@beautysalon.ro" />
              <CampoInput label="Telefono" value={impostazioni.telefono || ''} onChange={(v) => setImpostazioni({ ...impostazioni, telefono: v })} type="tel" placeholder="+40 712 345 678" />
              <CampoInput label="Adresă" value={impostazioni.indirizzo || ''} onChange={(v) => setImpostazioni({ ...impostazioni, indirizzo: v })} placeholder="Strada Exemplu 123" className="md:col-span-2" />
              <CampoInput label="Oraș" value={impostazioni.citta || ''} onChange={(v) => setImpostazioni({ ...impostazioni, citta: v })} placeholder="București" />
              <CampoInput label="Cod Poștal" value={impostazioni.cap || ''} onChange={(v) => setImpostazioni({ ...impostazioni, cap: v })} placeholder="010101" />
              <CampoInput label="Județ" value={impostazioni.provincia || ''} onChange={(v) => setImpostazioni({ ...impostazioni, provincia: v })} placeholder="B" maxLength={2} />
              <CampoInput label="Țară" value={impostazioni.paese || 'Italia'} onChange={(v) => setImpostazioni({ ...impostazioni, paese: v })} placeholder="România" />
            </div>
          </SezioneDesktop> */}

          {/* <SezioneDesktop titolo="Locație și Hartă" icona={MapPin}>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Sugestie:</strong> Introdu coordonatele GPS pentru a-ți afișa poziția pe Google Maps.
                  Le poți găsi pe <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> (clic dreapta → Ce este aici?)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoInput label="Latitudine" value={impostazioni.coordinate?.lat?.toString() || ''} onChange={(v) => setImpostazioni({ ...impostazioni, coordinate: { ...impostazioni.coordinate, lat: parseFloat(v) || 0, lng: impostazioni.coordinate?.lng || 0 } })} placeholder="Ex: 44.4268" />
                <CampoInput label="Longitudine" value={impostazioni.coordinate?.lng?.toString() || ''} onChange={(v) => setImpostazioni({ ...impostazioni, coordinate: { ...impostazioni.coordinate, lat: impostazioni.coordinate?.lat || 0, lng: parseFloat(v) || 0 } })} placeholder="Ex: 26.1025" />
              </div>
              {impostazioni.coordinate?.lat && impostazioni.coordinate?.lng && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-bold mb-2">Previzualizare Hartă:</p>
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe src={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a href={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">→ Deschide în Google Maps</a>
                    <button onClick={() => setImpostazioni({ ...impostazioni, coordinate: undefined })} className="text-sm text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3 inline mr-1" /> Elimină coordonate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SezioneDesktop> */}

          <SezioneDesktop titolo="Logo-uri" icona={ImageIcon}>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-800">Header &amp; Footer</h4>
                </div>
                <p className="text-sm text-gray-500 mb-5 ml-8">Logo afișat în bara de navigare și în footer</p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <LogoUpload tipo="logo" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logo || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logo: v })} previewAlt={impostazioni.logoAlt || "Logo"} />
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <CampoInput label="Text alternativ" value={impostazioni.logoAlt || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoAlt: v })} placeholder="Ex: Logo Beauty Salon" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-800">Pagina Principală</h4>
                </div>
                <p className="text-sm text-gray-500 mb-5 ml-8">Logo mare afișat în centrul paginii principale</p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <LogoUpload tipo="logoCentrale" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logoCentrale || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoCentrale: v })} previewAlt="Logo Centrale" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-800">Bară Laterală CMS</h4>
                </div>
                <p className="text-sm text-gray-500 mb-5 ml-8">Logo afișat în bara laterală a panoului CMS</p>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <LogoUpload tipo="logoCMS" titolo="" descrizione="" uploading={uploadingLogo} value={impostazioni.logoCMS || ''} onChange={(v) => setImpostazioni({ ...impostazioni, logoCMS: v })} previewAlt="Logo CMS" />
                </div>
              </div>
            </div>
          </SezioneDesktop>

          <SezioneDesktop titolo="Social Media" icona={Smartphone}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialInput label="Facebook" value={impostazioni.social?.facebook || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, facebook: v } })} placeholder="https://facebook.com/pagina ta" />
              <SocialInput label="Instagram" value={impostazioni.social?.instagram || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, instagram: v } })} placeholder="https://instagram.com/profilul tau" />
              <SocialInput label="Twitter" value={impostazioni.social?.twitter || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, twitter: v } })} placeholder="https://twitter.com/profilul tau" />
              <SocialInput label="LinkedIn" value={impostazioni.social?.linkedin || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, linkedin: v } })} placeholder="https://linkedin.com/company/compania ta" />
              <SocialInput label="TikTok" value={impostazioni.social?.tiktok || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, tiktok: v } })} placeholder="https://tiktok.com/@profilul tau" />
              <SocialInput label="YouTube" value={impostazioni.social?.youtube || ''} onChange={(v) => setImpostazioni({ ...impostazioni, social: { ...impostazioni.social, youtube: v } })} placeholder="https://youtube.com/@canalul tau" />
            </div>
            <div className="mt-4">
              <CampoInput label="WhatsApp (număr cu prefix internațional)" value={impostazioni.whatsapp || ''} onChange={(v) => setImpostazioni({ ...impostazioni, whatsapp: v })} type="tel" placeholder="+40712345678" />
              <p className="text-xs text-gray-500 mt-1">Număr cu prefix internațional (fără spații)</p>
            </div>
          </SezioneDesktop>
        </>}

        {/* ==================== ORAR ==================== */}
        {/* {tabAttiva === 'orar' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Orar de Lucru
          </h2>
          <div className="space-y-3">
            {['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'].map((giorno) => (
              <div key={giorno} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className="text-sm font-bold capitalize">{giorno.charAt(0).toUpperCase() + giorno.slice(1)}</label>
                <input type="text" value={impostazioni.orariApertura?.[giorno as keyof typeof impostazioni.orariApertura] || ''}
                  onChange={(e) => setImpostazioni({ ...impostazioni, orariApertura: { ...impostazioni.orariApertura, [giorno]: e.target.value } })}
                  className="md:col-span-2 w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: 09:00 - 19:00 sau Închis" />
              </div>
            ))}
          </div>
        </Card>} */}

        {/* ==================== TESTI ==================== */}
        {tabAttiva === 'testi' && <>
          {/* <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Texte Pagina Principală
            </h2>
            <div className="space-y-4">
              <CampoInput label="Insignă Hero" value={impostazioni.testiHomepage?.badgeHero || ''} onChange={(v) => aggiorna('testiHomepage.badgeHero', v)} />
              <CampoInput label="Titlu Hero (lasă gol pentru a folosi numele companiei)" value={impostazioni.testiHomepage?.titoloHero || ''} onChange={(v) => aggiorna('testiHomepage.titoloHero', v)} />
              <CampoInput label="Subtitlu Hero (lasă gol pentru a folosi sloganul)" value={impostazioni.testiHomepage?.sottotitoloHero || ''} onChange={(v) => aggiorna('testiHomepage.sottotitoloHero', v)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoInput label="Text CTA Principal" value={impostazioni.testiHomepage?.testoCtaPrimario || ''} onChange={(v) => aggiorna('testiHomepage.testoCtaPrimario', v)} />
                <CampoInput label="Text CTA Secundar" value={impostazioni.testiHomepage?.testoCtaSecondario || ''} onChange={(v) => aggiorna('testiHomepage.testoCtaSecondario', v)} />
              </div>
            </div>
          </Card> */}
          <Card>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Texte Rezervare
            </h2>
            <div className="space-y-4">
              <CampoInput label="Titlu Pagină" value={impostazioni.testiPrenotazione?.titoloPagina || ''} onChange={(v) => aggiorna('testiPrenotazione.titoloPagina', v)} />
              <CampoInput label="Subtitlu Pagină" value={impostazioni.testiPrenotazione?.sottotitoloPagina || ''} onChange={(v) => aggiorna('testiPrenotazione.sottotitoloPagina', v)} />
              <CampoInput label="Step Locație" value={impostazioni.testiPrenotazione?.stepLocatie || ''} onChange={(v) => aggiorna('testiPrenotazione.stepLocatie', v)} />
              <CampoInput label="Step Specialist" value={impostazioni.testiPrenotazione?.stepSpecialist || ''} onChange={(v) => aggiorna('testiPrenotazione.stepSpecialist', v)} />
              <CampoInput label="Step Serviciu" value={impostazioni.testiPrenotazione?.stepServizio || ''} onChange={(v) => aggiorna('testiPrenotazione.stepServizio', v)} />
              <CampoInput label="Step Dată" value={impostazioni.testiPrenotazione?.stepData || ''} onChange={(v) => aggiorna('testiPrenotazione.stepData', v)} />
              <CampoInput label="Step Orar" value={impostazioni.testiPrenotazione?.stepOrario || ''} onChange={(v) => aggiorna('testiPrenotazione.stepOrario', v)} />
              <CampoInput label="Step Confirmare" value={impostazioni.testiPrenotazione?.stepConferma || ''} onChange={(v) => aggiorna('testiPrenotazione.stepConferma', v)} />
            </div>
          </Card>
        </>}

        {/* ==================== SEO ==================== */}
        {tabAttiva === 'seo' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" /> SEO și Metadate
          </h2>
          <div className="space-y-4">
            <CampoInput label="Titlu Pagină" value={impostazioni.seo?.titoloPagina || ''} onChange={(v) => aggiorna('seo.titoloPagina', v)} />
            <CampoTextarea label="Descriere Meta" value={impostazioni.seo?.descrizioneMeta || ''} onChange={(v) => aggiorna('seo.descrizioneMeta', v)} />
            <CampoInput label="Cuvinte cheie (separate prin virgulă)" value={impostazioni.seo?.keywords || ''} onChange={(v) => aggiorna('seo.keywords', v)} />
            <CampoInput label="Imagine Open Graph" value={impostazioni.seo?.ogImage || ''} onChange={(v) => aggiorna('seo.ogImage', v)} type="url" placeholder="https://exemplu.com/og-image.jpg" />
          </div>
        </Card>}

        {/* ==================== FUNCȚIONALITĂȚI ==================== */}
        {tabAttiva === 'funzionalita' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ToggleLeft className="w-5 h-5" /> Funcționalități
          </h2>
          <div className="space-y-4">
            {[
              { key: 'mostraOrari', label: 'Afișează Orarul de Lucru' },
              { key: 'mostraServizi', label: 'Afișează Secțiunea Servicii' },
              { key: 'mostraSocial', label: 'Afișează Linkuri Social Media' },
              { key: 'mostraContatti', label: 'Afișează Informațiile de Contact' },
              { key: 'abilitaPrenotazioni', label: 'Activează Sistemul de Rezervări' },
              { key: 'mostraPrezziFrontend', label: 'Afișează Prețurile în Frontend' },
              { key: 'richiestaConfermaEmail', label: 'Solicită Confirmare Email' },
            ].map(func => (
              <label key={func.key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={Boolean(impostazioni.funzionalita?.[func.key as keyof typeof impostazioni.funzionalita] ?? true)}
                  onChange={(e) => aggiorna(`funzionalita.${func.key}`, e.target.checked)} className="w-5 h-5" />
                <span className="text-sm font-medium">{func.label}</span>
              </label>
            ))}
          </div>
        </Card>}

        {/* ==================== LEGAL ==================== */}
        {tabAttiva === 'legal' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Politici Legale
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Încarcă PDF-urile cu Politica de Confidențialitate și Politica privind Cookie-urile.
            Acestea vor fi disponibile în footer-ul site-ului.
          </p>
          <div className="space-y-8">
            {/* PRIVACY POLICY */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-bold mb-2">Politica de Confidențialitate</h3>
              <p className="text-sm text-gray-600 mb-4">PDF-ul cu Politica de Confidențialitate (conform Legii nr. 133/2011)</p>
              <label className="cursor-pointer inline-block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors text-center min-w-[200px]">
                  <input type="file" accept=".pdf,application/pdf" onChange={(e) => handleUploadDocumento(e, 'linkPrivacyPolicy')} className="hidden" disabled={uploadingDoc === 'linkPrivacyPolicy'} />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium">{uploadingDoc === 'linkPrivacyPolicy' ? 'Încărcare...' : 'Click pentru încărcare PDF'}</span>
                    <span className="text-xs text-gray-500">PDF (max 10MB)</span>
                  </div>
                </div>
              </label>
              {impostazioni.linkPrivacyPolicy && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3 flex items-center justify-between">
                  <a href={impostazioni.linkPrivacyPolicy} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    {impostazioni.linkPrivacyPolicy.split('/').pop()}
                  </a>
                  <button onClick={() => setImpostazioni({ ...impostazioni, linkPrivacyPolicy: '' })} className="text-sm text-red-600 hover:text-red-700 ml-4">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {/* COOKIE POLICY */}
            <div>
              <h3 className="text-lg font-bold mb-2">Politica privind Cookie-urile</h3>
              <p className="text-sm text-gray-600 mb-4">PDF-ul cu Politica privind Cookie-urile (conform Legii nr. 133/2011)</p>
              <label className="cursor-pointer inline-block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors text-center min-w-[200px]">
                  <input type="file" accept=".pdf,application/pdf" onChange={(e) => handleUploadDocumento(e, 'linkCookiePolicy')} className="hidden" disabled={uploadingDoc === 'linkCookiePolicy'} />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium">{uploadingDoc === 'linkCookiePolicy' ? 'Încărcare...' : 'Click pentru încărcare PDF'}</span>
                    <span className="text-xs text-gray-500">PDF (max 10MB)</span>
                  </div>
                </div>
              </label>
              {impostazioni.linkCookiePolicy && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3 flex items-center justify-between">
                  <a href={impostazioni.linkCookiePolicy} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    {impostazioni.linkCookiePolicy.split('/').pop()}
                  </a>
                  <button onClick={() => setImpostazioni({ ...impostazioni, linkCookiePolicy: '' })} className="text-sm text-red-600 hover:text-red-700 ml-4">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>}

        {/* ==================== GHID ==================== */}
        {tabAttiva === 'ghid' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Ghid CMS
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Acest ghid explică fiecare pagină din CMS, ce modifici și cum apare pe site.
            Apasă pe fiecare secțiune pentru detalii.
          </p>

          <div className="space-y-3">
            {/* Panou de control */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Panou de Control</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/dashboard</span></p>
                <p><strong>📋 Ce vezi:</strong> Număr total de programări (azi, săptămâna aceasta, lună), venituri, programări recente</p>
                <p><strong>🔗 Ce afectează:</strong> Doar statistici interne, nu afectează site-ul vizibil</p>
              </div>
            </details>

            {/* Programări */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Programări</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/appointments</span></p>
                <p><strong>➕ Cum creezi o programare:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Mergi la <strong>"Programare Nouă"</strong></li>
                  <li>Alege <strong>Specialistul</strong> (listă cu toți specialiștii activi)</li>
                  <li>Alege <strong>Clientul</strong> (existent sau adaugă unul nou)</li>
                  <li>Alege <strong>Serviciul</strong> (se filtrează automat după specialist)</li>
                  <li>Alege <strong>Data</strong> (zilele indisponibile sunt gri)</li>
                  <li>Alege <strong>Ora</strong> (sloturile libere se încarcă automat)</li>
                  <li>Apasă <strong>"Creează Programare"</strong></li>
                </ol>
                <p><strong>✏️ Editează:</strong> Click pe o programare din listă pentru a modifica data, ora, serviciul, notele</p>
                <p><strong>✅ Acțiuni rapide:</strong> Confirmă, finalizează sau anulează direct din listă</p>
                <p><strong>🔗 Ce afectează:</strong> Programările apar în calendarul intern și în lista de programări. Clienții primesc confirmare (WhatsApp).</p>
              </div>
            </details>

            {/* Specialiști */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Scissors className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Specialiști</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/specialist</span></p>
                <p><strong>➕ Cum adaugi:</strong> Click "Adaugă Specialist" → completezi nume, email, telefon, serviciile pe care le face (specializări)</p>
                <p><strong>🛠️ Ce poți modifica:</strong> Nume, servicii, orar individual, zile de concediu</p>
                <p><strong>🔗 Ce afectează frontend:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Booking (pasul 3) — clientul alege specialistul disponibil</li>
                  <li>Homepage — secțiunea "Echipa noastră" dacă e activată</li>
                  <li>Disponibilitatea — fiecare specialist are orarul și concediile proprii</li>
                </ul>
                <p className="bg-blue-50 p-3 rounded-lg text-blue-800"><strong>💡 Sfat:</strong> Dacă un specialist nu mai lucrează cu tine, poți să-l dezactivezi (nu trebuie să-l ștergi).</p>
              </div>
            </details>

            {/* Servicii */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Servicii</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/services</span></p>
                <p><strong>➕ Cum adaugi:</strong> Click "Adaugă Serviciu" → nume, descriere, preț (<strong>Lei MDL</strong>), durată (minute), categorie</p>
                <p><strong>🔗 Ce afectează frontend:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Booking (pasul 2) — clientul alege serviciul dorit</li>
                  <li>Homepage — secțiunea "Servicii" cu prețuri și durată</li>
                  <li>Prețurile se calculează automat în Lei Moldovenești (MDL)</li>
                </ul>
                <p className="bg-blue-50 p-3 rounded-lg text-blue-800"><strong>💡 Sfat:</strong> Prețurile pot fi ascunse public din Aspect → Funcționalități → "Afișează Prețurile în Frontend".</p>
              </div>
            </details>

            {/* Orar */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Orar</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/hours</span></p>
                <p><strong>📋 Ce modifici:</strong> Programul de lucru al salonului (Luni-Duminică)</p>
                <p><strong>🔗 Ce afectează frontend:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Booking — sistemul calculează automat orele disponibile</li>
                  <li>Homepage — secțiunea "Orar" (dacă e activată)</li>
                  <li>Pagină separată de contact</li>
                </ul>
                <p className="bg-yellow-50 p-3 rounded-lg text-yellow-800"><strong>⚠️ Atentie:</strong> Orarul general al salonului. Pentru zile libere individuale (concedii), vezi "Disponibilitate echipă".</p>
              </div>
            </details>

            {/* Disponibilitate echipă */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Disponibilitate Echipă</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/availability</span></p>
                <p><strong>📋 Ce modifici:</strong> Concedii, zile libere, perioade de indisponibilitate pentru fiecare specialist</p>
                <p><strong>🔗 Ce afectează frontend:</strong> Booking — specialistul nu apare în zilele când e în concediu</p>
                <p className="bg-blue-50 p-3 rounded-lg text-blue-800"><strong>💡 Sfat:</strong> Poți seta și o singură zi sau o perioadă întreagă. Specialistul nu va primi programări în acele zile.</p>
              </div>
            </details>

            {/* Homepage CMS */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Homepage CMS</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/homepage</span></p>
                <p><strong>🎨 Culori:</strong> Setează culoarea principală și secundară a site-ului</p>
                <p><strong>📦 Secțiuni pe care le poți gestiona:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded"><strong>Hero</strong> — titlu, subtitlu, butoane, imagine fundal, logo</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>Servicii</strong> — titlu, layout, ce servicii apar, prețuri</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>About</strong> — descriere, imagine, statistici, detalii</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>Galerie</strong> — imagini în grid</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>Orar</strong> — titlu, text înaintea orarului</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>Recenzii</strong> — layout, câte să apară, stil</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>Contact</strong> — text, email, telefon, hărți, sedii</div>
                  <div className="bg-gray-50 p-2 rounded"><strong>CTA Final</strong> — text și buton în partea de jos</div>
                </div>
                <p><strong>🔗 Ce afectează:</strong> TOATĂ pagina principală a site-ului. Fiecare modificare se vede instant.</p>
                <p className="bg-blue-50 p-3 rounded-lg text-blue-800"><strong>💡 Sfat:</strong> Poți ascunde/opri secțiuni pe care nu vrei să le afișezi (ex: galeria) fără să ștergi conținutul.</p>
              </div>
            </details>

            {/* Aspect - pagina curentă */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Aspect (pagina curentă)</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/appearance</span> (ești aici)</p>

                <p className="font-semibold mt-3">🔹 General</p>
                <p>Nume firmă, tagline, descriere, email, telefon, adresă, coordonate hartă — apar în header, footer, și pe site.</p>

                <p className="font-semibold mt-3">🔹 Logo-uri</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Header & Footer</strong> — logo-ul din bara de navigare și din subsol</li>
                  <li><strong>Pagina Principală</strong> — logo mare din centrul paginii (opțional)</li>
                  <li><strong>Bară Laterală CMS</strong> — logo-ul din sidebar-ul panoului de control</li>
                </ul>

                <p className="font-semibold mt-3">🔹 Social Media</p>
                <p>Link-uri Facebook, Instagram, TikTok, etc. — apar în footer și pe pagina de contact.</p>

                <p className="font-semibold mt-3">🔹 Texte în rezervare</p>
                <p>Schimbă titlurile și subtitlurile din fluxul de booking (pașii: Locație, Specialist, Serviciu, Dată, Oră, Confirmare).</p>

                <p className="font-semibold mt-3">🔹 SEO</p>
                <p>Titlu pagină, descriere meta, keywords, imagine Open Graph — pentru optimizare Google și când se partajează linkul pe social media.</p>

                <p className="font-semibold mt-3">🔹 Funcționalități</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Programări</strong> — activează/dezactivează tot sistemul de rezervări</li>
                  <li><strong>Prețurile în Frontend</strong> — arată sau ascunde prețurile pe site</li>
                  <li><strong>Social Media</strong> — arată sau ascunde linkurile sociale</li>
                  <li><strong>Contact</strong> — arată sau ascunde informațiile de contact</li>
                  <li><strong>Servicii</strong> — arată sau ascunde secțiunea servicii</li>
                  <li><strong>Orar</strong> — arată sau ascunde orarul</li>
                </ul>
                <p className="bg-yellow-50 p-3 rounded-lg text-yellow-800"><strong>⚠️ Nota:</strong> Prețurile sunt momentan <strong>dezactivate</strong>. Le poți activa bifând "Afișează Prețurile în Frontend" când studioul e deschis legal.</p>

                <p className="font-semibold mt-3">🔹 Legal</p>
                <p>Încarcă PDF-urile cu Politica de Confidențialitate și Politica Cookie. Acestea apar în footer-ul site-ului.</p>
              </div>
            </details>

            {/* Utilizatori */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Utilizatori</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/users</span></p>
                <p><strong>🔒 Vizibil doar pentru admin</strong></p>
                <p><strong>📋 Ce poți face:</strong> Gestionare conturi utilizatori (adaugă, editează, șterge), schimbare roluri (admin/specialist)</p>
                <p><strong>🔗 Ce afectează:</strong> Cine are acces la CMS. Un utilizator nou poate primi acces la panoul de control.</p>
              </div>
            </details>

            {/* Recenzii */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Recenzii</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/reviews</span></p>
                <p><strong>📋 Ce poți face:</strong> Aproba, respinge, editează, reordonează, șterge recenzii</p>
                <p><strong>🔗 Ce afectează frontend:</strong> Secțiunea "Recenzii" de pe homepage. Doar recenziile aprobate apar public.</p>
                <p className="bg-blue-50 p-3 rounded-lg text-blue-800"><strong>💡 Sfat:</strong> Poți "pune în evidență" recenzii importante ca să apară primele.</p>
              </div>
            </details>

            {/* Locații */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Locații</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>📍 Unde:</strong> <span className="text-primary-600">/cms/locations</span></p>
                <p><strong>📋 Ce poți face:</strong> Adaugă, editează, șterge sedii/locații ale salonului</p>
                <p><strong>🔗 Ce afectează frontend:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Booking (pasul 1) — clientul alege locația</li>
                  <li>Contact — harta și adresa pe site</li>
                  <li>Footer — lista sediilor</li>
                </ul>
              </div>
            </details>

            {/* Booking clienți */}
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex items-center gap-3 cursor-pointer select-none p-4 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold text-sm flex-1">Booking (rezervare clienți)</span>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                <p><strong>🔗 Link public:</strong> <span className="text-primary-600">/booking</span></p>
                <p><strong>📋 Pașii rezervării:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>Locație</strong> — clientul alege salonul (dacă ai mai multe sedii)</li>
                  <li><strong>Serviciu</strong> — alege din serviciile tale</li>
                  <li><strong>Specialist</strong> — alege specialistul disponibil</li>
                  <li><strong>Dată</strong> — calendar cu zilele disponibile</li>
                  <li><strong>Oră</strong> — alege ora liberă</li>
                  <li><strong>Confirmare</strong> — completează nume, telefon, email, note</li>
                </ol>
                <p><strong>🎯 Ce setări din CMS influențează booking-ul:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Aspect → Texte în rezervare</strong> — titlurile pașilor</li>
                  <li><strong>Aspect → Funcționalități</strong> — activează/dezactivează programări</li>
                  <li><strong>Aspect → Funcționalități</strong> — arată/ascunde prețurile</li>
                  <li><strong>Servicii</strong> — ce servicii poate alege clientul</li>
                  <li><strong>Specialiști</strong> — cine e disponibil</li>
                  <li><strong>Disponibilitate</strong> — concedii și zile libere</li>
                  <li><strong>Orar</strong> — programul săptămânal</li>
                  <li><strong>Locații</strong> — ce sedii apar</li>
                </ul>
              </div>
            </details>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-1">📱 CMS pe mobil</p>
            <p>Meniul din partea de jos poate fi deschis/chis cu săgeata sus/jos. Profilul tău e în dreapta sus în antet — apasă pe numele tău pentru a vedea "Profilul meu" și "Deconectare".</p>
          </div>
        </Card>}

        {/* Spazio per bottom nav */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
