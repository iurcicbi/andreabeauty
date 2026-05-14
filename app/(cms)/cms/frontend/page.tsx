'use client';

import { useState, useEffect } from 'react';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import webservice from '@/utils/webservice';
import Tabs from '@/componenti/comuni/Tabs';
import { 
  Settings, 
  Image as ImageIcon, 
  Trash2, 
  Save, 
  MapPin,
  Building,
  Clock,
  Smartphone,
  Upload
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

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  const caricaImpostazioni = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/impostazioni');
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
      await webservice.put('/api/impostazioni', impostazioni);

      setSuccesso('Impostazioni salvate con successo!');
      await caricaImpostazioni();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore nel salvataggio');
    } finally {
      setSalvando(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>, tipoLogo: 'logo' | 'logoCentrale' | 'logoCMS') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione client-side
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrore('Formato immagine non supportato. Usa JPG, PNG, GIF, WEBP o SVG');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrore('Immagine troppo grande. Massimo 10MB');
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
      await webservice.put('/api/impostazioni', nuoveImpostazioni);
      
      // Pulisci la cache per forzare il refresh
      sessionStorage.removeItem('logoCMS');
      sessionStorage.removeItem('nomeAzienda');
      
      setSuccesso('Logo caricato e salvato con successo!');
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
          Impostazioni Frontend
        </h1>
        <p className="text-gray-600">Gestisci logo, informazioni aziendali e social media</p>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      <div className="space-y-6">
        {/* INFORMAZIONI AZIENDALI */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informazioni Aziendali
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Nome Azienda <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={impostazioni.nomeAzienda}
                onChange={(e) => setImpostazioni({ ...impostazioni, nomeAzienda: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:border-primary-500 focus:outline-none"
                placeholder="Es: Barbershop Premium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={impostazioni.tagline || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, tagline: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Es: Il tuo stile, la nostra passione"
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
                placeholder="info@barbershop.it"
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
                placeholder="+39 333 1234567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={impostazioni.indirizzo || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, indirizzo: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Via Roma 123"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Città
              </label>
              <input
                type="text"
                value={impostazioni.citta || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, citta: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Roma"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                CAP
              </label>
              <input
                type="text"
                value={impostazioni.cap || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, cap: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="00100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Provincia
              </label>
              <input
                type="text"
                value={impostazioni.provincia || ''}
                onChange={(e) => setImpostazioni({ ...impostazioni, provincia: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="RM"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Paese
              </label>
              <input
                type="text"
                value={impostazioni.paese || 'Italia'}
                onChange={(e) => setImpostazioni({ ...impostazioni, paese: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="Italia"
              />
            </div>
          </div>
        </Card>

        {/* POSIZIONE E MAPPA */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Posizione e Mappa
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Suggerimento:</strong> Inserisci le coordinate GPS per mostrare la tua posizione su Google Maps.
                Puoi trovarle su <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> 
                (click destro → "Cosa c'è qui?")
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
                  placeholder="Es: 41.9028"
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
                  placeholder="Es: 12.4964"
                />
              </div>
            </div>

            {impostazioni.coordinate?.lat && impostazioni.coordinate?.lng && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-bold mb-2">Anteprima Mappa:</p>
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
                    → Apri in Google Maps
                  </a>
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, coordinate: undefined })}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Rimuovi coordinate
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ORARI DI APERTURA */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Orari di Apertura
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
                  placeholder="Es: 09:00 - 19:00 oppure Chiuso"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* LOGHI */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Loghi
          </h2>
          
          <div className="space-y-6">
            {/* Logo Header/Footer */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold mb-3">Logo Header e Footer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Questo logo verrà mostrato nella barra di navigazione e nel footer del sito
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
                        {uploadingLogo === 'logo' ? 'Caricamento...' : 'Clicca per caricare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Oppure inserisci URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logo || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logo: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://esempio.com/logo.png"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-bold mb-2">
                  Testo alternativo (per accessibilità)
                </label>
                <input
                  type="text"
                  value={impostazioni.logoAlt || ''}
                  onChange={(e) => setImpostazioni({ ...impostazioni, logoAlt: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                  placeholder="Es: Logo Barbershop"
                />
              </div>

              {impostazioni.logo && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Anteprima:</p>
                  <img 
                    src={impostazioni.logo} 
                    alt={impostazioni.logoAlt || "Logo"} 
                    className="max-h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Errore caricamento logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logo: '', logoAlt: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Rimuovi logo
                  </button>
                </div>
              )}
            </div>

            {/* Logo Centrale Homepage */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold mb-3">Logo Centrale Homepage (Opzionale)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Logo grande da mostrare al centro della homepage. Se non specificato, verrà usato il logo principale
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
                        {uploadingLogo === 'logoCentrale' ? 'Caricamento...' : 'Clicca per caricare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Oppure inserisci URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logoCentrale || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logoCentrale: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://esempio.com/logo-grande.png"
                  />
                </div>
              </div>

              {impostazioni.logoCentrale && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Anteprima:</p>
                  <img 
                    src={impostazioni.logoCentrale} 
                    alt="Logo Centrale" 
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Errore caricamento logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logoCentrale: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Rimuovi logo
                  </button>
                </div>
              )}
            </div>

            {/* Logo CMS Sidebar */}
            <div>
              <h3 className="text-lg font-bold mb-3">Logo Sidebar CMS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Logo da mostrare nella sidebar del pannello CMS. Se non specificato, verrà usato il logo principale
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
                        {uploadingLogo === 'logoCMS' ? 'Caricamento...' : 'Clicca per caricare'}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF, WEBP, SVG (max 10MB)
                      </span>
                    </div>
                  </div>
                </label>
                
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">
                    Oppure inserisci URL
                  </label>
                  <input
                    type="url"
                    value={impostazioni.logoCMS || ''}
                    onChange={(e) => setImpostazioni({ ...impostazioni, logoCMS: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                    placeholder="https://esempio.com/logo-cms.png"
                  />
                </div>
              </div>

              {impostazioni.logoCMS && (
                <div className="bg-gray-50 rounded-lg p-4 mt-3">
                  <p className="text-sm font-bold mb-2">Anteprima:</p>
                  <img 
                    src={impostazioni.logoCMS} 
                    alt="Logo CMS" 
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Errore caricamento logo';
                    }}
                  />
                  <button
                    onClick={() => setImpostazioni({ ...impostazioni, logoCMS: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Rimuovi logo
                  </button>
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
                placeholder="https://facebook.com/tuapagina"
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
                placeholder="https://instagram.com/tuoprofilo"
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
                placeholder="https://twitter.com/tuoprofilo"
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
                placeholder="https://linkedin.com/company/tuaazienda"
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
                placeholder="https://tiktok.com/@tuoprofilo"
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
                placeholder="https://youtube.com/@tuocanale"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold mb-2">
              WhatsApp (numero con prefisso internazionale)
            </label>
            <input
              type="tel"
              value={impostazioni.whatsapp || ''}
              onChange={(e) => setImpostazioni({ ...impostazioni, whatsapp: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              placeholder="+393331234567"
            />
            <p className="text-xs text-gray-500 mt-1">
              Numero con prefisso internazionale (senza spazi)
            </p>
          </div>
        </Card>

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
              Ripristina
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
                Salvataggio...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salva Impostazioni
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
              Ripristina
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
                Salvataggio...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salva
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
