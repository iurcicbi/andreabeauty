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
  ToggleLeft
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
  coordinate?: {
    lat: number;
    lng: number;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  orariApertura?: {
    lunedi?: string;
    martedi?: string;
    mercoledi?: string;
    giovedi?: string;
    venerdi?: string;
    sabato?: string;
    domenica?: string;
  };
  seo?: {
    titoloPagina?: string;
    descrizioneMeta?: string;
    keywords?: string;
    ogImage?: string;
  };
  testiHomepage?: {
    titoloHero?: string;
    sottotitoloHero?: string;
    badgeHero?: string;
    testoCtaPrimario?: string;
    testoCtaSecondario?: string;
    titoloServizi?: string;
    sottotitoloServizi?: string;
    titoloOrari?: string;
    sottotitoloOrari?: string;
    titoloCtaFinale?: string;
    sottotitoloCtaFinale?: string;
  };
  testiPrenotazione?: {
    titoloPagina?: string;
    sottotitoloPagina?: string;
    stepLocatie?: string;
    stepSpecialist?: string;
    stepServizio?: string;
    stepData?: string;
    stepOrario?: string;
    stepConferma?: string;
  };
  funzionalita?: {
    mostraOrari?: boolean;
    mostraServizi?: boolean;
    mostraSocial?: boolean;
    mostraContatti?: boolean;
    abilitaPrenotazioni?: boolean;
    mostraPrezziFrontend?: boolean;
    richiestaConfermaEmail?: boolean;
    oreAnticipo?: number;
  };
}

