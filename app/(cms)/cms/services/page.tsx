/**
 * ============================================================================
 * PAGINA CMS: GESTIONE SERVIZI COMPLETA
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Visualizza tutti i servizi
 * - Crea nuovo servizio
 * - Modifica servizio esistente
 * - Elimina servizio
 * - Gestisce durate variabili (20, 30, 50 min, ecc.)
 * - Gestisce prezzi
 * - Gestisce categorie
 * 
 * DURATE SERVIZI:
 * - Barba: 20 min
 * - Taglio: 30 min
 * - Taglio + Barba: 50 min
 * - Colorazione: 60 min
 * - Personalizzabile
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import ModalConferma from '@/componenti/comuni/ModalConferma';
import { formattaPrezzo } from '@/utils/helpers';
import { 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Plus, 
  Clock, 
  Euro, 
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Servizio {
  _id: string;
  nome: string;
  descrizione: string;
  durata: number;
  prezzo: number;
  categoria: string;
  attivo: boolean;
}

export default function ServiziPage() {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [mostraForm, setMostraForm] = useState(false);
  const [servizioCorrente, setServizioCorrente] = useState<Servizio | null>(null);
  const [mostraPrezziFrontend, setMostraPrezziFrontend] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: '',
    descrizione: '',
    durata: 30,
    prezzo: 0,
    categoria: 'capelli',
    attivo: true,
  });
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  // Stati per modali di conferma
  const [modalElimina, setModalElimina] = useState<{
    isOpen: boolean;
    servizio: Servizio | null;
    caricamento: boolean;
  }>({
    isOpen: false,
    servizio: null,
    caricamento: false,
  });

  const [modalToggle, setModalToggle] = useState<{
    isOpen: boolean;
    servizio: Servizio | null;
    caricamento: boolean;
  }>({
    isOpen: false,
    servizio: null,
    caricamento: false,
  });



  const durateComuni = [
    { value: 15, label: '15 minute' },
    { value: 20, label: '20 minute ' },
    { value: 30, label: '30 minute' },
    { value: 45, label: '45 minute' },
    { value: 50, label: '50 minute' },
    { value: 60, label: '60 minute' },
    { value: 90, label: '90 minute' },
    { value: 120, label: '120 minute' },
  ];

  useEffect(() => {
    caricaServizi();
  }, []);

  const caricaServizi = async () => {
    try {
      setCaricamento(true);
      const [risposta, rispostaSettings] = await Promise.all([
        webservice.get('/api/services/cms'),
        webservice.get('/api/settings'),
      ]);
      setServizi(risposta.dati);
      setMostraPrezziFrontend(rispostaSettings.dati?.funzionalita?.mostraPrezziFrontend !== false);
    } catch (err) {
      setErrore('Eroare la încărcarea serviciilor');
    } finally {
      setCaricamento(false);
    }
  };

  const handleTogglePrezziFrontend = async () => {
    try {
      const nuovoValore = !mostraPrezziFrontend;
      const risposta = await webservice.get('/api/settings');
      const impostazioni = risposta.dati;
      impostazioni.funzionalita = {
        ...impostazioni.funzionalita,
        mostraPrezziFrontend: nuovoValore,
      };
      await webservice.put('/api/settings', impostazioni);
      setMostraPrezziFrontend(nuovoValore);
      setSuccesso(nuovoValore ? 'Prețurile sunt acum vizibile pe site' : 'Prețurile sunt acum ascunse pe site');
    } catch (err) {
      setErrore('Eroare la salvarea setării');
    }
  };

  const handleNuovo = () => {
    setServizioCorrente(null);
    setFormData({
      nome: '',
      descrizione: '',
      durata: 30,
      prezzo: 0,
      categoria: 'capelli',
      attivo: true,
    });
    setMostraForm(true);
  };

  const handleModifica = (servizio: Servizio) => {
    setServizioCorrente(servizio);
    setFormData({
      nome: servizio.nome,
      descrizione: servizio.descrizione,
      durata: servizio.durata,
      prezzo: servizio.prezzo,
      categoria: servizio.categoria,
      attivo: servizio.attivo,
    });
    setMostraForm(true);
  };

  const handleSalva = async () => {
    if (!formData.nome || !formData.descrizione || formData.prezzo <= 0) {
      setErrore('Completează toate câmpurile obligatorii');
      return;
    }

    try {
      setSalvando(true);
      setErrore('');

      if (servizioCorrente) {
        // Modifica servizio esistente
        await webservice.put(`/api/services/${servizioCorrente._id}`, formData);
        setSuccesso('Serviciu actualizat cu succes!');
      } else {
        // Crea nuovo servizio
        await webservice.post('/api/services', formData);
        setSuccesso('Serviciu creat cu succes!');
      }

      setMostraForm(false);
      caricaServizi();
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante il salvataggio';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  const handleElimina = (servizio: Servizio) => {
    setModalElimina({
      isOpen: true,
      servizio,
      caricamento: false,
    });
  };

  const confermaElimina = async () => {
    if (!modalElimina.servizio) return;

    try {
      setModalElimina(prev => ({ ...prev, caricamento: true }));
      
      await webservice.delete(`/api/services/${modalElimina.servizio._id}`);
      setSuccesso('Serviciu șters cu succes!');
      caricaServizi();
      
      setModalElimina({
        isOpen: false,
        servizio: null,
        caricamento: false,
      });
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante l\'eliminazione';
      setErrore(messaggio);
      setModalElimina(prev => ({ ...prev, caricamento: false }));
    }
  };

  const handleToggleAttivo = (servizio: Servizio) => {
    setModalToggle({
      isOpen: true,
      servizio,
      caricamento: false,
    });
  };

  const confermaToggle = async () => {
    if (!modalToggle.servizio) return;

    try {
      setModalToggle(prev => ({ ...prev, caricamento: true }));
      
      await webservice.put(`/api/services/${modalToggle.servizio._id}`, {
        attivo: !modalToggle.servizio.attivo,
      });
      
      setSuccesso(`Serviciu ${!modalToggle.servizio.attivo ? 'activat' : 'dezactivat'} cu succes!`);
      caricaServizi();
      
      setModalToggle({
        isOpen: false,
        servizio: null,
        caricamento: false,
      });
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante l\'aggiornamento';
      setErrore(messaggio);
      setModalToggle(prev => ({ ...prev, caricamento: false }));
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Gestionare Servicii</h1>
          <p className="text-sm text-gray-600 mt-1">
            {servizi.length} servicii • {servizi.filter(s => s.attivo).length} active
          </p>
          <label className="inline-flex items-center gap-2 mt-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={mostraPrezziFrontend}
              onChange={handleTogglePrezziFrontend}
              className="w-4 h-4"
            />
            <span className={mostraPrezziFrontend ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
              {mostraPrezziFrontend ? 'Prețuri vizibile pe site' : 'Prețuri ascunse pe site'}
            </span>
          </label>
        </div>
        {/* Pulsante Nuovo - Solo Desktop */}
        {!mostraForm && (
          <Bottone onClick={handleNuovo} dimensione="small" className="hidden sm:flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Serviciu Nou
          </Bottone>
        )}
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* FORM CREA/MODIFICA - Mobile Optimized */}
      {mostraForm && (
        <Card titolo={servizioCorrente ? 'Editare Serviciu' : 'Serviciu Nou'} className="mb-4 md:mb-6">
          <div className="space-y-3 md:space-y-4">
            <Input
              label="Nume Serviciu"
              value={formData.nome}
              onChange={(v) => setFormData({ ...formData, nome: v })}
              placeholder="Ex: Tunsoare Clasică"
              required
            />

            <div>
                <label className="label">Descriere</label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                placeholder="Descrie serviciul..."
                className="input-field"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">


              <div>
                <label className="label">Durată</label>
                <select
                  value={formData.durata}
                  onChange={(e) => setFormData({ ...formData, durata: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {durateComuni.map((dur) => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="label">Preț (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prezzo}
                  onChange={(e) => setFormData({ ...formData, prezzo: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.attivo}
                    onChange={(e) => setFormData({ ...formData, attivo: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Serviciu activ</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Bottone onClick={handleSalva} disabled={salvando} dimensione="small" className="flex-1 flex items-center justify-center gap-2">
                {salvando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvare...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Salvează
                  </>
                )}
              </Bottone>
              <Bottone
                variante="secondary"
                onClick={() => setMostraForm(false)}
                dimensione="small"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Anulare
              </Bottone>
            </div>
          </div>
        </Card>
      )}

      {/* LISTA SERVIZI - Mobile Optimized */}
      {servizi.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-gray-600 text-sm md:text-base">
            Nu există servicii disponibile. Creează primul serviciu!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {servizi.map((servizio) => (
            <Card 
              key={servizio._id} 
              className={`p-3 md:p-4 transition-all relative ${
                servizio.attivo 
                  ? 'bg-white border-gray-200' 
                  : 'bg-gray-50 border-gray-300 opacity-75'
              }`}
            >
              <div className="space-y-2">
                {/* Header compatto */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm md:text-lg font-bold truncate leading-tight ${
                      servizio.attivo ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {servizio.nome}
                    </h3>
                  <span className={`text-xs capitalize flex items-center gap-1 ${
                      servizio.attivo ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <Tag className="w-3 h-3" />
                      {servizio.categoria}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 flex-shrink-0 ml-1 ${
                      servizio.attivo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {servizio.attivo ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {servizio.attivo ? 'Activ' : 'Inactiv'}
                    </span>
                  </span>
                </div>

                {/* Descrizione solo su desktop */}
                <p className={`hidden md:block text-sm line-clamp-2 ${
                  servizio.attivo ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {servizio.descrizione}
                </p>

                {/* Prezzo e durata compatti */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-lg md:text-xl font-bold flex items-center gap-1 ${
                      servizio.attivo ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      <Euro className="w-4 h-4" />
                      {formattaPrezzo(servizio.prezzo)}
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${
                      servizio.attivo ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {servizio.durata}min
                    </p>
                  </div>
                </div>

                {/* Azioni compatte */}
                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() => handleModifica(servizio)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      servizio.attivo
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="hidden sm:inline">Editare</span>
                  </button>
                  <button
                    onClick={() => handleToggleAttivo(servizio)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                      servizio.attivo
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={servizio.attivo ? 'Dezactivează serviciu' : 'Activează serviciu'}
                  >
                    {servizio.attivo ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => handleElimina(servizio)}
                    className="px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
                    title="Șterge serviciu"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Overlay per servizi disattivati */}
                {!servizio.attivo && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-20 rounded-lg pointer-events-none">
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">INACTIV</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Spazio per pulsante fisso mobile */}
      <div className="sm:hidden h-20"></div>

      {/* PULSANTE NUOVO FISSO - Mobile */}
      {!mostraForm && (
        <div className="sm:hidden fixed bottom-28 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
          <button
            onClick={handleNuovo}
            className="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Serviciu Nou
          </button>
        </div>
      )}

      {/* MODALI DI CONFERMA */}
      <ModalConferma
        isOpen={modalElimina.isOpen}
        onClose={() => setModalElimina({ isOpen: false, servizio: null, caricamento: false })}
        onConfirm={confermaElimina}
        titolo="Șterge Serviciu"
        messaggio={`Ești sigur că vrei să ștergi serviciul "${modalElimina.servizio?.nome}"? Această acțiune nu poate fi anulată.`}
        tipo="danger"
        testoConferma="Șterge"
        testoAnnulla="Anulare"
        caricamento={modalElimina.caricamento}
      />

      <ModalConferma
        isOpen={modalToggle.isOpen}
        onClose={() => setModalToggle({ isOpen: false, servizio: null, caricamento: false })}
        onConfirm={confermaToggle}
        titolo={modalToggle.servizio?.attivo ? 'Dezactivează Serviciu' : 'Activează Serviciu'}
        messaggio={
          modalToggle.servizio?.attivo
            ? `Vrei să dezactivezi serviciul "${modalToggle.servizio?.nome}"? Nu va mai fi disponibil pentru rezervări.`
            : `Vrei să reactivezi serviciul "${modalToggle.servizio?.nome}"? Va redeveni disponibil pentru rezervări.`
        }
        tipo={modalToggle.servizio?.attivo ? 'warning' : 'success'}
        testoConferma={modalToggle.servizio?.attivo ? 'Dezactivează' : 'Activează'}
        testoAnnulla="Anulare"
        caricamento={modalToggle.caricamento}
      />
    </div>
  );
}

