# Esempi Pratici API Beauty Salon

Questa guida contiene esempi pratici di utilizzo delle nuove API per il sistema Beauty Salon.

## 📋 Indice

1. [Setup Iniziale](#setup-iniziale)
2. [Gestione Specialisti](#gestione-specialisti)
3. [Gestione Associazioni](#gestione-associazioni)
4. [Prenotazioni](#prenotazioni)
5. [Query Avanzate](#query-avanzate)

---

## Setup Iniziale

### 1. Esegui Migrazione Dati

```bash
# Con conferma interattiva
npm run migrate:beauty

# Automatica (per CI/CD)
npm run migrate:beauty:auto
```

### 2. Verifica Migrazione

```bash
# Connetti a MongoDB
mongosh "mongodb://localhost:27017/beauty-salon"

# Verifica collections
db.specialisti.countDocuments()
db.specialisti_servizi.countDocuments()
db.appointments.countDocuments({ specialista: { $exists: true } })
```

---

## Gestione Specialisti

### Creare Nuovo Specialista

```javascript
// POST /api/specialisti
const response = await fetch('/api/specialisti', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    utenteId: '507f1f77bcf86cd799439011',
    biografia: 'Esperta in trattamenti estetici avanzati con 10 anni di esperienza',
    descrizioneCompetenze: 'Specializzata in epilazione laser, fotoringiovanimento e trattamenti anti-age',
    telefono: '+393331234567',
    orariSettimanali: {
      lunedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      martedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      mercoledi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      giovedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      venerdi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      sabato: { aperto: true, oraInizio: '09:00', oraFine: '13:00' },
      domenica: { aperto: false }
    }
  })
});

const data = await response.json();
console.log('Specialista creato:', data.dati._id);
```

### Ottenere Lista Specialisti

```javascript
// GET /api/specialisti
const response = await fetch('/api/specialisti');
const data = await response.json();

data.dati.forEach(specialista => {
  console.log(`${specialista.nome} ${specialista.cognome}`);
  console.log(`Servizi: ${specialista.servizi.map(s => s.nome).join(', ')}`);
  console.log('---');
});
```

### Filtrare Specialisti per Servizio

```javascript
// GET /api/specialisti?servizioId=xxx
const servizioId = '507f1f77bcf86cd799439012';
const response = await fetch(`/api/specialisti?servizioId=${servizioId}`);
const data = await response.json();

console.log(`Specialisti che possono fare questo servizio: ${data.dati.length}`);
```

### Aggiornare Specialista

```javascript
// PUT /api/specialisti/:id
const specialistaId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/specialisti/${specialistaId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    biografia: 'Biografia aggiornata',
    descrizioneCompetenze: 'Nuove competenze acquisite',
    attivo: true
  })
});

const data = await response.json();
console.log('Specialista aggiornato:', data.successo);
```

### Aggiungere Giorno di Chiusura

```javascript
// PUT /api/specialisti/:id
const specialistaId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/specialisti/${specialistaId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    giorniChiusura: [
      {
        data: new Date('2026-08-15'),
        motivo: 'Ferie estive',
        tuttoIlGiorno: true
      },
      {
        data: new Date('2026-12-25'),
        motivo: 'Natale',
        tuttoIlGiorno: true
      }
    ]
  })
});
```

---

## Gestione Associazioni

### Associare Servizio a Specialista

```javascript
// POST /api/specialisti/:id/servizi
const specialistaId = '507f1f77bcf86cd799439011';
const servizioId = '507f1f77bcf86cd799439012';

const response = await fetch(`/api/specialisti/${specialistaId}/servizi`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    servizioId: servizioId,
    note: 'Disponibile solo il martedì e giovedì'
  })
});

const data = await response.json();
console.log('Associazione creata:', data.successo);
```

### Ottenere Servizi di uno Specialista

```javascript
// GET /api/specialisti/:id/servizi
const specialistaId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/specialisti/${specialistaId}/servizi`);
const data = await response.json();

console.log('Servizi offerti:');
data.dati.forEach(servizio => {
  console.log(`- ${servizio.nome} (${servizio.durata} min, €${servizio.prezzo})`);
  if (servizio.note) {
    console.log(`  Note: ${servizio.note}`);
  }
});
```

### Ottenere Specialisti per un Servizio

```javascript
// GET /api/servizi/:id/specialisti
const servizioId = '507f1f77bcf86cd799439012';
const response = await fetch(`/api/servizi/${servizioId}/specialisti`);
const data = await response.json();

console.log('Specialisti disponibili:');
data.dati.forEach(specialista => {
  console.log(`- ${specialista.nome} ${specialista.cognome}`);
  console.log(`  ${specialista.descrizioneCompetenze}`);
});
```

### Rimuovere Associazione

```javascript
// DELETE /api/specialisti/:id/servizi?servizioId=xxx
const specialistaId = '507f1f77bcf86cd799439011';
const servizioId = '507f1f77bcf86cd799439012';

const response = await fetch(
  `/api/specialisti/${specialistaId}/servizi?servizioId=${servizioId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
);

const data = await response.json();
console.log('Associazione rimossa:', data.successo);
```

### Associazioni Multiple (Batch)

```javascript
// Associa specialista a più servizi
const specialistaId = '507f1f77bcf86cd799439011';
const serviziIds = [
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013',
  '507f1f77bcf86cd799439014'
];

const promises = serviziIds.map(servizioId =>
  fetch(`/api/specialisti/${specialistaId}/servizi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({ servizioId })
  })
);

const results = await Promise.all(promises);
console.log(`Associati ${results.length} servizi`);
```

---

## Prenotazioni

### Flusso Completo di Prenotazione

```javascript
// STEP 1: Utente sceglie servizio
const serviziResponse = await fetch('/api/servizi');
const servizi = await serviziResponse.json();
const servizioScelto = servizi.dati[0]; // Es: Manicure Gel

// STEP 2: Sistema mostra specialisti per quel servizio
const specialistiResponse = await fetch(
  `/api/servizi/${servizioScelto._id}/specialisti`
);
const specialisti = await specialistiResponse.json();
const specialistaScelto = specialisti.dati[0]; // Es: Maria Rossi

// STEP 3: Utente sceglie data
const dataScelta = '2026-05-20';

// STEP 4: Sistema mostra slot orari disponibili
const disponibilitaResponse = await fetch(
  `/api/specialisti/${specialistaScelto._id}/disponibilita?data=${dataScelta}&durata=${servizioScelto.durata}`
);
const disponibilita = await disponibilitaResponse.json();
const oraScelta = disponibilita.dati.slot.find(s => s.disponibile).ora; // Es: 10:00

// STEP 5: Utente conferma prenotazione
const prenotazioneResponse = await fetch('/api/appuntamenti', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    specialistaId: specialistaScelto._id,
    servizioId: servizioScelto._id,
    data: dataScelta,
    oraInizio: oraScelta,
    clienteNome: 'Mario',
    clienteCognome: 'Rossi',
    clienteTelefono: '+393331234567',
    note: 'Prima volta, preferisco colori naturali'
  })
});

