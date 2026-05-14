/**
 * PAGINA CMS: GESTIONE ORARI COMPLETA
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { 
  Save, 
  BarChart3, 
  Clock, 
  Calendar, 
  Coffee, 
  Target, 
  Eye, 
  CalendarRange,
  Trash2,
  Plus
} from 'lucide-react';

interface GiornoLavorativo {
  aperto: boolean;
  oraInizio?: string;
  oraFine?: string;
  pausa?: {
    oraInizio: string;
    oraFine: string;
  };
}

interface OrariSettimanali {
  lunedi: GiornoLavorativo;
  martedi: GiornoLavorativo;
  mercoledi: GiornoLavorativo;
  giovedi: GiornoLavorativo;
  venerdi: GiornoLavorativo;
  sabato: GiornoLavorativo;
  domenica: GiornoLavorativo;
}

interface GiornoChiusura {
  data: string;
  motivo: string;
  tuttoIlGiorno: boolean;
  oraInizio?: string;
  oraFine?: string;
}

interface Impostazioni {
  anticipoMinimo: number;
  durataSlot: number;
  maxAppuntamentiGiorno: number;
}

export default function OrariPage() {
  const [orari, setOrari] = useState<OrariSettimanali | null>(null);
  const [giorniChiusura, setGiorniChiusura] = useState<GiornoChiusura[]>([]);
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({
    anticipoMinimo: 2,
    durataSlot: 15,
    maxAppuntamentiGiorno: 0,
  });
  
  const [nuovaChiusura, setNuovaChiusura] = useState<GiornoChiusura>({
    data: '',
    motivo: '',
    tuttoIlGiorno: true,
  });
  
  const [periodoFerie, setPeriodoFerie] = useState({
    dataInizio: '',
    dataFine: '',
    motivo: 'Ferie',
  });
  
  const [mostraAggiuntaRapida, setMostraAggiuntaRapida] = useState(false);
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  const giorniLabel: Record<string, string> = {
    lunedi: 'Lunedì',
    martedi: 'Martedì',
    mercoledi: 'Mercoledì',
    giovedi: 'Giovedì',
    venerdi: 'Venerdì',
    sabato: 'Sabato',
    domenica: 'Domenica',
  };

  useEffect(() => {
    caricaProfilo();
  }, []);

  const caricaProfilo = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/barber/profilo');
      
      setOrari(risposta.dati.orariSettimanali);
      setGiorniChiusura(risposta.dati.giorniChiusura || []);
      setImpostazioni(risposta.dati.impostazioni);
    } catch (err) {
      setErrore('Errore nel caricamento del profilo');
    } finally {
      setCaricamento(false);
    }
  };

  const handleToggleGiorno = (giorno: string) => {
    if (!orari) return;
    
    const giornoCorrente = orari[giorno as keyof OrariSettimanali];
    setOrari({
      ...orari,
      [giorno]: {
        ...giornoCorrente,
        aperto: !giornoCorrente.aperto,
      },
    });
  };

  const handleOrarioChange = (giorno: string, campo: 'oraInizio' | 'oraFine', valore: string) => {
    if (!orari) return;
    
    const nuoviOrari = {
      ...orari,
      [giorno]: {
        ...orari[giorno as keyof OrariSettimanali],
        [campo]: valore,
      },
    };
    
    setOrari(nuoviOrari);
    setErrore('');
  };

  const orarioToMinuti = (orario: string): number => {
    const [ore, minuti] = orario.split(':').map(Number);
    return ore * 60 + minuti;
  };

  const handlePausaChange = (giorno: string, campo: 'oraInizio' | 'oraFine', valore: string) => {
    if (!orari) return;
    
    const giornoCorrente = orari[giorno as keyof OrariSettimanali];
    
    setOrari({
      ...orari,
      [giorno]: {
        ...giornoCorrente,
        pausa: {
          oraInizio: campo === 'oraInizio' ? valore : (giornoCorrente.pausa?.oraInizio || ''),
          oraFine: campo === 'oraFine' ? valore : (giornoCorrente.pausa?.oraFine || ''),
        },
      },
    });
  };

  const handleTogglePausa = (giorno: string) => {
    if (!orari) return;
    
    const giornoCorrente = orari[giorno as keyof OrariSettimanali];
    
    setOrari({
      ...orari,
      [giorno]: {
        ...giornoCorrente,
        pausa: giornoCorrente.pausa ? undefined : { oraInizio: '13:00', oraFine: '14:00' },
      },
    });
  };

  const handleAggiungiChiusura = () => {
    if (!nuovaChiusura.data || !nuovaChiusura.motivo) {
      setErrore('Data e motivo sono obbligatori');
      return;
    }

    setGiorniChiusura([...giorniChiusura, nuovaChiusura]);
    setNuovaChiusura({
      data: '',
      motivo: '',
      tuttoIlGiorno: true,
    });
    setSuccesso('Giorno di chiusura aggiunto');
  };

  const handleRimuoviChiusura = (index: number) => {
    setGiorniChiusura(giorniChiusura.filter((_, i) => i !== index));
    setSuccesso('Giorno di chiusura rimosso');
  };

  const handleAggiungiPeriodoFerie = () => {
    if (!periodoFerie.dataInizio || !periodoFerie.dataFine) {
      setErrore('Seleziona data inizio e fine');
      return;
    }

    const dataInizio = new Date(periodoFerie.dataInizio);
    const dataFine = new Date(periodoFerie.dataFine);

    if (dataFine < dataInizio) {
      setErrore('La data fine deve essere dopo la data inizio');
      return;
    }

    const giorni = Math.ceil((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (giorni > 60) {
      setErrore('Periodo troppo lungo (max 60 giorni)');
      return;
    }

    const nuoveChiusure: GiornoChiusura[] = [];
    const dataCorrente = new Date(dataInizio);

    while (dataCorrente <= dataFine) {
      nuoveChiusure.push({
        data: dataCorrente.toISOString().split('T')[0],
        motivo: periodoFerie.motivo,
        tuttoIlGiorno: true,
      });
      dataCorrente.setDate(dataCorrente.getDate() + 1);
    }

    setGiorniChiusura([...giorniChiusura, ...nuoveChiusure]);
    setPeriodoFerie({ dataInizio: '', dataFine: '', motivo: 'Ferie' });
    setMostraAggiuntaRapida(false);
    setSuccesso(`Aggiunti ${giorni} giorni di chiusura`);
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      setErrore('');

      await webservice.put('/api/barber/profilo', {
        orariSettimanali: orari,
        giorniChiusura,
        impostazioni,
      });

      setSuccesso('Orari salvati con successo!');
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante il salvataggio';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;

  const calcolaStatistiche = () => {
    if (!orari) return null;
    
    let oreTotali = 0;
    let giorniAperti = 0;
    let orePausa = 0;
    
    Object.values(orari).forEach(giorno => {
      if (!giorno.aperto || !giorno.oraInizio || !giorno.oraFine) return;
      
      giorniAperti++;
      
      const minutiInizio = orarioToMinuti(giorno.oraInizio);
      const minutiFine = orarioToMinuti(giorno.oraFine);
      const minutiLavoro = minutiFine - minutiInizio;
      
      oreTotali += minutiLavoro / 60;
      
      if (giorno.pausa) {
        const minutiPausaInizio = orarioToMinuti(giorno.pausa.oraInizio);
        const minutiPausaFine = orarioToMinuti(giorno.pausa.oraFine);
        orePausa += (minutiPausaFine - minutiPausaInizio) / 60;
      }
    });
    
    const oreEffettive = oreTotali - orePausa;
    const slotPerGiorno = Math.floor((oreEffettive / giorniAperti) * (60 / impostazioni.durataSlot));
    
    return {
      oreTotali: Math.round(oreTotali * 10) / 10,
      giorniAperti,
      orePausa: Math.round(orePausa * 10) / 10,
      oreEffettive: Math.round(oreEffettive * 10) / 10,
      slotPerGiorno
    };
  };

  const stats = calcolaStatistiche();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Orari</h1>
        <Bottone onClick={handleSalva} disabled={salvando}>
          {salvando ? 'Salvataggio...' : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salva Tutto
            </span>
          )}
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* STATISTICHE E ANTEPRIMA */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Statistiche */}
        {stats && (
          <Card titolo={
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistiche Settimanali
            </span>
          }>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Ore lavorative/settimana
                </span>
                <span className="font-bold text-xl text-blue-600">{stats.oreTotali}h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Giorni aperti
                </span>
                <span className="font-bold text-xl text-green-600">{stats.giorniAperti}/7</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  Pause totali
                </span>
                <span className="font-bold text-xl text-purple-600">{stats.orePausa}h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ore effettive
                </span>
                <span className="font-bold text-xl text-amber-600">{stats.oreEffettive}h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Slot disponibili/giorno
                </span>
                <span className="font-bold text-xl text-indigo-600">~{stats.slotPerGiorno}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Anteprima Cliente */}
        <Card titolo={
          <span className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Anteprima Cliente
          </span>
        }>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Come i clienti vedranno i tuoi orari:</p>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Orari di Apertura
              </h3>
              <div className="space-y-2">
                {orari && giorni.map((giorno) => {
                  const giornoData = orari[giorno as keyof OrariSettimanali];
                  if (!giornoData) return null;

                  return (
                    <div key={giorno} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">{giorniLabel[giorno]}</span>
                      {giornoData.aperto ? (
                        <div className="flex-1 text-right">
                          <span className="text-green-700 font-medium">
                            {giornoData.oraInizio} - {giornoData.oraFine}
                          </span>
                          {giornoData.pausa && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Pausa: {giornoData.pausa.oraInizio}-{giornoData.pausa.oraFine})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-600 font-medium">CHIUSO</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ORARI SETTIMANALI - TABELLA */}
      <Card titolo="Orari Settimanali">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-3 font-semibold">Giorno</th>
                <th className="text-center py-3 px-3 font-semibold">Stato</th>
                <th className="text-left py-3 px-3 font-semibold">Apertura</th>
                <th className="text-left py-3 px-3 font-semibold">Chiusura</th>
                <th className="text-center py-3 px-3 font-semibold">Pausa</th>
                <th className="text-left py-3 px-3 font-semibold">Pausa Inizio</th>
                <th className="text-left py-3 px-3 font-semibold">Pausa Fine</th>
              </tr>
            </thead>
            <tbody>
              {giorni.map((giorno) => {
                const giornoData = orari?.[giorno as keyof OrariSettimanali];
                if (!giornoData) return null;

                return (
                  <tr key={giorno} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{giorniLabel[giorno]}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleGiorno(giorno)}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                          giornoData.aperto
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {giornoData.aperto ? '✓ Aperto' : '✗ Chiuso'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      {giornoData.aperto && (
                        <input
                          type="time"
                          value={giornoData.oraInizio || ''}
                          onChange={(e) => handleOrarioChange(giorno, 'oraInizio', e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {giornoData.aperto && (
                        <input
                          type="time"
                          value={giornoData.oraFine || ''}
                          onChange={(e) => handleOrarioChange(giorno, 'oraFine', e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {giornoData.aperto && giornoData.pausa && (
                        <button
                          onClick={() => handleTogglePausa(giorno)}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                            giornoData.pausa
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {giornoData.pausa ? (
                            <>
                              <Coffee className="w-3 h-3" />
                              Sì
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              No
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {giornoData.aperto && giornoData.pausa && (
                        <input
                          type="time"
                          value={giornoData.pausa.oraInizio || ''}
                          onChange={(e) => handlePausaChange(giorno, 'oraInizio', e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {giornoData.aperto && giornoData.pausa && (
                        <input
                          type="time"
                          value={giornoData.pausa.oraFine || ''}
                          onChange={(e) => handlePausaChange(giorno, 'oraFine', e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* GIORNI DI CHIUSURA */}
      <Card titolo="Giorni di Chiusura e Ferie" className="mt-6">
        <div className="space-y-4">
          {/* Lista chiusure */}
          {giorniChiusura.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Chiusure Programmate ({giorniChiusura.length})</h3>
              {giorniChiusura
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .map((chiusura, index) => {
                  const dataChiusura = new Date(chiusura.data);
                  const oggi = new Date();
                  oggi.setHours(0, 0, 0, 0);
                  const isPast = dataChiusura < oggi;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded ${
                        isPast ? 'bg-gray-100 opacity-60' : 'bg-amber-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          {dataChiusura.toLocaleDateString('it-IT', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{chiusura.motivo}</p>
                      </div>
                      <button
                        onClick={() => handleRimuoviChiusura(index)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Form nuova chiusura */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Aggiungi Chiusura</h3>
              <button
                onClick={() => setMostraAggiuntaRapida(!mostraAggiuntaRapida)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {mostraAggiuntaRapida ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    Singolo giorno
                  </>
                ) : (
                  <>
                    <CalendarRange className="w-4 h-4" />
                    Periodo ferie
                  </>
                )}
              </button>
            </div>

            {mostraAggiuntaRapida ? (
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-900 mb-3">Aggiungi Periodo di Ferie</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Inizio</label>
                    <input
                      type="date"
                      value={periodoFerie.dataInizio}
                      onChange={(e) => setPeriodoFerie({ ...periodoFerie, dataInizio: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Fine</label>
                    <input
                      type="date"
                      value={periodoFerie.dataFine}
                      onChange={(e) => setPeriodoFerie({ ...periodoFerie, dataFine: e.target.value })}
                      min={periodoFerie.dataInizio || new Date().toISOString().split('T')[0]}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo</label>
                    <select
                      value={periodoFerie.motivo}
                      onChange={(e) => setPeriodoFerie({ ...periodoFerie, motivo: e.target.value })}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="Ferie">Ferie</option>
                      <option value="Festività">Festività</option>
                      <option value="Formazione">Formazione</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                </div>
                <Bottone onClick={handleAggiungiPeriodoFerie} className="mt-3">
                  Aggiungi Periodo
                </Bottone>
              </div>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <input
                      type="date"
                      value={nuovaChiusura.data}
                      onChange={(e) => setNuovaChiusura({ ...nuovaChiusura, data: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo</label>
                    <select
                      value={nuovaChiusura.motivo}
                      onChange={(e) => setNuovaChiusura({ ...nuovaChiusura, motivo: e.target.value })}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Seleziona motivo...</option>
                      <option value="Ferie">Ferie</option>
                      <option value="Festività">Festività</option>
                      <option value="Malattia">Malattia</option>
                      <option value="Formazione">Formazione</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                </div>
                <Bottone onClick={handleAggiungiChiusura} className="mt-3">
                  Aggiungi Chiusura
                </Bottone>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* IMPOSTAZIONI */}
      <Card titolo="Impostazioni Prenotazioni" className="mt-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Anticipo Minimo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="72"
                value={impostazioni.anticipoMinimo}
                onChange={(e) => setImpostazioni({ ...impostazioni, anticipoMinimo: parseInt(e.target.value) })}
                className="border rounded px-3 py-2 w-20"
              />
              <span className="text-gray-600">ore</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ore minime di preavviso per prenotare
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Durata Slot
            </label>
            <select
              value={impostazioni.durataSlot}
              onChange={(e) => setImpostazioni({ ...impostazioni, durataSlot: parseInt(e.target.value) })}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="15">15 minuti</option>
              <option value="30">30 minuti</option>
              <option value="60">60 minuti</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Intervallo tra gli slot disponibili
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Max Appuntamenti/Giorno
            </label>
            <input
              type="number"
              min="0"
              value={impostazioni.maxAppuntamentiGiorno}
              onChange={(e) => setImpostazioni({ ...impostazioni, maxAppuntamentiGiorno: parseInt(e.target.value) })}
              className="border rounded px-3 py-2 w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = illimitato
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
