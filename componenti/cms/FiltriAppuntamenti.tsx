'use client';

import { useState } from 'react';
import Modal from '@/componenti/comuni/Modal';
import Card from '@/componenti/interfaccia/Card';
import { Search, Calendar, Filter, X } from 'lucide-react';

interface FiltriProps {
  ricerca: string;
  setRicerca: (value: string) => void;
  filtroStato: string;
  setFiltroStato: (value: string) => void;
  dataInizio: string;
  setDataInizio: (value: string) => void;
  dataFine: string;
  setDataFine: (value: string) => void;
  onReset: () => void;
}

export default function FiltriAppuntamenti({
  ricerca, setRicerca,
  filtroStato, setFiltroStato,
  dataInizio, setDataInizio,
  dataFine, setDataFine,
  onReset
}: FiltriProps) {
  const [modalAperto, setModalAperto] = useState(false);

  const handleReset = () => {
    onReset();
    setModalAperto(false);
  };

  const handleApplica = () => {
    setModalAperto(false);
  };

  // Conta filtri attivi
  const filtriAttivi = [
    ricerca,
    filtroStato !== 'tutti' ? filtroStato : '',
    dataInizio,
    dataFine
  ].filter(Boolean).length;

  return (
    <>
      {/* MOBILE: Barra filtri compatta */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 mb-4">
          {/* Ricerca rapida */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cerca cliente..."
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          {/* Pulsante filtri */}
          <button
            onClick={() => setModalAperto(true)}
            className="relative px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtri</span>
            {filtriAttivi > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtriAttivi}
              </span>
            )}
          </button>
        </div>

        {/* Modal filtri - Solo Mobile */}
        <Modal
          isOpen={modalAperto}
          onClose={() => setModalAperto(false)}
          title="Filtri Appuntamenti"
          size="md"
        >
          <div className="space-y-6">
            {/* Stato */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Stato Appuntamento
              </label>
              <select
                value={filtroStato}
                onChange={(e) => setFiltroStato(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="tutti">Tutti gli stati</option>
                <option value="confermato">Confermato</option>
                <option value="completato">Completato</option>
                <option value="annullato">Annullato</option>
                <option value="in_attesa">In Attesa</option>
              </select>
            </div>

            {/* Range date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={dataInizio}
                  onChange={(e) => setDataInizio(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Data Fine
                </label>
                <input
                  type="date"
                  value={dataFine}
                  onChange={(e) => setDataFine(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filtri rapidi */}
            <div>
              <label className="block text-sm font-bold mb-3">
                Filtri Rapidi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const oggi = new Date().toISOString().split('T')[0];
                    setDataInizio(oggi);
                    setDataFine(oggi);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Oggi
                </button>
                <button
                  onClick={() => {
                    const oggi = new Date();
                    const domani = new Date(oggi);
                    domani.setDate(oggi.getDate() + 1);
                    const domaniStr = domani.toISOString().split('T')[0];
                    setDataInizio(domaniStr);
                    setDataFine(domaniStr);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Domani
                </button>
                <button
                  onClick={() => {
                    const oggi = new Date();
                    const lunedi = new Date(oggi);
                    const giorno = oggi.getDay();
                    const diff = oggi.getDate() - giorno + (giorno === 0 ? -6 : 1);
                    lunedi.setDate(diff);
                    const domenica = new Date(lunedi);
                    domenica.setDate(lunedi.getDate() + 6);
                    setDataInizio(lunedi.toISOString().split('T')[0]);
                    setDataFine(domenica.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Settimana
                </button>
                <button
                  onClick={() => {
                    const oggi = new Date();
                    const primoGiorno = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
                    const ultimoGiorno = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
                    setDataInizio(primoGiorno.toISOString().split('T')[0]);
                    setDataFine(ultimoGiorno.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Mese
                </button>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApplica}
                className="flex-1 px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Applica
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* DESKTOP: Filtri sempre visibili */}
      <div className="hidden md:block">
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Ricerca */}
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Cerca Cliente
              </label>
              <input
                type="text"
                placeholder="Nome, cognome o telefono..."
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Filtro Stato */}
            <div>
              <label className="block text-sm font-bold mb-2">Stato</label>
              <select
                value={filtroStato}
                onChange={(e) => setFiltroStato(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="tutti">Tutti</option>
                <option value="in_attesa">In Attesa</option>
                <option value="confermato">Confermato</option>
                <option value="completato">Completato</option>
                <option value="cancellato">Cancellato</option>
              </select>
            </div>

            {/* Data Inizio */}
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Inizio
              </label>
              <input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Data Fine */}
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Fine
              </label>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtri rapidi - Desktop */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const oggi = new Date().toISOString().split('T')[0];
                setDataInizio(oggi);
                setDataFine(oggi);
              }}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Oggi
            </button>
            <button
              onClick={() => {
                const oggi = new Date();
                const domani = new Date(oggi);
                domani.setDate(oggi.getDate() + 1);
                const domaniStr = domani.toISOString().split('T')[0];
                setDataInizio(domaniStr);
                setDataFine(domaniStr);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Domani
            </button>
            <button
              onClick={() => {
                const oggi = new Date();
                const lunedi = new Date(oggi);
                const giorno = oggi.getDay();
                const diff = oggi.getDate() - giorno + (giorno === 0 ? -6 : 1);
                lunedi.setDate(diff);
                const domenica = new Date(lunedi);
                domenica.setDate(lunedi.getDate() + 6);
                setDataInizio(lunedi.toISOString().split('T')[0]);
                setDataFine(domenica.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Questa Settimana
            </button>
            <button
              onClick={() => {
                const oggi = new Date();
                const primoGiorno = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
                const ultimoGiorno = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
                setDataInizio(primoGiorno.toISOString().split('T')[0]);
                setDataFine(ultimoGiorno.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Questo Mese
            </button>
          </div>

          {/* Reset Filtri - Desktop */}
          {(ricerca || filtroStato !== 'tutti' || dataInizio || dataFine) && (
            <div className="mt-4">
              <button
                onClick={onReset}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancella tutti i filtri
              </button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}