const prenotazione = await prenotazioneResponse.json();
console.log('Prenotazione confermata:', prenotazione.dati._id);
```

### Creare Appuntamento (Nuovo Sistema)

```javascript
// POST /api/appuntamenti con specialistaId
const response = await fetch('/api/appuntamenti', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    specialistaId: '507f1f77bcf86cd799439011',
    servizioId: '507f1f77bcf86cd799439012',
    data: '2026-05-20',
    oraInizio: '10:00',
    clienteNome: 'Mario',
    clienteCognome: 'Rossi',
    clienteTelefono: '+393331234567',
    note: 'Prima volta'
  })
});

const data = await response.json();
if (data.successo) {
  console.log('Appuntamento creato:', data.dati._id);
  console.log('Ora fine:', data.dati.oraFine); // Calcolata automaticamente
  console.log('Stato:', data.dati.stato); // in_attesa o confermato
} else {
  console.error('Errore:', data.errore);
}
```

### Verificare Disponibilità

```javascript
// GET /api/specialisti/:id/disponibilita
const specialistaId = '507f1f77bcf86cd799439011';
const data = '2026-05-20';
const durata = 60; // minuti

const response = await fetch(
  `/api/specialisti/${specialistaId}/disponibilita?data=${data}&durata=${durata}`
);
const disponibilita = await response.json();

console.log('Slot disponibili:');
disponibilita.dati.slot
  .filter(s => s.disponibile)
  .forEach(slot => console.log(`- ${slot.ora}`));
