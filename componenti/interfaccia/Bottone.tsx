/**
 * COMPONENTE: BOTTONE
 * 
 * Bottone riutilizzabile con diverse varianti.
 * 
 * PROPS:
 * - children: contenuto del bottone
 * - variante: 'primary' | 'secondary' | 'danger'
 * - dimensione: 'small' | 'medium' | 'large'
 * - onClick: funzione da eseguire al click
 * - disabled: disabilita il bottone
 * - type: tipo del bottone ('button' | 'submit' | 'reset')
 */

import React from 'react';

export interface BottoneProps {
  children: React.ReactNode;
  variante?: 'primary' | 'secondary' | 'danger';
  dimensione?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string; // Tooltip HTML nativo
}

export default function Bottone({
  children,
  variante = 'primary',
  dimensione = 'medium',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  title,
  ...rest
}: BottoneProps) {
  // Classi base
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Classi per variante
  const varianteClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  // Classi per dimensione
  const dimensioneClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // Classi per stato disabled
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  const classiFinali = `${baseClasses} ${varianteClasses[variante]} ${dimensioneClasses[dimensione]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classiFinali}
      title={title}
      {...rest}
    >
      {children}
    </button>
  );
}
