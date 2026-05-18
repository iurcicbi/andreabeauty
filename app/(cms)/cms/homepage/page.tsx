'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, MoveUp, MoveDown, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import webservice from '@/utils/webservice';

export default function GestioneHomepage() {
  const [impostazioni, setImpostazioni] = useState<any>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [messaggio, setMessaggio] = useState<{ tipo: 'success' | 'error'; testo: string } | null>(null);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);
    } catch (err) {
      console.error('Errore caricamento:', err);
      setMessaggio({ tipo: 'error', testo: 'Errore nel caricamento delle impostazioni' });
    } finally {
      setCaricamento(false);
    }
  };

  const salvaImpostazioni = async () => {
    setSalvando(true);
    setMessaggio(null);
    
    try {
      await webservice.put('/api/settings', impostazioni);
      setMessaggio({ tipo: 'success', testo: 'Impostazioni salvate con successo!' });
      setTimeout(() => setMessaggio(null), 3000);
    } catch (err) {
      console.error('Errore salvataggio:', err);
      setMessaggio({ tipo: 'error', testo: 'Errore nel salvataggio delle impostazioni' });
    } finally {
      setSalvando(false);
    }
  };

  const aggiornaSezione = (sezione: string, campo: string, valore: any) => {
    setImpostazioni((prev: any) => ({
      ...prev,
      sezioniHomepage: {
        ...prev.sezioniHomepage,
        [sezione]: {
          ...prev.sezioniHomepage?.[sezione],
          [campo]: valore
        }
      }
    }));
  };

  const toggleSezione = (sezione: string) => {
    const attuale = impostazioni?.sezioniHomepage?.[sezione]?.attiva;
    aggiornaSezione(sezione, 'attiva', !attuale);
  };

  const cambiaOrdine = (sezione: string, direzione: 'su' | 'giu') => {
    const ordineAttuale = impostazioni?.sezioniHomepage?.[sezione]?.ordine || 0;
    const nuovoOrdine = direzione === 'su' ? ordineAttuale - 1 : ordineAttuale + 1;
    aggiornaSezione(sezione, 'ordine', nuovoOrdine);
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const sezioni = impostazioni?.sezioniHomepage || {};

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestione Homepage</h1>
        <p className="text-gray-600">Personalizza le sezioni della tua homepage</p>
      </div>

      {/* Messaggio */}
      {messaggio && (
        <div className={`mb-6 p-4 rounded-lg ${
          messaggio.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {messaggio.testo}
        </div>
      )}

      {/* Pulsante Salva Globale */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={salvaImpostazioni}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvataggio...' : 'Salva Tutte le Modifiche'}
        </button>
      </div>

      {/* Sezioni */}
      <div className="space-y-6">
        {/* HERO */}
        <SezioneCard
          titolo="Hero Section"
          descrizione="Sezione principale con logo e CTA"
          attiva={sezioni.hero?.attiva !== false}
          ordine={sezioni.hero?.ordine || 1}
          onToggle={() => toggleSezione('hero')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('hero', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.hero?.titolo || ''}
              onChange={(v) => aggiornaSezione('hero', 'titolo', v)}
              placeholder="BEAUTY SALON"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.hero?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('hero', 'sottotitolo', v)}
              placeholder="Il tuo stile, la nostra passione"
            />
            <InputField
              label="Badge"
              value={sezioni.hero?.badge || ''}
              onChange={(v) => aggiornaSezione('hero', 'badge', v)}
              placeholder="Premium Beauty Salon"
            />
            <InputField
              label="Testo CTA Primario"
              value={sezioni.hero?.testoCtaPrimario || ''}
              onChange={(v) => aggiornaSezione('hero', 'testoCtaPrimario', v)}
              placeholder="PRENOTA APPUNTAMENTO"
            />
            <InputField
              label="Testo CTA Secondario"
              value={sezioni.hero?.testoCtaSecondario || ''}
              onChange={(v) => aggiornaSezione('hero', 'testoCtaSecondario', v)}
              placeholder="DOVE SIAMO"
            />
            <InputField
              label="Immagine Background (URL)"
              value={sezioni.hero?.immagineBackground || ''}
              onChange={(v) => aggiornaSezione('hero', 'immagineBackground', v)}
              placeholder="https://..."
              icon={<ImageIcon className="w-4 h-4" />}
            />
          </div>
          <div className="mt-4 flex gap-4">
            <CheckboxField
              label="Mostra Logo"
              checked={sezioni.hero?.mostraLogo !== false}
              onChange={(v) => aggiornaSezione('hero', 'mostraLogo', v)}
            />
            <CheckboxField
              label="Mostra Info Rapide"
              checked={sezioni.hero?.mostraInfoRapide !== false}
              onChange={(v) => aggiornaSezione('hero', 'mostraInfoRapide', v)}
            />
          </div>
        </SezioneCard>

        {/* SERVIZI */}
        <SezioneCard
          titolo="Sezione Servizi"
          descrizione="Mostra i tuoi servizi in griglia"
          attiva={sezioni.servizi?.attiva !== false}
          ordine={sezioni.servizi?.ordine || 2}
          onToggle={() => toggleSezione('servizi')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('servizi', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.servizi?.titolo || ''}
              onChange={(v) => aggiornaSezione('servizi', 'titolo', v)}
              placeholder="I NOSTRI SERVIZI"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.servizi?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('servizi', 'sottotitolo', v)}
              placeholder="Qualità e professionalità"
            />
            <SelectField
              label="Layout Griglia"
              value={sezioni.servizi?.layoutGriglia || 'grid-3'}
              onChange={(v) => aggiornaSezione('servizi', 'layoutGriglia', v)}
              options={[
                { value: 'grid-2', label: '2 Colonne' },
                { value: 'grid-3', label: '3 Colonne' },
                { value: 'grid-4', label: '4 Colonne' }
              ]}
            />
          </div>
          <TextareaField
            label="Descrizione"
            value={sezioni.servizi?.descrizione || ''}
            onChange={(v) => aggiornaSezione('servizi', 'descrizione', v)}
            placeholder="Descrizione opzionale..."
          />
          <div className="mt-4 flex gap-4">
            <CheckboxField
              label="Mostra Prezzi"
              checked={sezioni.servizi?.mostraPrezzi !== false}
              onChange={(v) => aggiornaSezione('servizi', 'mostraPrezzi', v)}
            />
            <CheckboxField
              label="Mostra Durata"
              checked={sezioni.servizi?.mostraDurata !== false}
              onChange={(v) => aggiornaSezione('servizi', 'mostraDurata', v)}
            />
          </div>
        </SezioneCard>

        {/* CHI SIAMO */}
        <SezioneCard
          titolo="Chi Siamo"
          descrizione="Racconta la tua storia"
          attiva={sezioni.about?.attiva !== false}
          ordine={sezioni.about?.ordine || 3}
          onToggle={() => toggleSezione('about')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('about', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.about?.titolo || ''}
              onChange={(v) => aggiornaSezione('about', 'titolo', v)}
              placeholder="CHI SIAMO"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.about?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('about', 'sottotitolo', v)}
              placeholder="La nostra storia"
            />
          </div>
          <TextareaField
            label="Descrizione"
            value={sezioni.about?.descrizione || ''}
            onChange={(v) => aggiornaSezione('about', 'descrizione', v)}
            placeholder="Racconta la tua storia..."
            rows={4}
          />
          <InputField
            label="Immagine (URL)"
            value={sezioni.about?.immagine || ''}
            onChange={(v) => aggiornaSezione('about', 'immagine', v)}
            placeholder="https://..."
            icon={<ImageIcon className="w-4 h-4" />}
          />
          
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-3">Statistiche</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <InputField
                  label="Anni - Valore"
                  value={sezioni.about?.statistiche?.anni?.valore || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    anni: { ...sezioni.about?.statistiche?.anni, valore: v }
                  })}
                  placeholder="10+"
                />
                <InputField
                  label="Anni - Label"
                  value={sezioni.about?.statistiche?.anni?.label || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    anni: { ...sezioni.about?.statistiche?.anni, label: v }
                  })}
                  placeholder="Anni Esperienza"
                />
              </div>
              <div>
                <InputField
                  label="Clienti - Valore"
                  value={sezioni.about?.statistiche?.clienti?.valore || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    clienti: { ...sezioni.about?.statistiche?.clienti, valore: v }
                  })}
                  placeholder="5K+"
                />
                <InputField
                  label="Clienti - Label"
                  value={sezioni.about?.statistiche?.clienti?.label || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    clienti: { ...sezioni.about?.statistiche?.clienti, label: v }
                  })}
                  placeholder="Clienti Felici"
                />
              </div>
              <div>
                <InputField
                  label="Qualità - Valore"
                  value={sezioni.about?.statistiche?.qualita?.valore || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    qualita: { ...sezioni.about?.statistiche?.qualita, valore: v }
                  })}
                  placeholder="100%"
                />
                <InputField
                  label="Qualità - Label"
                  value={sezioni.about?.statistiche?.qualita?.label || ''}
                  onChange={(v) => aggiornaSezione('about', 'statistiche', {
                    ...sezioni.about?.statistiche,
                    qualita: { ...sezioni.about?.statistiche?.qualita, label: v }
                  })}
                  placeholder="Professionalità"
                />
              </div>
            </div>
          </div>
        </SezioneCard>

        {/* ORARI */}
        <SezioneCard
          titolo="Orari di Apertura"
          descrizione="Mostra gli orari del tuo salone"
          attiva={sezioni.orari?.attiva !== false}
          ordine={sezioni.orari?.ordine || 4}
          onToggle={() => toggleSezione('orari')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('orari', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.orari?.titolo || ''}
              onChange={(v) => aggiornaSezione('orari', 'titolo', v)}
              placeholder="ORARI DI APERTURA"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.orari?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('orari', 'sottotitolo', v)}
              placeholder="Siamo qui per te"
            />
          </div>
          <TextareaField
            label="Descrizione (opzionale)"
            value={sezioni.orari?.descrizione || ''}
            onChange={(v) => aggiornaSezione('orari', 'descrizione', v)}
            placeholder="Descrizione opzionale..."
          />
        </SezioneCard>

        {/* RECENSIONI */}
        <SezioneCard
          titolo="Recensioni"
          descrizione="Mostra le recensioni dei clienti"
          attiva={sezioni.recensioni?.attiva !== false}
          ordine={sezioni.recensioni?.ordine || 5}
          onToggle={() => toggleSezione('recensioni')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('recensioni', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.recensioni?.titolo || ''}
              onChange={(v) => aggiornaSezione('recensioni', 'titolo', v)}
              placeholder="Cosa dicono i nostri clienti"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.recensioni?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('recensioni', 'sottotitolo', v)}
              placeholder="Le tue opinioni contano"
            />
          </div>
          <InputField
            label="Numero Massimo Recensioni"
            value={String(sezioni.recensioni?.numeroMassimo ?? 6)}
            onChange={(v) => aggiornaSezione('recensioni', 'numeroMassimo', Number(v) || 6)}
            placeholder="6"
          />
        </SezioneCard>

        {/* CONTATTI */}
        <SezioneCard
          titolo="Contatti"
          descrizione="Informazioni di contatto"
          attiva={sezioni.contatti?.attiva !== false}
          ordine={sezioni.contatti?.ordine || 6}
          onToggle={() => toggleSezione('contatti')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('contatti', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.contatti?.titolo || ''}
              onChange={(v) => aggiornaSezione('contatti', 'titolo', v)}
              placeholder="CONTATTACI"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.contatti?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('contatti', 'sottotitolo', v)}
              placeholder="Siamo qui per te"
            />
          </div>
          <InputField
            label="URL Mappa Google (iframe src)"
            value={sezioni.contatti?.urlMappa || ''}
            onChange={(v) => aggiornaSezione('contatti', 'urlMappa', v)}
            placeholder="https://www.google.com/maps/embed?..."
          />
          <div className="mt-4 flex gap-4">
            <CheckboxField
              label="Mostra Mappa"
              checked={sezioni.contatti?.mostraMappa !== false}
              onChange={(v) => aggiornaSezione('contatti', 'mostraMappa', v)}
            />
            <CheckboxField
              label="Mostra Social"
              checked={sezioni.contatti?.mostraSocial !== false}
              onChange={(v) => aggiornaSezione('contatti', 'mostraSocial', v)}
            />
          </div>
        </SezioneCard>

        {/* CTA FINALE */}
        <SezioneCard
          titolo="CTA Finale"
          descrizione="Call-to-action finale"
          attiva={sezioni.ctaFinale?.attiva !== false}
          ordine={sezioni.ctaFinale?.ordine || 7}
          onToggle={() => toggleSezione('ctaFinale')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('ctaFinale', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.ctaFinale?.titolo || ''}
              onChange={(v) => aggiornaSezione('ctaFinale', 'titolo', v)}
              placeholder="PRONTO PER IL TUO NUOVO LOOK?"
            />
            <InputField
              label="Testo Pulsante"
              value={sezioni.ctaFinale?.testoPulsante || ''}
              onChange={(v) => aggiornaSezione('ctaFinale', 'testoPulsante', v)}
              placeholder="PRENOTA SUBITO"
            />
          </div>
          <TextareaField
            label="Sottotitolo"
            value={sezioni.ctaFinale?.sottotitolo || ''}
            onChange={(v) => aggiornaSezione('ctaFinale', 'sottotitolo', v)}
            placeholder="Prenota ora il tuo appuntamento..."
          />
        </SezioneCard>

        {/* GALLERIA */}
        <SezioneCard
          titolo="Galleria"
          descrizione="Mostra una galleria di immagini"
          attiva={sezioni.galleria?.attiva !== false}
          ordine={sezioni.galleria?.ordine || 8}
          onToggle={() => toggleSezione('galleria')}
          onCambiaOrdine={(dir: 'su' | 'giu') => cambiaOrdine('galleria', dir)}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Titolo"
              value={sezioni.galleria?.titolo || ''}
              onChange={(v) => aggiornaSezione('galleria', 'titolo', v)}
              placeholder="GALLERIA"
            />
            <InputField
              label="Sottotitolo"
              value={sezioni.galleria?.sottotitolo || ''}
              onChange={(v) => aggiornaSezione('galleria', 'sottotitolo', v)}
              placeholder="I nostri lavori"
            />
          </div>
          <div className="mt-4">
            <SelectField
              label="Layout"
              value={sezioni.galleria?.layout || 'grid-3'}
              onChange={(v) => aggiornaSezione('galleria', 'layout', v)}
              options={[
                { value: 'grid-2', label: '2 Colonne' },
                { value: 'grid-3', label: '3 Colonne' },
                { value: 'grid-4', label: '4 Colonne' },
                { value: 'masonry', label: 'Masonry' },
              ]}
            />
          </div>

          {/* Immagini */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Immagini</h4>
              <button
                onClick={() => {
                  const attuali = sezioni.galleria?.immagini || [];
                  aggiornaSezione('galleria', 'immagini', [...attuali, { url: '', didascalia: '', alt: '' }]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Aggiungi
              </button>
            </div>
            <div className="space-y-4">
              {(sezioni.galleria?.immagini || []).map((img: any, i: number) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Immagine {i + 1}</span>
                    <button
                      onClick={() => {
                        const attuali = [...(sezioni.galleria?.immagini || [])];
                        attuali.splice(i, 1);
                        aggiornaSezione('galleria', 'immagini', attuali);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <InputField
                      label="URL Immagine"
                      value={img.url || ''}
                      onChange={(v) => {
                        const attuali = [...(sezioni.galleria?.immagini || [])];
                        attuali[i] = { ...attuali[i], url: v };
                        aggiornaSezione('galleria', 'immagini', attuali);
                      }}
                      placeholder="https://..."
                    />
                    <InputField
                      label="Didascalia"
                      value={img.didascalia || ''}
                      onChange={(v) => {
                        const attuali = [...(sezioni.galleria?.immagini || [])];
                        attuali[i] = { ...attuali[i], didascalia: v };
                        aggiornaSezione('galleria', 'immagini', attuali);
                      }}
                      placeholder="Testo visibile al passaggio"
                    />
                    <InputField
                      label="Alt Text"
                      value={img.alt || ''}
                      onChange={(v) => {
                        const attuali = [...(sezioni.galleria?.immagini || [])];
                        attuali[i] = { ...attuali[i], alt: v };
                        aggiornaSezione('galleria', 'immagini', attuali);
                      }}
                      placeholder="SEO alt text"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SezioneCard>
      </div>

      {/* Pulsante Salva Footer */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={salvaImpostazioni}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvataggio...' : 'Salva Tutte le Modifiche'}
        </button>
      </div>
    </div>
  );
}

// Componenti Helper
function SezioneCard({ titolo, descrizione, attiva, ordine, onToggle, onCambiaOrdine, children }: any) {
  const [espansa, setEspansa] = useState(true);

  return (
    <div className={`border rounded-lg overflow-hidden ${attiva ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}>
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggle}
            className={`p-2 rounded ${attiva ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
          >
            {attiva ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <div>
            <h3 className="font-semibold text-lg">{titolo}</h3>
            <p className="text-sm text-gray-600">{descrizione} • Ordine: {ordine}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCambiaOrdine('su')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Sposta su"
          >
            <MoveUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => onCambiaOrdine('giu')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Sposta giù"
          >
            <MoveDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => setEspansa(!espansa)}
            className="p-2 hover:bg-gray-200 rounded ml-2"
          >
            {espansa ? '▼' : '▶'}
          </button>
        </div>
      </div>
      {espansa && attiva && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, icon }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