export default function FrontendPage() {
  const [impostazioni, setImpostazioni] = useState<ImpostazioniFrontend>({
    nomeAzienda: '',
  });
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [tabAttiva, setTabAttiva] = useState<string>('generale');

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  const caricaImpostazioni = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/settings');
      if (risposta.dati) {
        setImpostazioni(risposta.dati);
      }
    } catch (err: any) {
      console.log('Nessuna impostazione trovata, uso valori default');
    } finally {
      setCaricamento(false);
    }
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      setErrore('');

      // L'API impostazioni gestisce automaticamente update o create
      await webservice.put('/api/settings', impostazioni);

      setSuccesso('Setări salvate cu succes!');
      await caricaImpostazioni();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore nel salvataggio');
    } finally {
      setSalvando(false);
    }
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

    // Validazione client-side
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrore('Format imagine neacceptat. Folosește JPG, PNG, GIF, WEBP sau SVG');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrore('Imagine prea mare. Maxim 10MB');
      return;
    }

    try {
      setUploadingLogo(tipoLogo);
      setErrore('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'logo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errore || 'Errore upload');
      }

      setImpostazioni({ ...impostazioni, [tipoLogo]: data.url });
      
      // Salva automaticamente nel database
      const nuoveImpostazioni = { ...impostazioni, [tipoLogo]: data.url };
      await webservice.put('/api/settings', nuoveImpostazioni);
      
      // Pulisci la cache per forzare il refresh
      sessionStorage.removeItem('logoCMS');
      sessionStorage.removeItem('nomeAzienda');
      
      setSuccesso('Logo încărcat și salvat cu succes!');
    } catch (err: any) {
      setErrore(err.message || 'Errore durante il caricamento del logo');
    } finally {
      setUploadingLogo(null);
    }
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Caricamento />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-7 h-7" />
          Aspect
        </h1>
        <p className="text-gray-600">Gestionează logo, informații companie și social media</p>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* TABS */}
      <div className="border-b border-gray-200 mb-6 md:mb-8">
        <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
          {[
            { id: 'generale', label: 'General', icon: Building },
            { id: 'orar', label: 'Orar', icon: Clock },
            { id: 'testi', label: 'Texte', icon: FileText },
            { id: 'seo', label: 'SEO', icon: Search },
            { id: 'funzionalita', label: 'Funcționalități', icon: ToggleLeft },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabAttiva(tab.id)}
              className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                tabAttiva === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* GENERALE */}
        {tabAttiva === 'generale' && <>
        {/* INFORMAZIONI AZIENDALI */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informații Companie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Nume Companie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={impostazioni.nomeAzienda}
                onChange={(e) => setImpostazioni({ ...impostazioni, nomeAzienda: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:border-primary-500 focus:outline-none"
                placeholder="Ex: Beauty Salon Premium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={impostazioni.tagline || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, tagline: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Ex: Stilul tău, pasiunea noastră"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                Descriere
              </label>
              <textarea
                value={impostazioni.descrizione || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, descrizione: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                rows={3}
                placeholder="Scurtă descriere a salonului tău"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={impostazioni.email || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="info@beautysalon.ro"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Telefono
              </label>
              <input
                type="tel"
                value={impostazioni.telefono || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, telefono: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="+40 712 345 678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                Adresă
              </label>
              <input
                type="text"
                value={impostazioni.indirizzo || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, indirizzo: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Strada Exemplu 123"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Oraș
              </label>
              <input
                type="text"
                value={impostazioni.citta || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, citta: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="București"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Cod Poștal
              </label>
              <input
                type="text"
                value={impostazioni.cap || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, cap: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="010101"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Județ
              </label>
              <input
                type="text"
                value={impostazioni.provincia || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, provincia: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="B"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Țară
              </label>
              <input
                type="text"
                value={impostazioni.paese || 'Italia'}
                onChange={(e) => setImpostazioni({ ...impostazioni, paese: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="România"
              />
            </div>
          </div>
        </Card>

        {/* POSIZIONE E MAPPA */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Locație și Hartă
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Sugestie:</strong> Introdu coordonatele GPS pentru a-ți afișa poziția pe Google Maps.
                Le poți găsi pe <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> 
                (clic dreapta → &lsquo;Ce este aici?&rsquo;)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Latitudine
                </label>
                <input
                  type="number"
                  step="any"
                  value={impostazioni.coordinate?.lat || ''}
                  onChange={(e) => setImpostazioni({ 
                    ...impostazioni, 
                    coordinate: { 
                      ...impostazioni.coordinate,
                      lat: parseFloat(e.target.value) || 0,
                      lng: impostazioni.coordinate?.lng || 0
                    } 
                  })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: 44.4268"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Longitudine
                </label>
                <input
                  type="number"
                  step="any"
                  value={impostazioni.coordinate?.lng || ''}
                  onChange={(e) => setImpostazioni({ 
                    ...impostazioni, 
                    coordinate: { 
                      lat: impostazioni.coordinate?.lat || 0,
                      lng: parseFloat(e.target.value) || 0
                    } 
                  })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: 26.1025"
                />
              </div>
            </div>

            {impostazioni.coordinate?.lat && impostazioni.coordinate?.lng && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-bold mb-2">Previzualizare Hartă:</p>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    → Deschide în Google Maps
                  </a>
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, coordinate: undefined })}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Elimină coordonate
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
        </>}

        {/* ORAR */}
        {tabAttiva === 'orar' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Orar de Lucru
          </h2>
          
          <div className="space-y-3">
            {['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'].map((giorno) => (
              <div key={giorno} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className="text-sm font-bold capitalize">
                  {giorno.charAt(0).toUpperCase() + giorno.slice(1)}
                </label>
                <input
                  type="text"
                  value={impostazioni.orariApertura?.[giorno as keyof typeof impostazioni.orariApertura] || ''}
                  onChange={(e) => setImpostazioni({ 
                    ...impostazioni, 
                    orariApertura: {
                      ...impostazioni.orariApertura,
                      [giorno]: e.target.value
                    }
                  })}
                  className="md:col-span-2 w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: 09:00 - 19:00 sau Închis"
                />
              </div>
            ))}
          </div>
        </Card>}

        {/* GENERALE (continuare) */}
        {tabAttiva === 'generale' && <>
        {/* LOGHI */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo-uri
          </h2>
          
          <div className="space-y-6">
            {/* Logo Header/Footer */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold mb-3">Logo Header și Footer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Acest logo va fi afișat în bara de navigare și în footer-ul site-ului
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadLogo(e, 'logo')}
                      className="hidden"
                      disabled={uploadingLogo === 'logo'}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadingLogo === 'logo' ? 'Încărcare...' : 'Click pentru încărcare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Sau introdu URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logo || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logo: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://exemplu.com/logo.png"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-bold mb-2">
                  Text alternativ (pentru accesibilitate)
                </label>
                <input
                  type="text"
                  value={impostazioni.logoAlt || ''}
                  onChange={(e) => setImpostazioni({ ...impostazioni, logoAlt: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Ex: Logo Beauty Salon"
                />
              </div>

              {impostazioni.logo && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Previzualizare:</p>
                  <img 
                    src={impostazioni.logo} 
                    alt={impostazioni.logoAlt || "Logo"} 
                    className="max-h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Eroare încărcare logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logo: '', logoAlt: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Elimină logo
                  </button>
                </div>
              )}
            </div>

            {/* Logo Centrale Homepage */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold mb-3">Logo Central Pagina Principală (Opțional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Logo mare de afișat în centrul paginii principale. Dacă nu este specificat, se va folosi logo-ul principal
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadLogo(e, 'logoCentrale')}
                      className="hidden"
                      disabled={uploadingLogo === 'logoCentrale'}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadingLogo === 'logoCentrale' ? 'Încărcare...' : 'Click pentru încărcare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Sau introdu URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logoCentrale || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logoCentrale: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://exemplu.com/logo-mare.png"
                  />
                </div>
              </div>

              {impostazioni.logoCentrale && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Previzualizare:</p>
                  <img 
                    src={impostazioni.logoCentrale} 
                    alt="Logo Centrale" 
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Eroare încărcare logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logoCentrale: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Elimină logo
                  </button>
                </div>
              )}
            </div>

            {/* Logo CMS Sidebar */}
            <div>
              <h3 className="text-lg font-bold mb-3">Logo Bară Laterală CMS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Logo de afișat în bara laterală a panoului CMS. Dacă nu este specificat, se va folosi logo-ul principal
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadLogo(e, 'logoCMS')}
                      className="hidden"
                      disabled={uploadingLogo === 'logoCMS'}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadingLogo === 'logoCMS' ? 'Încărcare...' : 'Click pentru încărcare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Sau introdu URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logoCMS || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logoCMS: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://exemplu.com/logo-cms.png"
                  />
                </div>
              </div>

              {impostazioni.logoCMS && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Previzualizare:</p>
                  <img 
                    src={impostazioni.logoCMS} 
                    alt="Logo CMS" 
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Eroare încărcare logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logoCMS: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Elimină logo
                  </button>
                </div>
              )}
            </div>

            {/* Favicon */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold mb-3">Favicon</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pictograma care apare în fila browser-ului (recomandat: 32x32px)
              </p>
              <input
                type="url"
                value={impostazioni.favicon || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, favicon: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://exemplu.com/favicon.ico"
              />
              {impostazioni.favicon && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Previzualizare:</p>
                  <img 
                    src={impostazioni.favicon} 
                    alt="Favicon" 
                    className="h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Eroare încărcare favicon';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* SOCIAL MEDIA */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Social Media
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={impostazioni.social?.facebook || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    facebook: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://facebook.com/pagina ta"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={impostazioni.social?.instagram || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    instagram: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://instagram.com/profilul tau"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={impostazioni.social?.twitter || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    twitter: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://twitter.com/profilul tau"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={impostazioni.social?.linkedin || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    linkedin: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://linkedin.com/company/compania ta"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                TikTok
              </label>
              <input
                type="url"
                value={impostazioni.social?.tiktok || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    tiktok: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://tiktok.com/@profilul tau"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                YouTube
              </label>
              <input
                type="url"
                value={impostazioni.social?.youtube || ''}
                onChange={(e) => setImpostazioni({ 
                  ...impostazioni, 
                  social: {
                    ...impostazioni.social,
                    youtube: e.target.value
                  }
                })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="https://youtube.com/@canalul tau"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold mb-2">
              WhatsApp (număr cu prefix internațional)
            </label>
            <input
              type="tel"
              value={impostazioni.whatsapp || ''}
              onChange={(e) => setImpostazioni({ ...impostazioni, whatsapp: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              placeholder="+40712345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Număr cu prefix internațional (fără spații)
            </p>
          </div>
        </Card>
        </>}

        {/* TESTI */}
        {tabAttiva === 'testi' && <>
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Texte Pagina Principală
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Insignă Hero</label>
              <input type="text" value={impostazioni.testiHomepage?.badgeHero || ''} onChange={(e) => aggiorna('testiHomepage.badgeHero', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Titlu Hero (lasă gol pentru a folosi numele companiei)</label>
              <input type="text" value={impostazioni.testiHomepage?.titoloHero || ''} onChange={(e) => aggiorna('testiHomepage.titoloHero', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Subtitlu Hero (lasă gol pentru a folosi sloganul)</label>
              <input type="text" value={impostazioni.testiHomepage?.sottotitoloHero || ''} onChange={(e) => aggiorna('testiHomepage.sottotitoloHero', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Text CTA Principal</label>
                <input type="text" value={impostazioni.testiHomepage?.testoCtaPrimario || ''} onChange={(e) => aggiorna('testiHomepage.testoCtaPrimario', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Text CTA Secundar</label>
                <input type="text" value={impostazioni.testiHomepage?.testoCtaSecondario || ''} onChange={(e) => aggiorna('testiHomepage.testoCtaSecondario', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Texte Rezervare
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Titlu Pagină</label>
              <input type="text" value={impostazioni.testiPrenotazione?.titoloPagina || ''} onChange={(e) => aggiorna('testiPrenotazione.titoloPagina', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Subtitlu Pagină</label>
              <input type="text" value={impostazioni.testiPrenotazione?.sottotitoloPagina || ''} onChange={(e) => aggiorna('testiPrenotazione.sottotitoloPagina', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Locație</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepLocatie || ''} onChange={(e) => aggiorna('testiPrenotazione.stepLocatie', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Specialist</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepSpecialist || ''} onChange={(e) => aggiorna('testiPrenotazione.stepSpecialist', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Serviciu</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepServizio || ''} onChange={(e) => aggiorna('testiPrenotazione.stepServizio', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Dată</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepData || ''} onChange={(e) => aggiorna('testiPrenotazione.stepData', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Orar</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepOrario || ''} onChange={(e) => aggiorna('testiPrenotazione.stepOrario', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Step Confirmare</label>
              <input type="text" value={impostazioni.testiPrenotazione?.stepConferma || ''} onChange={(e) => aggiorna('testiPrenotazione.stepConferma', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
          </div>
        </Card>
        </>}

        {/* SEO */}
        {tabAttiva === 'seo' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO și Metadate
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Titlu Pagină</label>
              <input type="text" value={impostazioni.seo?.titoloPagina || ''} onChange={(e) => aggiorna('seo.titoloPagina', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Descriere Meta</label>
              <textarea value={impostazioni.seo?.descrizioneMeta || ''} onChange={(e) => aggiorna('seo.descrizioneMeta', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Cuvinte cheie (separate prin virgulă)</label>
              <input type="text" value={impostazioni.seo?.keywords || ''} onChange={(e) => aggiorna('seo.keywords', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Imagine Open Graph</label>
              <input type="url" value={impostazioni.seo?.ogImage || ''} onChange={(e) => aggiorna('seo.ogImage', e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none" placeholder="https://exemplu.com/og-image.jpg" />
            </div>
          </div>
        </Card>}

        {/* FUNCȚIONALITĂȚI */}
        {tabAttiva === 'funzionalita' && <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ToggleLeft className="w-5 h-5" />
            Funcționalități
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
                <input
                  type="checkbox"
                  checked={Boolean(impostazioni.funzionalita?.[func.key as keyof typeof impostazioni.funzionalita] ?? true)}
                  onChange={(e) => aggiorna(`funzionalita.${func.key}`, e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">{func.label}</span>
              </label>
            ))}
          </div>
        </Card>}

        {/* AZIONI - Desktop */}
        <div className="hidden sm:flex flex-row gap-3 justify-end">
          <Bottone
            variante="secondary"
            onClick={caricaImpostazioni}
            disabled={salvando}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Resetează
            </span>
          </Bottone>
          <Bottone
            variante="primary"
            onClick={handleSalva}
            disabled={salvando || !impostazioni.nomeAzienda}
          >
            {salvando ? (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvare...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvează Setări
              </span>
            )}
          </Bottone>
        </div>

        {/* Spazio per il pulsante fisso mobile */}
        <div className="sm:hidden h-32"></div>
      </div>

      {/* PULSANTE SALVA FISSO - Mobile */}
      <div className="sm:hidden fixed bottom-28 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex gap-3">
          <button
            onClick={caricaImpostazioni}
            disabled={salvando}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg disabled:opacity-50 active:bg-gray-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Resetează
            </span>
          </button>
          <button
            onClick={handleSalva}
            disabled={salvando || !impostazioni.nomeAzienda}
            className="flex-[2] px-4 py-3 bg-primary-600 text-white font-bold rounded-lg disabled:opacity-50 active:bg-primary-700 transition-colors"
          >
            {salvando ? (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvare...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvează
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
