/**
 * COMPONENTE: CARD
 * 
 * Contenitore card riutilizzabile per contenuti.
 * 
 * PROPS:
 * - children: contenuto della card
 * - titolo: titolo opzionale
 * - className: classi CSS aggiuntive
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  titolo?: string;
  className?: string;
}

export default function Card({ children, titolo, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {titolo && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{titolo}</h3>
      )}
      {children}
    </div>
  );
}
