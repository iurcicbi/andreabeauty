'use client';

import { useState, useEffect, useMemo } from 'react';
import { Save, Eye, EyeOff, MoveUp, MoveDown, GripVertical, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import webservice from '@/utils/webservice';
import ImageUploader from '@/componenti/cms/ImageUploader';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function GestioneHomepage() {
  const [impostazioni, setImpostazioni] = useState<any>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [messaggio, setMessaggio] = useState<{ tipo: 'success' | 'error'; testo: string } | null>(null);
  const [serviziLista, setServiziLista] = useState<any[]>([]);
  const [listaSedi, setListaSedi] = useState<any[]>([]);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);
      const rispostaServizi = await webservice.get('/api/services');
      setServiziLista(rispostaServizi.dati || []);
      const rispostaSedi = await webservice.get('/api/sedi');
      setListaSedi(rispostaSedi.dati?.filter?.((s: any) => s.attivo !== false) || []);
    } catch (err) {
      console.error('Errore caricamento:', err);
      setMessaggio({ tipo: 'error', testo: 'Eroare la încărcarea setărilor' });
    } finally {
      setCaricamento(false);
    }
  };

  const salvaImpostazioni = async () => {
    setSalvando(true);
    setMessaggio(null);
    
    try {
      await webservice.put('/api/settings', impostazioni);
      setMessaggio({ tipo: 'success', testo: 'Setări salvate cu succes!' });
      setTimeout(() => setMessaggio(null), 3000);
    } catch (err) {
      console.error('Errore salvataggio:', err);
      setMessaggio({ tipo: 'error', testo: 'Eroare la salvarea setărilor' });
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

  const sezioniOrdinate = useMemo(() => {
    if (!impostazioni?.sezioniHomepage) return [];
    const sezioni = impostazioni.sezioniHomepage;
    const chiavi = ['hero', 'servizi', 'about', 'orari', 'recensioni', 'contatti', 'ctaFinale', 'galleria', 'filosofia'];
    return chiavi
      .filter((k) => sezioni[k] !== undefined || k === 'filosofia')
      .sort((a, b) => (sezioni[a]?.ordine || 0) - (sezioni[b]?.ordine || 0));
  }, [impostazioni]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sezioniOrdinate.indexOf(active.id as string);
    const newIdx = sezioniOrdinate.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(sezioniOrdinate, oldIdx, newIdx);

    setImpostazioni((prev: any) => {
      const sezioni = { ...prev.sezioniHomepage };
      reordered.forEach((key, index) => {
        sezioni[key] = { ...sezioni[key], ordine: index + 1 };
      });
      return { ...prev, sezioniHomepage: sezioni };
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  if (caricamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const sezioni = impostazioni?.sezioniHomepage || {};

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Gestionare Pagină Principală</h1>
        <p className="text-xs md:text-base text-gray-600">Personalizează secțiunile paginii tale principale</p>
      </div>

      {/* Messaggio */}
      {messaggio && (
        <div className={`mb-6 p-4 rounded-lg ${
          messaggio.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {messaggio.testo}
        </div>
      )}

      {/* Pulsante Salva - sempre visibile in alto */}
      <div className="flex mb-6 md:justify-end">
        <button
          onClick={salvaImpostazioni}
          disabled={salvando}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvare...' : 'Salvează Toate Modificările'}
        </button>
      </div>

      {/* Culori */}
      <CollapsibleColorSection
        colorePrimario={sezioni.colorePrimario || '#FFF8F0'}
        coloreSecondario={sezioni.coloreSecondario || '#F5EEE1'}
        onChangePrimario={(v: string) => setImpostazioni((prev: any) => ({
          ...prev,
          sezioniHomepage: { ...prev.sezioniHomepage, colorePrimario: v }
        }))}
        onChangeSecondario={(v: string) => setImpostazioni((prev: any) => ({
          ...prev,
          sezioniHomepage: { ...prev.sezioniHomepage, coloreSecondario: v }
        }))}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sezioniOrdinate} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-6">
        {sezioniOrdinate.map((key) => {
          const sezione = sezioni[key];
          return (
            <SortableSectionWrapper key={key} id={key}>
            {key === 'hero' && (
            <SezioneCard
              titolo="Hero Section"
              descrizione="Secțiune principală cu logo și CTA"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('hero')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('hero', 'titolo', v)} placeholder="BEAUTY SALON" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('hero', 'sottotitolo', v)} placeholder="Stilul tău, pasiunea noastră" />
                <InputField label="Insignă" value={sezione?.badge || ''} onChange={(v) => aggiornaSezione('hero', 'badge', v)} placeholder="Premium Beauty Salon" />
                <InputField label="Text CTA Principal" value={sezione?.testoCtaPrimario || ''} onChange={(v) => aggiornaSezione('hero', 'testoCtaPrimario', v)} placeholder="PRENOTA APPUNTAMENTO" />
                <InputField label="URL CTA Principal" value={sezione?.urlCtaPrimario || ''} onChange={(v) => aggiornaSezione('hero', 'urlCtaPrimario', v)} placeholder="/booking" />
                <InputField label="Text CTA Secundar" value={sezione?.testoCtaSecondario || ''} onChange={(v) => aggiornaSezione('hero', 'testoCtaSecondario', v)} placeholder="DOVE SIAMO" />
                <InputField label="URL CTA Secundar" value={sezione?.urlCtaSecondario || ''} onChange={(v) => aggiornaSezione('hero', 'urlCtaSecondario', v)} placeholder="#contact" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagine Background</p>
                <ImageUploader value={sezione?.immagineBackground || ''} onChange={(v) => aggiornaSezione('hero', 'immagineBackground', v)} folder="hero" />
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <CheckboxField label="Arată Logo" checked={sezione?.mostraLogo !== false} onChange={(v) => aggiornaSezione('hero', 'mostraLogo', v)} />
                <CheckboxField label="Arată Info Rapide" checked={sezione?.mostraInfoRapide !== false} onChange={(v) => aggiornaSezione('hero', 'mostraInfoRapide', v)} />
              </div>
              <div className="mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('hero', 'coloreSfondo', v)} placeholder="es. #FFF8F0" />
              </div>
            </SezioneCard>
            )}
            {key === 'servizi' && (
            <SezioneCard
              titolo="Servicii"
              descrizione="Afișează serviciile tale în grilă"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('servizi')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('servizi', 'titolo', v)} placeholder="I NOSTRI SERVIZI" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('servizi', 'sottotitolo', v)} placeholder="Qualità e professionalità" />
                <InputField label="Descriere" value={sezione?.descrizione || ''} onChange={(v) => aggiornaSezione('servizi', 'descrizione', v)} placeholder="Descrizione servizi..." />
                <InputField label="Insignă" value={sezione?.badge || ''} onChange={(v) => aggiornaSezione('servizi', 'badge', v)} placeholder="I NOSTRI SERVIZI" />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <SelectField label="Layout Grilă" value={sezione?.layoutGriglia || 'grid-3'} onChange={(v) => aggiornaSezione('servizi', 'layoutGriglia', v)} options={[{ value: 'grid-2', label: '2 Coloane' }, { value: 'grid-3', label: '3 Coloane' }, { value: 'grid-4', label: '4 Coloane' }]} />
                <SelectField label="Stil Card" value={sezione?.stileCard || 'classic'} onChange={(v) => aggiornaSezione('servizi', 'stileCard', v)} options={[{ value: 'classic', label: 'Clasic' }, { value: 'minimal', label: 'Minimal' }, { value: 'exploreaza', label: 'Explorează' }]} />
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <CheckboxField label="Arată Prețuri" checked={sezione?.mostraPrezzi !== false} onChange={(v) => aggiornaSezione('servizi', 'mostraPrezzi', v)} />
                <CheckboxField label="Arată Durata" checked={sezione?.mostraDurata !== false} onChange={(v) => aggiornaSezione('servizi', 'mostraDurata', v)} />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicii Selectate</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {serviziLista.map((serv: any) => (
                    <label key={serv._id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={(sezione?.serviziSelezionati || []).includes(serv._id)} onChange={(e) => { const attuali = sezione?.serviziSelezionati || []; const nuovi = e.target.checked ? [...attuali, serv._id] : attuali.filter((id: string) => id !== serv._id); aggiornaSezione('servizi', 'serviziSelezionati', nuovi); }} className="w-4 h-4 text-primary-600 border-gray-300 rounded" />
                      {serv.nome || serv.nume}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Dacă nu selectezi niciun serviciu, vor fi afișate toate cele active</p>
              </div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('servizi', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            {key === 'about' && (
            <SezioneCard
              titolo="About"
              descrizione="Povestește despre about"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('about')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('about', 'titolo', v)} placeholder="CHI SIAMO" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('about', 'sottotitolo', v)} placeholder="La nostra storia, la tua bellezza" />
                <div className="md:col-span-2"><TextareaField label="Descriere" value={sezione?.descrizione || ''} onChange={(v) => aggiornaSezione('about', 'descrizione', v)} placeholder="Descrizione del tuo salone..." /></div>
                <InputField label="Nume Fondator" value={sezione?.nomeFondatore || ''} onChange={(v) => aggiornaSezione('about', 'nomeFondatore', v)} placeholder="Nume fondatore" />
                <InputField label="Rol Fondator" value={sezione?.ruoloFondatore || ''} onChange={(v) => aggiornaSezione('about', 'ruoloFondatore', v)} placeholder="Founder & Makeup Artist" />
                <InputField label="Text CTA" value={sezione?.testoCta || ''} onChange={(v) => aggiornaSezione('about', 'testoCta', v)} placeholder="PRENOTA APPUNTAMENTO" />
                <InputField label="URL CTA" value={sezione?.urlCta || ''} onChange={(v) => aggiornaSezione('about', 'urlCta', v)} placeholder="/booking" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagine About</p>
                <ImageUploader value={sezione?.immagine || ''} onChange={(v) => aggiornaSezione('about', 'immagine', v)} folder="about" />
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3">Statistici</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div><InputField label="Ani - Valoare" value={sezione?.statistiche?.anni?.valore || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, anni: { ...sezione?.statistiche?.anni, valore: v } })} placeholder="10+" /><div className="mt-2"><InputField label="Ani - Label" value={sezione?.statistiche?.anni?.label || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, anni: { ...sezione?.statistiche?.anni, label: v } })} placeholder="Anni Esperienza" /></div></div>
                  <div><InputField label="Clienti - Valoare" value={sezione?.statistiche?.clienti?.valore || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, clienti: { ...sezione?.statistiche?.clienti, valore: v } })} placeholder="5K+" /><div className="mt-2"><InputField label="Clienti - Label" value={sezione?.statistiche?.clienti?.label || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, clienti: { ...sezione?.statistiche?.clienti, label: v } })} placeholder="Clienti Felici" /></div></div>
                  <div><InputField label="Calitate - Valoare" value={sezione?.statistiche?.qualita?.valore || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, qualita: { ...sezione?.statistiche?.qualita, valore: v } })} placeholder="100%" /><div className="mt-2"><InputField label="Calitate - Label" value={sezione?.statistiche?.qualita?.label || ''} onChange={(v) => aggiornaSezione('about', 'statistiche', { ...sezione?.statistiche, qualita: { ...sezione?.statistiche?.qualita, label: v } })} placeholder="Professionalità" /></div></div>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3">Detalii cu Iconițe</h4>
                {['dettaglio1', 'dettaglio2', 'dettaglio3'].map((_, idx) => {
                  const dettaglio = sezione?.dettagli?.[idx] || { titolo: '', descrizione: '', icona: '' };
                  return (
                    <div key={idx} className="grid md:grid-cols-3 gap-3 mb-3 p-3 border rounded-lg bg-gray-50">
                      <InputField label={`Titlu Detaliu ${idx + 1}`} value={dettaglio.titolo || ''} onChange={(v) => { const nuoviDettagli = [...(sezione?.dettagli || Array(3).fill({ titolo: '', descrizione: '', icona: '' }))]; nuoviDettagli[idx] = { ...nuoviDettagli[idx], titolo: v }; aggiornaSezione('about', 'dettagli', nuoviDettagli); }} placeholder="Titolo dettaglio" />
                      <InputField label={`Descriere ${idx + 1}`} value={dettaglio.descrizione || ''} onChange={(v) => { const nuoviDettagli = [...(sezione?.dettagli || Array(3).fill({ titolo: '', descrizione: '', icona: '' }))]; nuoviDettagli[idx] = { ...nuoviDettagli[idx], descrizione: v }; aggiornaSezione('about', 'dettagli', nuoviDettagli); }} placeholder="Descrizione dettaglio" />
                      <InputField label={`Iconiță (SVG path) ${idx + 1}`} value={dettaglio.icona || ''} onChange={(v) => { const nuoviDettagli = [...(sezione?.dettagli || Array(3).fill({ titolo: '', descrizione: '', icona: '' }))]; nuoviDettagli[idx] = { ...nuoviDettagli[idx], icona: v }; aggiornaSezione('about', 'dettagli', nuoviDettagli); }} placeholder="Icona SVG" />
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('about', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            {key === 'orari' && (
            <SezioneCard
              titolo="Orar de Deschidere"
              descrizione="Afișează orarul salonului tău"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('orari')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('orari', 'titolo', v)} placeholder="ORARI DI APERTURA" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('orari', 'sottotitolo', v)} placeholder="Siamo qui per te" />
                <InputField label="Descriere" value={sezione?.descrizione || ''} onChange={(v) => aggiornaSezione('orari', 'descrizione', v)} placeholder="Descrizione orari..." />
              </div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('orari', 'coloreSfondo', v)} placeholder="es. #FFF8F0" />
              </div>
            </SezioneCard>
            )}
            {key === 'recensioni' && (
            <SezioneCard
              titolo="Recenzii"
              descrizione="Afișează recenziile clienților"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('recensioni')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Badge" value={sezione?.badge || ''} onChange={(v) => aggiornaSezione('recensioni', 'badge', v)} placeholder="EXPERIENȚE" />
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('recensioni', 'titolo', v)} placeholder="Perspective Comune asupra Eleganței" />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <InputField label="Număr Maxim Recenzii" value={String(sezione?.numeroMassimo ?? 6)} onChange={(v) => aggiornaSezione('recensioni', 'numeroMassimo', Number(v) || 6)} placeholder="6" />
                <SelectField label="Coloane" value={String(sezione?.numeroColonne ?? 2)} onChange={(v) => aggiornaSezione('recensioni', 'numeroColonne', Number(v))} options={[{ value: '1', label: '1 Coloană' }, { value: '2', label: '2 Coloane' }]} />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <SelectField label="Layout" value={sezione?.layout || 'classic'} onChange={(v) => aggiornaSezione('recensioni', 'layout', v)} options={[{ value: 'classic', label: 'Clasic' }, { value: 'social', label: 'Social (card)' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'carousel', label: 'Carusel' }, { value: 'compact', label: 'Compact (rânduri)' }]} />
                <div className="flex items-end pb-2"><CheckboxField label="Arată doar în evidență" checked={sezione?.arataInEvidenta === true} onChange={(v) => aggiornaSezione('recensioni', 'arataInEvidenta', v)} /></div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3">Opțiuni Vizualizare</h4>
                <div className="flex flex-wrap gap-4">
                  <CheckboxField label="Arată Nume Client" checked={sezione?.mostraNome !== false} onChange={(v) => aggiornaSezione('recensioni', 'mostraNome', v)} />
                  <CheckboxField label="Arată Serviciu" checked={sezione?.mostraServizio !== false} onChange={(v) => aggiornaSezione('recensioni', 'mostraServizio', v)} />
                  <CheckboxField label="Arată Stele" checked={sezione?.mostraStelle === true} onChange={(v) => aggiornaSezione('recensioni', 'mostraStelle', v)} />
                </div>
              </div>
              <div className="mt-4"><CheckboxField label="Afișează în meniu" checked={sezione?.mostraNelMenu !== false} onChange={(v) => aggiornaSezione('recensioni', 'mostraNelMenu', v)} /></div>
              <div className="mt-2"><InputField label="Nume element meniu" value={sezione?.nomeMenu || ''} onChange={(v) => aggiornaSezione('recensioni', 'nomeMenu', v)} placeholder="Recenzii" /></div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('recensioni', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            {key === 'contatti' && (
            <SezioneCard
              titolo="Contact"
              descrizione="Titlu, descriere, informații de contact și locații"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('contatti')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('contatti', 'titolo', v)} placeholder="Contactați-ne" />
                <InputField label="Label dreapta (ex. GENERAL INQUIRIES)" value={sezione?.labelInquiries || ''} onChange={(v) => aggiornaSezione('contatti', 'labelInquiries', v)} placeholder="GENERAL INQUIRIES" />
                <InputField label="Email" value={sezione?.emailGenerale || ''} onChange={(v) => aggiornaSezione('contatti', 'emailGenerale', v)} placeholder="atelier@studio.ro" />
                <InputField label="Telefon" value={sezione?.telefonoGenerale || ''} onChange={(v) => aggiornaSezione('contatti', 'telefonoGenerale', v)} placeholder="+40 722 000 000" />
              </div>
              <div className="mt-4">
                <TextareaField label="Descriere (sub titlu, stânga)" value={sezione?.descrizione || ''} onChange={(v) => aggiornaSezione('contatti', 'descrizione', v)} placeholder="Suntem aici pentru a vă oferi o experiență personalizată..." rows={3} />
              </div>

              {/* Locații — opționale, apar sub secțiunea principală */}
              <div className="mt-6 border-t pt-5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-base">Locații <span className="text-gray-400 font-normal text-sm">(opțional)</span></h4>
                </div>

                {/* Toggle: Da collezione vs Manuale */}
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="modSedi"
                      checked={!Array.isArray(sezione?.sediDaCollezione)}
                      onChange={() => aggiornaSezione('contatti', 'sediDaCollezione', null)}
                      className="w-4 h-4 text-primary-600"
                    />
                    Inserimento manuale
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="modSedi"
                      checked={Array.isArray(sezione?.sediDaCollezione)}
                      onChange={() => aggiornaSezione('contatti', 'sediDaCollezione', [])}
                      className="w-4 h-4 text-primary-600"
                    />
                    Din colecția locații
                  </label>
                </div>

                {Array.isArray(sezione?.sediDaCollezione) ? (
                  /* CHECKBOX SEDI DA COLLEZIONE */
                  <div>
                    <p className="text-xs text-gray-400 mb-3">Selectează locațiile care să apară în secțiunea de contact.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {listaSedi.map((s: any) => {
                        const selectate = sezione?.sediDaCollezione || [];
                        const esteSelectata = selectate.includes(s._id);
                        return (
                          <label key={s._id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={esteSelectata}
                              onChange={() => {
                                const attuali = [...(sezione?.sediDaCollezione || [])];
                                const noi = esteSelectata
                                  ? attuali.filter((id: string) => id !== s._id)
                                  : [...attuali, s._id];
                                aggiornaSezione('contatti', 'sediDaCollezione', noi);
                              }}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                            />
                            <span>{s.nome}</span>
                            {!s.attivo && <span className="text-xs text-gray-400">(inactiv)</span>}
                            <span className="text-xs text-gray-400">— {s.citta}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Datele (adresă, telefon, hartă) se preiau automat din colecția locații.</p>
                  </div>
                ) : (
                  /* INSERIMENTO MANUALE (esistente) */
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400">Dacă adaugi locații, acestea apar automat sub secțiunea de contact.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const sediAttuali = sezione?.sedi || [];
                          aggiornaSezione('contatti', 'sedi', [
                            ...sediAttuali,
                            {
                              nome: '', indirizzo: '', cap: '', citta: '',
                              telefono: '', email: '', urlMappa: '',
                              programma: [
                                { giorno: 'Luni - Vineri', orario: '09:00 - 20:00', chiuso: false },
                                { giorno: 'Sâmbătă', orario: '10:00 - 18:00', chiuso: false },
                                { giorno: 'Duminică', orario: '', chiuso: true },
                              ],
                            },
                          ]);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4" /> Adaugă Locație
                      </button>
                    </div>

                    {(sezione?.sedi || []).length === 0 && (
                      <p className="text-sm text-gray-400 italic">Nicio locație adăugată.</p>
                    )}

                    {(sezione?.sedi || []).map((sede: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-sm text-gray-700">Locație {idx + 1}{sede.nome ? ` — ${sede.nome}` : ''}</span>
                          <button type="button" onClick={() => { const nuove = (sezione?.sedi || []).filter((_: any, i: number) => i !== idx); aggiornaSezione('contatti', 'sedi', nuove); }} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <InputField label="Nume locație" value={sede.nome || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], nome: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="București" />
                          <InputField label="Adresă" value={sede.indirizzo || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], indirizzo: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="Strada Aviatorilor 42, Sector 1" />
                          <InputField label="Cod Poștal" value={sede.cap || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], cap: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="011862" />
                          <InputField label="Oraș" value={sede.citta || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], citta: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="București" />
                          <InputField label="Telefon" value={sede.telefono || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], telefono: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="+40 722 123 456" />
                          <InputField label="Email" value={sede.email || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], email: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="bucuresti@studio.ro" />
                          <div className="md:col-span-2">
                            <InputField label="URL Hartă Google" value={sede.urlMappa || ''} onChange={(v) => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], urlMappa: v }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="https://maps.google.com/..." />
                          </div>
                        </div>
                        {/* Programma */}
                        <div className="mt-4 border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Program</p>
                            <button type="button" onClick={() => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], programma: [...(s[idx].programma || []), { giorno: '', orario: '', chiuso: false }] }; aggiornaSezione('contatti', 'sedi', s); }} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Adaugă rând
                            </button>
                          </div>
                          {(sede.programma || []).map((riga: any, rigaIdx: number) => (
                            <div key={rigaIdx} className="flex flex-col md:flex-row gap-1.5 md:gap-2 items-start md:items-center mb-2">
                              <input type="text" value={riga.giorno || ''} onChange={(e) => { const s = [...(sezione?.sedi || [])]; const p = [...(s[idx].programma || [])]; p[rigaIdx] = { ...p[rigaIdx], giorno: e.target.value }; s[idx] = { ...s[idx], programma: p }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="Luni - Vineri" className="w-full md:flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" />
                              <div className="flex gap-1.5 items-center w-full md:w-auto">
                                <input type="text" value={riga.orario || ''} onChange={(e) => { const s = [...(sezione?.sedi || [])]; const p = [...(s[idx].programma || [])]; p[rigaIdx] = { ...p[rigaIdx], orario: e.target.value }; s[idx] = { ...s[idx], programma: p }; aggiornaSezione('contatti', 'sedi', s); }} placeholder="09:00 - 20:00" className="flex-1 md:w-32 px-2 py-1.5 border border-gray-300 rounded text-sm" disabled={riga.chiuso} />
                                <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap shrink-0">
                                  <input type="checkbox" checked={riga.chiuso || false} onChange={(e) => { const s = [...(sezione?.sedi || [])]; const p = [...(s[idx].programma || [])]; p[rigaIdx] = { ...p[rigaIdx], chiuso: e.target.checked }; s[idx] = { ...s[idx], programma: p }; aggiornaSezione('contatti', 'sedi', s); }} className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Închis</span>
                                </label>
                                <button type="button" onClick={() => { const s = [...(sezione?.sedi || [])]; s[idx] = { ...s[idx], programma: (s[idx].programma || []).filter((_: any, ri: number) => ri !== rigaIdx) }; aggiornaSezione('contatti', 'sedi', s); }} className="text-red-400 hover:text-red-600 shrink-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Link "Explore the spaces" */}
                    {(sezione?.sedi || []).length > 0 && (
                      <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <InputField label="Text link locații (dreapta titlu)" value={sezione?.testoLink || ''} onChange={(v) => aggiornaSezione('contatti', 'testoLink', v)} placeholder="EXPLORE THE SPACES" />
                        <InputField label="URL link locații" value={sezione?.urlLink || ''} onChange={(v) => aggiornaSezione('contatti', 'urlLink', v)} placeholder="/locatii" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('contatti', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            {key === 'ctaFinale' && (
            <SezioneCard
              titolo="CTA Final"
              descrizione="Call-to-action final"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('ctaFinale')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('ctaFinale', 'titolo', v)} placeholder="PRONTO PER IL TUO NUOVO LOOK?" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('ctaFinale', 'sottotitolo', v)} placeholder="Prenota ora" />
                <InputField label="Text Pulsante" value={sezione?.testoPulsante || ''} onChange={(v) => aggiornaSezione('ctaFinale', 'testoPulsante', v)} placeholder="PRENOTA SUBITO" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagine Background</p>
                <ImageUploader value={sezione?.immagineBackground || ''} onChange={(v) => aggiornaSezione('ctaFinale', 'immagineBackground', v)} folder="hero" />
              </div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('ctaFinale', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            {key === 'filosofia' && (
            <SezioneCard
              titolo="Filosofia"
              descrizione="Sezione filosofia con pilastri e immagine"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('filosofia')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Badge" value={sezione?.badge || ''} onChange={(v) => aggiornaSezione('filosofia', 'badge', v)} placeholder="ATELIER & FILOSOFIA" />
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('filosofia', 'titolo', v)} placeholder="Dincolo de Suprafață" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagine</p>
                <ImageUploader value={sezione?.immagine || ''} onChange={(v) => aggiornaSezione('filosofia', 'immagine', v)} folder="filosofia" />
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold mb-3">Pilastri</h4>
                {[0, 1, 2].map((idx) => {
                  const pilastro = sezione?.pilastri?.[idx] || { titolo: '', descrizione: '', icona: 'diamond' };
                  const iconOptions = [
                    { value: 'science', label: 'Știință' },
                    { value: 'spa', label: 'Spa' },
                    { value: 'architecture', label: 'Arhitectură' },
                    { value: 'star', label: 'Stea' },
                    { value: 'favorite', label: 'Inimă' },
                    { value: 'brush', label: 'Pensulă' },
                    { value: 'diamond', label: 'Diamant' },
                  ];
                  return (
                    <div key={idx} className="grid md:grid-cols-3 gap-3 mb-3 p-3 border rounded-lg bg-gray-50">
                      <InputField
                        label={`Titlu Pilastru ${idx + 1}`}
                        value={pilastro.titolo || ''}
                        onChange={(v: string) => {
                          const nuovi = [...(sezione?.pilastri || Array(3).fill({ titolo: '', descrizione: '', icona: 'diamond' }))];
                          nuovi[idx] = { ...nuovi[idx], titolo: v };
                          aggiornaSezione('filosofia', 'pilastri', nuovi);
                        }}
                        placeholder="Titolo pilastro"
                      />
                      <InputField
                        label={`Descriere ${idx + 1}`}
                        value={pilastro.descrizione || ''}
                        onChange={(v: string) => {
                          const nuovi = [...(sezione?.pilastri || Array(3).fill({ titolo: '', descrizione: '', icona: 'diamond' }))];
                          nuovi[idx] = { ...nuovi[idx], descrizione: v };
                          aggiornaSezione('filosofia', 'pilastri', nuovi);
                        }}
                        placeholder="Descrizione pilastro"
                      />
                      <SelectField
                        label={`Iconiță ${idx + 1}`}
                        value={pilastro.icona || 'diamond'}
                        onChange={(v: string) => {
                          const nuovi = [...(sezione?.pilastri || Array(3).fill({ titolo: '', descrizione: '', icona: 'diamond' }))];
                          nuovi[idx] = { ...nuovi[idx], icona: v };
                          aggiornaSezione('filosofia', 'pilastri', nuovi);
                        }}
                        options={iconOptions}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-4"><CheckboxField label="Afișează în meniu" checked={sezione?.mostraNelMenu !== false} onChange={(v) => aggiornaSezione('filosofia', 'mostraNelMenu', v)} /></div>
              <div className="mt-2"><InputField label="Nume element meniu" value={sezione?.nomeMenu || ''} onChange={(v) => aggiornaSezione('filosofia', 'nomeMenu', v)} placeholder="Filosofia" /></div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('filosofia', 'coloreSfondo', v)} placeholder="ex. #FFF8F0" />
              </div>
            </SezioneCard>
            )}
            {key === 'galleria' && (
            <SezioneCard
              titolo="Galerie"
              descrizione="Afișează o galerie de imagini"
              attiva={sezione?.attiva !== false}
              onToggle={() => toggleSezione('galleria')}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Badge" value={sezione?.badge || ''} onChange={(v) => aggiornaSezione('galleria', 'badge', v)} placeholder="ARHIVĂ VIZUALĂ" />
                <InputField label="Titlu" value={sezione?.titolo || ''} onChange={(v) => aggiornaSezione('galleria', 'titolo', v)} placeholder="Arta Tenului Impecabil" />
                <InputField label="Subtitlu" value={sezione?.sottotitolo || ''} onChange={(v) => aggiornaSezione('galleria', 'sottotitolo', v)} placeholder="" />
                <SelectField label="Layout" value={sezione?.layout || 'grid-custom'} onChange={(v) => aggiornaSezione('galleria', 'layout', v)} options={[{ value: 'grid-2', label: 'Grilă 2 Coloane' }, { value: 'grid-3', label: 'Grilă 3 Coloane' }, { value: 'grid-4', label: 'Grilă 4 Coloane' }, { value: 'grid-custom', label: 'Personalizat (5+ imagini)' }, { value: 'masonry', label: 'Masonry' }]} />
              </div>
              <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Imagini Galerie</p>
                {(!sezione?.immagini || sezione.immagini.length === 0) ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nicio imagine adăugată</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sezione.immagini.map((img: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <img src={img.url} alt={img.alt || ''} className="w-full h-32 object-cover rounded-lg border" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button onClick={() => { const nuove = sezione.immagini.filter((_: any, i: number) => i !== idx); aggiornaSezione('galleria', 'immagini', nuove); }} className="bg-red-500 text-white px-3 py-1 rounded text-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <input type="text" value={img.didascalia || ''} onChange={(e) => { const nuove = [...sezione.immagini]; nuove[idx] = { ...nuove[idx], didascalia: e.target.value }; aggiornaSezione('galleria', 'immagini', nuove); }} placeholder="Legendă" className="w-full mt-1 px-2 py-1 text-xs border rounded" />
                        <input type="text" value={img.alt || ''} onChange={(e) => { const nuove = [...sezione.immagini]; nuove[idx] = { ...nuove[idx], alt: e.target.value }; aggiornaSezione('galleria', 'immagini', nuove); }} placeholder="Text Alt" className="w-full mt-1 px-2 py-1 text-xs border rounded" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3"><ImageUploader value="" onChange={(url) => { if (!url) return; const nuove = [...(sezione?.immagini || []), { url, didascalia: '', alt: '' }]; aggiornaSezione('galleria', 'immagini', nuove); }} folder="gallery" /></div>
              </div>
              <div className="mt-4"><CheckboxField label="Afișează butonul 'Vezi tot'" checked={sezione?.mostraPulsantePortfolio !== false} onChange={(v) => aggiornaSezione('galleria', 'mostraPulsantePortfolio', v)} /></div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <InputField label="Text Buton (Arată)" value={sezione?.testoPulsantePortfolio || ''} onChange={(v) => aggiornaSezione('galleria', 'testoPulsantePortfolio', v)} placeholder="VEZI TOT PORTOFOLIUL" />
                <InputField label="Text Buton (Ascunde)" value={sezione?.testoNascondiPortfolio || ''} onChange={(v) => aggiornaSezione('galleria', 'testoNascondiPortfolio', v)} placeholder="ASCUNDE PORTOFOLIUL" />
              </div>
              <div className="mt-4"><CheckboxField label="Afișează în meniu" checked={sezione?.mostraNelMenu !== false} onChange={(v) => aggiornaSezione('galleria', 'mostraNelMenu', v)} /></div>
              <div className="mt-2"><InputField label="Nume element meniu" value={sezione?.nomeMenu || ''} onChange={(v) => aggiornaSezione('galleria', 'nomeMenu', v)} placeholder="Galerie" /></div>
              <div className="border-t pt-3 mt-4">
                <InputField label="Culoare fundal (lasă gol pentru alternare)" value={sezione?.coloreSfondo || ''} onChange={(v) => aggiornaSezione('galleria', 'coloreSfondo', v)} placeholder="ex. #FFFFFF" />
              </div>
            </SezioneCard>
            )}
            </SortableSectionWrapper>
          );
        })}
      </div>
      </SortableContext>
      </DndContext>

    </div>
  );
}

// Componenti Helper
function SortableSectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{children}</div>;
}

function SezioneCard({ titolo, descrizione, attiva, onToggle, children }: any) {
  const [espansa, setEspansa] = useState(false);

  return (
    <div className={`border rounded-lg overflow-hidden ${attiva ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}>
      <div className="p-2 md:p-4 bg-gray-50 border-b flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 md:gap-4 flex-1 min-w-0">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0">
            <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <button
            onClick={onToggle}
            className={`p-1.5 md:p-2 rounded shrink-0 ${attiva ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
            title={attiva ? 'Dezactivează secțiunea' : 'Activează secțiunea'}
          >
            {attiva ? <Eye className="w-4 h-4 md:w-5 md:h-5" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={() => setEspansa(!espansa)}
            className="flex-1 min-w-0 text-left"
          >
            <h3 className="font-semibold text-sm md:text-lg truncate flex items-center gap-1.5">
              {!espansa && attiva && (
                <span className="text-primary-500 text-xs md:text-sm shrink-0">▶</span>
              )}
              {titolo}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">{descrizione}</p>
            {!espansa && attiva && (
              <p className="text-[10px] md:text-xs text-primary-500 mt-0.5 font-medium">
                Atinge pentru a edita conținutul
              </p>
            )}
          </button>
        </div>
        <button
          onClick={() => setEspansa(!espansa)}
          className={`p-1.5 md:p-2 rounded shrink-0 transition-colors ${
            espansa ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
          title={espansa ? 'Închide' : 'Deschide secțiunea'}
        >
          {espansa ? '▲' : '▼'}
        </button>
      </div>
      {espansa && attiva && (
        <div className="p-3 md:p-6 bg-white">
          {children}
        </div>
      )}
      {!attiva && (
        <div className="px-3 md:px-4 py-2 bg-gray-100 text-xs text-gray-500 flex items-center gap-1">
          <EyeOff className="w-3 h-3" /> Secțiune dezactivată - nu apare pe site
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

function CollapsibleColorSection({ colorePrimario, coloreSecondario, onChangePrimario, onChangeSecondario }: any) {
  const [aperto, setAperto] = useState(false);
  return (
    <div className="mb-4 md:mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setAperto(!aperto)}
        className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colorePrimario }} />
            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: coloreSecondario }} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm md:text-base">Culori Secțiuni</h3>
            <p className="text-xs text-gray-500">Alege culorile alternative pentru secțiuni</p>
          </div>
        </div>
        <span className={`text-sm transition-transform ${aperto ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {aperto && (
        <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Culoare Principală</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={colorePrimario}
                  onChange={(v) => onChangePrimario(v.target.value)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded cursor-pointer border border-gray-300 shrink-0"
                />
                <input
                  type="text"
                  value={colorePrimario}
                  onChange={(v) => onChangePrimario(v.target.value)}
                  className="flex-1 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-mono"
                  placeholder="#FFF8F0"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Culoare Secundară</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={coloreSecondario}
                  onChange={(v) => onChangeSecondario(v.target.value)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded cursor-pointer border border-gray-300 shrink-0"
                />
                <input
                  type="text"
                  value={coloreSecondario}
                  onChange={(v) => onChangeSecondario(v.target.value)}
                  className="flex-1 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-mono"
                  placeholder="#F5EEE1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
