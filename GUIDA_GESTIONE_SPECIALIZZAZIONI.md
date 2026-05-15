# Guida Gestione Specializzazioni - Approccio Semplificato

## 📋 Panoramica

Il sistema usa un **approccio semplificato** per gestire le specializzazioni: ogni specialista ha un **array di riferimenti** ai servizi che può eseguire, direttamente nel suo documento.

### ✅ Vantaggi di Questo Approccio

- **Più semplice**: Nessuna tabella pivot separata
- **Più veloce**: Meno query al database
- **Più intuitivo**: Gestione diretta nel CMS
- **Più performante**: Populate automatico con Mongoose

## 🗄️ Struttura Database

### Schema Specialista

```typescript
{
  _id: ObjectId,
  utente: ObjectId → users,
  biografia: String,
  specializzazioni: [ObjectId] → services,  // Array di servizi
  telefono: String,
  orariSettimanali: {...},
  giorniChiusura: [...],
  impostazioni: {...},
  attivo: Boolean
}
```

### Esempio Documento

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  utente: ObjectId("507f1f77bcf86cd799439001"),
  biografia: "Esperta in trattamenti estetici avanzati",
  specializzazioni: [
    ObjectId("507f1f77bcf86cd799439021"),  // Manicure Base
    ObjectId("507f1f77bcf86cd799439022"),  // Manicure Gel
    ObjectId("507f1f77bcf86cd799439023"),  // Pedicure
    ObjectId("507f1f77bcf86cd799439024")   // Nail Art
  ],
  telefono: "+393331234567",
  attivo: true
}
```

## 🎨 Gestione nel CMS

### Form Specialista

```tsx
// Componente Form Specialista
export default function FormSpecialista({ specialistaId }: { specialistaId?: string }) {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [specializzazioniSelezionate, setSpecializzazioniSelezionate] = useState<string[]>([]);
  
  useEffect(() => {
    // Carica tutti i servizi disponibili
    caricaServizi();
    
    // Se modifica, carica specializzazioni attuali
    if (specialistaId) {
      caricaSpecialista();
    }
  }, []);
  
  const caricaServizi = async () => {
    const response = await fetch('/api/servizi');
    const data = await response.json();
    setServizi(data.dati);
  };
  
  const caricaSpecialista = async () => {
    const response = await fetch(`/api/specialisti/${specialistaId}`);
    const data = await response.json();
    // Estrai gli ID dei servizi
    const serviziIds = data.dati.servizi.map((s: any) => s._id);
    setSpecializzazioniSelezionate(serviziIds);
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
    const body = {
      // ... altri campi
      specializzazioni: specializzazioniSelezionate
    };
    
    if (specialistaId) {
      // Aggiorna
      await fetch(`/api/specialisti/${specialistaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      // Crea nuovo
      await fetch('/api/specialisti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
  };
  
  return (
    <div>
      {/* ... altri campi ... */}
      
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">
          Specializzazioni (Servizi)
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          {servizi.map(servizio => (
            <div
              key={servizio._id}
              onClick={() => handleToggleServizio(servizio._id)}
              className={`
                p-4 border-2 rounded cursor-pointer transition-all
                ${specializzazioniSelezionate.includes(servizio._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{servizio.nome}</h4>
                  <p className="text-sm text-gray-600">
                    {servizio.durata} min • €{servizio.prezzo}
                  </p>
                </div>
                
                {specializzazioniSelezionate.includes(servizio._id) && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          Selezionati: {specializzazioniSelezionate.length} servizi
        </p>
      </div>
      
      <button onClick={handleSalva} className="btn-primary">
        Salva Specialista
      </button>
    </div>
  );
}
```

### Alternativa: Select Multipla

```tsx
// Versione con select multipla nativa
<div className="mb-6">
  <label className="block text-sm font-bold mb-2">
    Specializzazioni (Servizi)
  </label>
  
  <select
    multiple
    value={specializzazioniSelezionate}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      setSpecializzazioniSelezionate(selected);
    }}
    className="w-full border rounded p-2 h-64"
  >
    {servizi.map(servizio => (
      <option key={servizio._id} value={servizio._id}>
        {servizio.nome} ({servizio.durata} min, €{servizio.prezzo})
      </option>
    ))}
  </select>
  
  <p className="text-sm text-gray-600 mt-2">
    Tieni premuto Ctrl (Windows) o Cmd (Mac) per selezionare più servizi
  </p>
</div>
```

### Alternativa: Checkbox List

```tsx
// Versione con checkbox list
<div className="mb-6">
  <label className="block text-sm font-bold mb-2">
    Specializzazioni (Servizi)
  </label>
  
  <div className="border rounded p-4 max-h-96 overflow-y-auto">
    {servizi.map(servizio => (
      <label
        key={servizio._id}
        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
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
          className="mr-3"
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
</div>
```

## 📡 API Usage

### Creare Specialista con Specializzazioni

```javascript
// POST /api/specialisti
const response = await fetch('/api/specialisti', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    utenteId: '507f1f77bcf86cd799439001',
    biografia: 'Esperta in nail art',
    specializzazioni: [
      '507f1f77bcf86cd799439021',  // Manicure Base
      '507f1f77bcf86cd799439022',  // Manicure Gel
      '507f1f77bcf86cd799439023',  // Pedicure
      '507f1f77bcf86cd799439024'   // Nail Art
    ],
    telefono: '+393331234567'
  })
});

const data = await response.json();
console.log('Specialista creato:', data.dati);
```

### Aggiornare Specializzazioni

```javascript
// PUT /api/specialisti/:id
const response = await fetch(`/api/specialisti/${specialistaId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    specializzazioni: [
      '507f1f77bcf86cd799439021',  // Manicure Base
      '507f1f77bcf86cd799439022',  // Manicure Gel
      '507f1f77bcf86cd799439025'   // Nuovo: Ricostruzione Unghie
    ]
  })
});
```

### Ottenere Specialista con Servizi Popolati

```javascript
// GET /api/specialisti/:id
const response = await fetch(`/api/specialisti/${specialistaId}`);
const data = await response.json();

console.log('Specialista:', data.dati.nome, data.dati.cognome);
console.log('Servizi:');
data.dati.servizi.forEach(servizio => {
  console.log(`- ${servizio.nome} (${servizio.durata} min, €${servizio.prezzo})`);
});
```

### Filtrare Specialisti per Servizio

```javascript
// GET /api/specialisti?servizioId=xxx
const servizioId = '507f1f77bcf86cd799439021';
const response = await fetch(`/api/specialisti?servizioId=${servizioId}`);
const data = await response.json();

console.log(`Specialisti che possono fare questo servizio: ${data.dati.length}`);
data.dati.forEach(spec => {
  console.log(`- ${spec.nome} ${spec.cognome}`);
});
```

### Ottenere Specialisti per Servizio

```javascript
// GET /api/servizi/:id/specialisti
const servizioId = '507f1f77bcf86cd799439021';
const response = await fetch(`/api/servizi/${servizioId}/specialisti`);
const data = await response.json();

console.log('Specialisti disponibili:');
data.dati.forEach(spec => {
  console.log(`- ${spec.nome} ${spec.cognome}`);
  console.log(`  Servizi totali: ${spec.servizi.length}`);
});
```

## 🔍 Query MongoDB

### Trova Specialisti per Servizio

```javascript
// Trova tutti gli specialisti che possono fare "Manicure Gel"
db.specialisti.find({
  specializzazioni: ObjectId("507f1f77bcf86cd799439022"),
  attivo: true
})
```

### Conta Specialisti per Servizio

```javascript
// Conta quanti specialisti possono fare ogni servizio
db.specialisti.aggregate([
  { $unwind: "$specializzazioni" },
  { $group: {
    _id: "$specializzazioni",
    count: { $sum: 1 }
  }},
  { $lookup: {
    from: "services",
    localField: "_id",
    foreignField: "_id",
    as: "servizio"
  }},
  { $unwind: "$servizio" },
  { $project: {
    servizio: "$servizio.nome",
    numeroSpecialisti: "$count"
  }},
  { $sort: { numeroSpecialisti: -1 }}
])
```

### Trova Servizi Senza Copertura

```javascript
// Trova servizi che nessuno specialista può fare
db.services.aggregate([
  { $lookup: {
    from: "specialisti",
    localField: "_id",
    foreignField: "specializzazioni",
    as: "specialisti"
  }},
  { $match: {
    "specialisti": { $size: 0 },
    attivo: true
  }},
  { $project: {
    nome: 1,
    categoria: 1,
    durata: 1,
    prezzo: 1
  }}
])
```

## 🔄 Migrazione da Barber

### Script Migrazione Aggiornato

```javascript
// Migra da barber.specializzazioni (array di stringhe)
// a specialista.specializzazioni (array di ObjectId)

const barbers = await Barber.find({});

for (const barber of barbers) {
  // Trova servizi che matchano le specializzazioni testuali
  const serviziIds = [];
  
  if (barber.specializzazioni && barber.specializzazioni.length > 0) {
    for (const spec of barber.specializzazioni) {
      // Cerca servizi per nome o categoria
      const servizi = await Servizio.find({
        $or: [
          { nome: new RegExp(spec, 'i') },
          { categoria: new RegExp(spec, 'i') }
        ]
      });
      
      serviziIds.push(...servizi.map(s => s._id));
    }
  }
  
  // Se non trova match, assegna tutti i servizi
  if (serviziIds.length === 0) {
    const tuttiServizi = await Servizio.find({ attivo: true });
    serviziIds.push(...tuttiServizi.map(s => s._id));
  }
  
  // Crea specialista
  await Specialista.create({
    utente: barber.utente,
    biografia: barber.biografia,
    specializzazioni: [...new Set(serviziIds)], // Rimuovi duplicati
    telefono: barber.telefono,
    orariSettimanali: barber.orariSettimanali,
    giorniChiusura: barber.giorniChiusura,
    impostazioni: barber.impostazioni,
    attivo: barber.attivo
  });
}
```

## ✅ Validazioni

### Validazione Prenotazione

```javascript
// Quando un cliente prenota, verifica che lo specialista
// abbia il servizio nelle sue specializzazioni

const specialista = await Specialista.findById(specialistaId);

const hasServizio = specialista.specializzazioni.some(
  s => s.toString() === servizioId
);

if (!hasServizio) {
  throw new Error('Lo specialista non può eseguire questo servizio');
}
```

### Validazione Form CMS

```javascript
// Assicurati che almeno un servizio sia selezionato
if (specializzazioni.length === 0) {
  alert('Seleziona almeno un servizio');
  return;
}

// Limite massimo (opzionale)
if (specializzazioni.length > 20) {
  alert('Massimo 20 servizi per specialista');
  return;
}
```

## 📊 Statistiche

### Servizi per Specialista

```javascript
// Mostra quanti servizi offre ogni specialista
const specialisti = await Specialista.find({ attivo: true })
  .populate('utente', 'nome cognome')
  .populate('specializzazioni', 'nome');

specialisti.forEach(spec => {
  console.log(`${spec.utente.nome} ${spec.utente.cognome}:`);
  console.log(`  Servizi: ${spec.specializzazioni.length}`);
  spec.specializzazioni.forEach(s => {
    console.log(`  - ${s.nome}`);
  });
});
```

### Copertura Servizi

```javascript
// Verifica che ogni servizio abbia almeno uno specialista
const servizi = await Servizio.find({ attivo: true });

for (const servizio of servizi) {
  const count = await Specialista.countDocuments({
    specializzazioni: servizio._id,
    attivo: true
  });
  
  console.log(`${servizio.nome}: ${count} specialisti`);
  
  if (count === 0) {
    console.warn(`⚠️  Nessuno specialista per ${servizio.nome}`);
  }
}
```

## 🎯 Best Practices

1. **Sempre popolare**: Usa `.populate('specializzazioni')` per avere i dettagli completi
2. **Validare**: Verifica sempre che lo specialista abbia il servizio prima di prenotare
3. **Indicizzare**: Crea indice su `specializzazioni` per query veloci
4. **Limitare**: Considera un limite massimo di servizi per specialista
5. **Monitorare**: Controlla regolarmente la copertura dei servizi

## 🔧 Indici MongoDB

```javascript
// Crea indici per performance ottimali
db.specialisti.createIndex({ specializzazioni: 1 });
db.specialisti.createIndex({ attivo: 1 });
db.specialisti.createIndex({ utente: 1 }, { unique: true });
```

---

**Questo approccio semplificato rende la gestione delle specializzazioni molto più intuitiva e performante!** 🚀
