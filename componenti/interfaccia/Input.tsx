/**
 * COMPONENTE: INPUT
 * 
 * Campo input riutilizzabile con label e gestione errori.
 * 
 * PROPS:
 * - label: etichetta del campo
 * - type: tipo di input (text, email, password, etc.)
 * - value: valore corrente
 * - onChange: funzione chiamata al cambio valore
 * - placeholder: testo placeholder
 * - errore: messaggio di errore da mostrare
 * - required: campo obbligatorio
 */

import React from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  errore?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  errore,
  required = false,
  disabled = false,
  name,
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-field ${errore ? 'border-red-500 focus:ring-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      
      {errore && (
        <p className="text-red-500 text-sm mt-1">{errore}</p>
      )}
    </div>
  );
}