```

### Gestire Errori di Prenotazione

```javascript
try {
  const response = await fetch('/api/appuntamenti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      specialistaId: '507f1f77bcf86cd799439011',
      servizioId: '507f1f77bcf86cd799439012',
      data: '2026-05-20',
      oraInizio: '10:00',
      clienteNome: 'Mario',
      clienteCognome: 'Rossi',
      clienteTelefono: '+393331234567'
    })
  });

  const data = await response.json();

  if (!data.successo) {
    // Gestisci errori specifici
    switch (data.errore) {
      case 'Lo specialista selezionato non può eseguire questo servizio':
        console.error('Associazione mancante! Verifica le competenze dello specialista.');
        break;
      case 'Orario non disponibile. Scegli un altro slot.':
        console.error('Slot già occupato. Ricarica disponibilità.');
        break;
      case 'Non puoi prenotare un appuntamento nel passato':
        console.error('Data non valida.');
        break;
      default:
        console.error('Errore generico:', data.errore);
    }
  }
} catch (error) {
  console.error('Errore di rete:', error);
}
```

---

## Query Avanzate

### Trovare Specialisti Disponibili per Servizio e Data

```javascript
async function trovaSpecialistiDisponibili(servizioId, data, durata) {
  // 1. Ottieni specialisti per servizio
  const specialistiResp = await fetch(`/api/servizi/${servizioId}/specialisti`);
  const specialisti = await specialistiResp.json();

  // 2. Verifica disponibilità per ogni specialista
  const disponibilita = await Promise.all(
    specialisti.dati.map(async (specialista) => {
      const dispResp = await fetch(
        `/api/specialisti/${specialista._id}/disponibilita?data=${data}&durata=${durata}`
      );
      const disp = await dispResp.json();
      
      return {
        specialista,
        slotDisponibili: disp.dati.slot.filter(s => s.disponibile)
      };
    })
  );

  // 3. Filtra solo specialisti con slot disponibili
  return disponibilita.filter(d => d.slotDisponibili.length > 0);
}

// Utilizzo
const risultati = await trovaSpecialistiDisponibili(
  '507f1f77bcf86cd799439012',
  '2026-05-20',
  60
);

console.log('Specialisti disponibili:');
risultati.forEach(({ specialista, slotDisponibili }) => {
  console.log(`\n${specialista.nome} ${specialista.cognome}`);
  console.log(`Slot: ${slotDisponibili.map(s => s.ora).join(', ')}`);
});
```

### Statistiche Specialista

```javascript
async function statisticheSpecialista(specialistaId) {
  // Ottieni dettagli specialista
  const specResp = await fetch(`/api/specialisti/${specialistaId}`);
  const specialista = await specResp.json();

  // Ottieni appuntamenti
  const appResp = await fetch(`/api/appuntamenti?specialistaId=${specialistaId}`);
  const appuntamenti = await appResp.json();

  return {
    nome: `${specialista.dati.nome} ${specialista.dati.cognome}`,
    numeroServizi: specialista.dati.servizi.length,
    serviziOfferti: specialista.dati.servizi.map(s => s.nome),
    totaleAppuntamenti: appuntamenti.dati.length,
    appuntamentiConfermati: appuntamenti.dati.filter(a => a.stato === 'confermato').length,
    appuntamentiCompletati: appuntamenti.dati.filter(a => a.stato === 'completato').length
  };
}

// Utilizzo
const stats = await statisticheSpecialista('507f1f77bcf86cd799439011');
console.log(JSON.stringify(stats, null, 2));
```

### Servizi Più Richiesti

```javascript
async function serviziPiuRichiesti() {
  // Ottieni tutti gli appuntamenti
  const response = await fetch('/api/appuntamenti');
  const appuntamenti = await response.json();

  // Conta occorrenze per servizio
  const conteggio = {};
  appuntamenti.dati.forEach(app => {
    const servizioId = app.servizio._id;
    const servizioNome = app.servizio.nome;
    
    if (!conteggio[servizioId]) {
      conteggio[servizioId] = {
        nome: servizioNome,
        count: 0
      };
    }
    conteggio[servizioId].count++;
  });

  // Ordina per count
  return Object.values(conteggio)
    .sort((a, b) => b.count - a.count);
}

