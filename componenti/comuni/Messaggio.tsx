/**
 * COMPONENTE: MESSAGGIO
 * 
 * Mostra messaggi di successo, errore, info o warning.
 * 
 * PROPS:
 * - tipo: 'successo' | 'errore' | 'info' | 'warning'
 * - messaggio: testo da mostrare
 * - onChiudi: funzione per chiudere il messaggio
 */

import React from 'react';

interface MessaggioProps {
  tipo: 'successo' | 'errore' | 'info' | 'warning';
  messaggio: string;
  onChiudi?: () => void;
}

export default function Messaggio({ tipo, messaggio, onChiudi }: MessaggioProps) {
  const stili = {
    successo: 'bg-green-100 border-green-500 text-green-700',
    errore: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  };

  const icone = {
    successo: '✓',
    errore: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${stili[tipo]} rounded-r-lg flex justify-between items-center`}>
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icone[tipo]}</span>
        <p>{messaggio}</p>
      </div>
      
      {onChiudi && (
        <button
          onClick={onChiudi}
          className="text-xl font-bold hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}
