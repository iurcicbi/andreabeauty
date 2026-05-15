# Guida Form Barber CMS - Gestione Specializzazioni

## 📋 Panoramica

Nel CMS, nella pagina `/cms/barber/[id]`, devi aggiungere una sezione per gestire le **specializzazioni** del barber. Le specializzazioni sono i servizi che il barber può eseguire, selezionati dalla collection `services`.

## 🎨 Implementazione Form

### Struttura Pagina

```tsx
// app/(cms)/cms/barber/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import webservice from '@/utils/webservice';

interface Servizio {
  _id: string;
  nome: string;
  categoria: string;
  durata: number;
  prezzo: number;
  descrizione?: string;
}

interface Barber {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
  };
  biografia: string;
  specializzazioni: Servizio[];  // Array di servizi popolati
  telefono: string;
  orariSettimanali: any;
  giorniChiusura: any[];
  attivo: boolean;
}

export default function BarberEditPage() {
  const params = useParams();
  const router = useRouter();
  const barberId = params.id as string;
  
  // Stati
  const [barber, setBarber] = useState<Barber | null>(null);
  const [tuttiServizi, setTuttiServizi] = useState<Servizio[]>([]);
  const [specializzazioniSelezionate, setSpecializzazioniSelezionate] = useState<string[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  // Carica dati iniziali
  useEffect(() => {
    caricaDati();
  }, [barberId]);
  
  const caricaDati = async () => {
    try {
      setCaricamento(true);
      
      // Carica barber
      const barberResp = await webservice.get(`/api/barber/gestione/${barberId}`);
      setBarber(barberResp.dati);
      
      // Estrai gli ID dei servizi già selezionati
      const serviziIds = barberResp.dati.specializzazioni.map((s: Servizio) => s._id);
      setSpecializzazioniSelezionate(serviziIds);
      
      // Carica tutti i servizi disponibili
      const serviziResp = await webservice.get('/api/servizi/cms');
      setTuttiServizi(serviziResp.dati);
      
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setCaricamento(false);
    }
  };
  
  const handleToggleServizio = (servizioId: string) => {
    setSpecializzazioniSelezionate(prev => {
      if (prev.includes(servizioId)) {
        // Rimuovi
        return prev.filter(id => id !== servizioId);
      } else {
        // Aggiungi
        return [...prev, servizioId];
      }
    });
  };
  
  const handleSalva = async () => {
    try {
      setSalvando(true);
      
      await webservice.put(`/api/barber/gestione/${barberId}`, {
        // ... altri campi del barber
        specializzazioni: specializzazioniSelezionate
      });
      
      alert('Barber aggiornato con successo!');
      router.push('/cms/barber');
      
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setSalvando(false);
    }
  };
  
  if (caricamento) {
    return <div>Caricamento...</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Modifica Barber: {barber?.utente.nome} {barber?.utente.cognome}
      </h1>
      
      {/* ... Altri campi del form ... */}
      
      {/* SEZIONE SPECIALIZZAZIONI */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Specializzazioni</h2>
        <p className="text-gray-600 mb-4">
          Seleziona i servizi che questo barber può eseguire
        </p>
        
        {/* Grid di servizi selezionabili */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tuttiServizi.map(servizio => {
            const isSelected = specializzazioniSelezionate.includes(servizio._id);
            
            return (
              <div
                key={servizio._id}
                onClick={() => handleToggleServizio(servizio._id)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{servizio.nome}</h3>
                    <p className="text-sm text-gray-600 mb-2">{servizio.categoria}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-700">
                        ⏱️ {servizio.durata} min
                      </span>
                      <span className="font-semibold text-green-600">
                        €{servizio.prezzo}
                      </span>
                    </div>
                  </div>
                  
                  {/* Checkbox visivo */}
                  <div className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  `}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Contatore servizi selezionati */}
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-medium">
            Servizi selezionati: <span className="text-blue-600">{specializzazioniSelezionate.length}</span> / {tuttiServizi.length}
          </p>
        </div>
      </div>
      
      {/* Pulsanti azione */}
      <div className="flex gap-4">
        <button
          onClick={handleSalva}
          disabled={salvando}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
        
        <button
          onClick={() => router.push('/cms/barber')}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
```

## 🎨 Varianti UI

### Variante 1: Lista con Checkbox

```tsx
<div className="space-y-2">
  {tuttiServizi.map(servizio => (
    <label
      key={servizio._id}
      className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
    >
      <input
        type="checkbox"
        checked={specializzazioniSelezionate.includes(servizio._id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSpecializzazioniSelezionate(prev => [...prev, servizio._id]);
          } else {
            setSpecializzazioniSelezionate(prev => prev.filter(id => id !== servizio._id));
          }
        }}
        className="mr-3 w-5 h-5"
      />
      <div className="flex-1">
        <span className="font-medium">{servizio.nome}</span>
        <span className="text-sm text-gray-600 ml-2">
          ({servizio.durata} min, €{servizio.prezzo})
        </span>
      </div>
    </label>
  ))}
</div>
```

### Variante 2: Select Multipla

```tsx
<select
  multiple
  value={specializzazioniSelezionate}
  onChange={(e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSpecializzazioniSelezionate(selected);
  }}
  className="w-full border rounded p-2 h-64"
>
  {tuttiServizi.map(servizio => (
    <option key={servizio._id} value={servizio._id}>
      {servizio.nome} - {servizio.categoria} ({servizio.durata} min, €{servizio.prezzo})
    </option>
  ))}
</select>
<p className="text-sm text-gray-600 mt-2">
  Tieni premuto Ctrl (Windows) o Cmd (Mac) per selezionare più servizi
</p>
```

### Variante 3: Tabs per Categoria

```tsx
const [categoriaAttiva, setCategoriaAttiva] = useState('Tutti');

