/**
 * COMPONENTE: MODAL DI CONFERMA PERSONALIZZATA
 * 
 * Sostituisce gli alert del browser con un modal elegante
 */

'use client';

import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalConfermaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titolo: string;
  messaggio: string;
  tipo?: 'warning' | 'danger' | 'success';
  testoConferma?: string;
  testoAnnulla?: string;
  caricamento?: boolean;
}

export default function ModalConferma({
  isOpen,
  onClose,
  onConfirm,
  titolo,
  messaggio,
  tipo = 'warning',
  testoConferma = 'Conferma',
  testoAnnulla = 'Annulla',
  caricamento = false,
}: ModalConfermaProps) {
  // Chiudi modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !caricamento) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, caricamento]);

  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (tipo) {
      case 'danger':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          buttonColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        };
    }
  };

  const { icon, bgColor, borderColor, buttonColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!caricamento ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Header con icona */}
          <div className={`${bgColor} ${borderColor} border-b px-6 py-4 rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {icon}
                <h3 className="text-lg font-semibold text-gray-900">
                  {titolo}
                </h3>
              </div>
              {!caricamento && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Contenuto */}
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed">
              {messaggio}
            </p>
          </div>

          {/* Footer con azioni */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={caricamento}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testoAnnulla}
            </button>
            <button
              onClick={onConfirm}
              disabled={caricamento}
              className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
            >
              {caricamento ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Attendere...</span>
                </div>
              ) : (
                testoConferma
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}