// Utilizzo
const topServizi = await serviziPiuRichiesti();
console.log('Top 5 servizi:');
topServizi.slice(0, 5).forEach((s, i) => {
  console.log(`${i + 1}. ${s.nome} (${s.count} prenotazioni)`);
});
```

### Verifica Copertura Servizi

```javascript
async function verificaCopertura() {
  // Ottieni tutti i servizi
  const serviziResp = await fetch('/api/servizi');
  const servizi = await serviziResp.json();

  // Per ogni servizio, conta specialisti
  const copertura = await Promise.all(
    servizi.dati.map(async (servizio) => {
      const specResp = await fetch(`/api/servizi/${servizio._id}/specialisti`);
      const specialisti = await specResp.json();
      
      return {
        servizio: servizio.nome,
        numeroSpecialisti: specialisti.dati.length,
        specialisti: specialisti.dati.map(s => `${s.nome} ${s.cognome}`)
      };
    })
  );

  // Trova servizi senza copertura
  const serviziScoperti = copertura.filter(c => c.numeroSpecialisti === 0);
  
  return {
    totaleServizi: copertura.length,
    serviziCoperti: copertura.filter(c => c.numeroSpecialisti > 0).length,
    serviziScoperti: serviziScoperti.map(s => s.servizio),
    dettagli: copertura
  };
}

// Utilizzo
const copertura = await verificaCopertura();
console.log(`Servizi coperti: ${copertura.serviziCoperti}/${copertura.totaleServizi}`);
if (copertura.serviziScoperti.length > 0) {
  console.log('⚠️  Servizi senza specialisti:', copertura.serviziScoperti.join(', '));
}
```

---

## 🔧 Utility Functions

### Normalizza Telefono

```javascript
function normalizzaTelefono(telefono) {
  let numeroPulito = telefono.replace(/[\s\-\(\)\.]/g, '');
  
  if (numeroPulito.startsWith('+39')) {
    return numeroPulito;
  }
  
  if (numeroPulito.startsWith('39') && numeroPulito.length >= 12) {
    return '+' + numeroPulito;
  }
  
  if (numeroPulito.startsWith('3') && numeroPulito.length >= 10) {
    return '+39' + numeroPulito;
  }
  
  if (numeroPulito.startsWith('0') && numeroPulito.length >= 10) {
    return '+39' + numeroPulito.substring(1);
  }
  
  return '+39' + numeroPulito;
}

// Utilizzo
console.log(normalizzaTelefono('333-1234567')); // +393331234567
console.log(normalizzaTelefono('+39 333 1234567')); // +393331234567
```

### Formatta Data

```javascript
function formattaData(dataStr) {
  const data = new Date(dataStr);
  return data.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Utilizzo
console.log(formattaData('2026-05-20')); // mercoledì 20 maggio 2026
```

### Calcola Ora Fine

```javascript
function calcolaOraFine(oraInizio, durataMinuti) {
  const [ore, minuti] = oraInizio.split(':').map(Number);
  const minutiTotali = ore * 60 + minuti + durataMinuti;
  const oreFine = Math.floor(minutiTotali / 60);
  const minutiFine = minutiTotali % 60;
  return `${String(oreFine).padStart(2, '0')}:${String(minutiFine).padStart(2, '0')}`;
}

// Utilizzo
console.log(calcolaOraFine('10:00', 60)); // 11:00
console.log(calcolaOraFine('10:30', 90)); // 12:00
```

---

## 📝 Note Finali

### Best Practices

1. **Sempre validare associazioni**: Prima di creare un appuntamento, verifica che l'associazione specialista-servizio esista
2. **Gestire errori**: Implementa gestione errori robusta per tutti i casi (associazione mancante, slot occupato, etc.)
3. **Cache intelligente**: Cachea le query frequenti (lista servizi, lista specialisti) per ridurre carico
4. **Feedback utente**: Mostra messaggi chiari quando un'operazione fallisce
5. **Logging**: Logga tutte le operazioni critiche (creazione associazioni, prenotazioni)

### Errori Comuni

- ❌ Dimenticare di verificare associazione specialista-servizio
- ❌ Non gestire il caso "nessuno specialista disponibile"
- ❌ Non ricaricare disponibilità dopo ogni selezione
- ❌ Non normalizzare numeri di telefono
- ❌ Non validare date nel passato

### Risorse

- Documentazione completa: `MIGRAZIONE_BEAUTY_SALON.md`
- Riepilogo: `RIEPILOGO_TRASFORMAZIONE_BEAUTY.md`
- README: `README_BEAUTY_SALON.md`

---

**Buon sviluppo! 🚀**