// Raggruppa servizi per categoria
const categorie = ['Tutti', ...new Set(tuttiServizi.map(s => s.categoria))];
const serviziFiltrati = categoriaAttiva === 'Tutti' 
  ? tuttiServizi 
  : tuttiServizi.filter(s => s.categoria === categoriaAttiva);

return (
  <>
    {/* Tabs categorie */}
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {categorie.map(cat => (
        <button
          key={cat}
          onClick={() => setCategoriaAttiva(cat)}
          className={`
            px-4 py-2 rounded-lg whitespace-nowrap
            ${categoriaAttiva === cat 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
    
    {/* Grid servizi filtrati */}
    <div className="grid grid-cols-2 gap-4">
      {serviziFiltrati.map(servizio => (
        // ... card servizio
      ))}
    </div>
  </>
);
```

## 📡 API Calls

### Carica Barber con Servizi

```javascript
// GET /api/barber/gestione/:id
const response = await fetch(`/api/barber/gestione/${barberId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// data.dati.specializzazioni è un array di oggetti servizio popolati
console.log('Servizi attuali:', data.dati.specializzazioni);
```

### Salva Specializzazioni

```javascript
// PUT /api/barber/gestione/:id
const response = await fetch(`/api/barber/gestione/${barberId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    specializzazioni: [
      'servizioId1',
      'servizioId2',
      'servizioId3'
    ]
  })
});
```

## 🔍 Ricerca e Filtri

### Aggiungi Ricerca

```tsx
const [ricerca, setRicerca] = useState('');

const serviziFiltrati = tuttiServizi.filter(servizio =>
  servizio.nome.toLowerCase().includes(ricerca.toLowerCase()) ||
  servizio.categoria.toLowerCase().includes(ricerca.toLowerCase())
);

return (
  <>
    <input
      type="text"
      value={ricerca}
      onChange={(e) => setRicerca(e.target.value)}
      placeholder="Cerca servizio..."
      className="w-full p-3 border rounded-lg mb-4"
    />
    
    <div className="grid grid-cols-2 gap-4">
      {serviziFiltrati.map(servizio => (
        // ... card servizio
      ))}
    </div>
  </>
);
```

## ✅ Validazioni

### Validazione Minimo Servizi

```tsx
const handleSalva = async () => {
  // Validazione: almeno un servizio
  if (specializzazioniSelezionate.length === 0) {
    alert('Seleziona almeno un servizio');
    return;
  }
  
  // Validazione: massimo servizi (opzionale)
  if (specializzazioniSelezionate.length > 20) {
    alert('Massimo 20 servizi per barber');
    return;
  }
  
  // Procedi con il salvataggio
  // ...
};
```

## 📊 Visualizzazione Lista Barber

### Mostra Servizi nella Tabella

```tsx
// app/(cms)/cms/barber/page.tsx

<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th>Servizi</th>
      <th>Azioni</th>
    </tr>
  </thead>
  <tbody>
    {barbers.map(barber => (
      <tr key={barber._id}>
        <td>{barber.utente.nome} {barber.utente.cognome}</td>
        <td>{barber.utente.email}</td>
        <td>
          <div className="flex flex-wrap gap-1">
            {barber.specializzazioni.slice(0, 3).map(servizio => (
              <span
                key={servizio._id}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {servizio.nome}
              </span>
            ))}
            {barber.specializzazioni.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{barber.specializzazioni.length - 3}
              </span>
            )}
          </div>
        </td>
        <td>
          <button onClick={() => router.push(`/cms/barber/${barber._id}`)}>
            Modifica
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## 🎯 Best Practices

1. **Carica servizi una volta**: Usa `useEffect` per caricare i servizi all'inizio
2. **Feedback visivo**: Mostra chiaramente quali servizi sono selezionati
3. **Contatore**: Mostra quanti servizi sono selezionati
4. **Ricerca**: Aggiungi ricerca per liste lunghe
5. **Categorie**: Raggruppa per categoria se hai molti servizi
6. **Validazione**: Controlla che almeno un servizio sia selezionato
7. **Loading state**: Mostra spinner durante caricamento e salvataggio
8. **Conferma**: Chiedi conferma prima di salvare modifiche importanti

## 🚀 Esempio Completo Minimo

```tsx
'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';

export default function BarberEditPage({ params }: { params: { id: string } }) {
  const [servizi, setServizi] = useState([]);
  const [selezionati, setSelezionati] = useState<string[]>([]);
  
  useEffect(() => {
    // Carica barber e servizi
    Promise.all([
      webservice.get(`/api/barber/gestione/${params.id}`),
      webservice.get('/api/servizi/cms')
    ]).then(([barberResp, serviziResp]) => {
      setServizi(serviziResp.dati);
      setSelezionati(barberResp.dati.specializzazioni.map((s: any) => s._id));
    });
  }, []);
  
  const handleSalva = async () => {
    await webservice.put(`/api/barber/gestione/${params.id}`, {
      specializzazioni: selezionati
    });
    alert('Salvato!');
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Specializzazioni</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {servizi.map((s: any) => (
          <div
            key={s._id}
            onClick={() => setSelezionati(prev => 
              prev.includes(s._id) 
                ? prev.filter(id => id !== s._id)
                : [...prev, s._id]
            )}
            className={`p-4 border-2 rounded cursor-pointer ${
              selezionati.includes(s._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <h3 className="font-bold">{s.nome}</h3>
            <p className="text-sm">{s.durata} min • €{s.prezzo}</p>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSalva}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Salva
      </button>
    </div>
  );
}
```

---

**Con questa implementazione, il CMS avrà una gestione intuitiva delle specializzazioni!** 🚀
