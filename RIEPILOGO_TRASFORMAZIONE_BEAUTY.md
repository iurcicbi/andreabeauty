# Riepilogo Trasformazione: Barbershop → Beauty Salon

## ✅ Implementazione Completata

### 1. Database - Nuovi Schemi MongoDB

#### ✅ Schema Specialista
- **File**: `utils/mongo/schemi/Specialista.ts`
- **Collection**: `specialisti`
- **Caratteristiche**:
  - Sostituisce il concetto di "Barber"
  - Aggiunto campo `descrizioneCompetenze` specifico per beauty
  - Mantiene orari settimanali, giorni chiusura, impostazioni
  - Compatibile con struttura esistente

#### ✅ Schema SpecialistaServizio (Many-to-Many)
- **File**: `utils/mongo/schemi/SpecialistaServizio.ts`
- **Collection**: `specialisti_servizi`
- **Caratteristiche**:
  - Tabella pivot per relazione many-to-many
  - Indici ottimizzati per query veloci
  - Campo `attivo` per disabilitare temporaneamente associazioni
  - Campo `note` per informazioni aggiuntive

#### ✅ Schema Appuntamento (Aggiornato)
- **File**: `utils/mongo/schemi/Appuntamento.ts`
- **Modifiche**:
  - Aggiunto campo `specialista` (ObjectId → specialisti)
  - Mantenuto campo `barber` per retrocompatibilità
  - Aggiornato enum `cancelledBy` con 'specialista'

### 2. API Backend - Nuove Route

#### ✅ API Specialisti

**GET /api/specialisti**
```typescript
// Lista specialisti con filtro opzionale
Query params:
  - servizioId: filtra per servizio specifico
  - attivi: true/false (default: true)

Response: {
  successo: true,
  dati: [
    {
      _id: "...",
      nome: "Maria",
      cognome: "Rossi",
      biografia: "...",
      descrizioneCompetenze: "...",
      servizi: [...],  // Servizi associati
      orariSettimanali: {...},
      giorniChiusura: [...]
    }
  ]
}
```

**GET /api/specialisti/[id]**
```typescript
// Dettagli completi specialista
Response: {
  successo: true,
  dati: {
    _id: "...",
    nome: "...",
    cognome: "...",
    servizi: [...],  // Popolati con dettagli completi
    orariSettimanali: {...},
    giorniChiusura: [...]
  }
}
```

**PUT /api/specialisti/[id]**
```typescript
// Aggiorna specialista
Body: {
  biografia?: string,
  descrizioneCompetenze?: string,
  telefono?: string,
  orariSettimanali?: object,
  giorniChiusura?: array,
  impostazioni?: object,
  attivo?: boolean
}
```

**DELETE /api/specialisti/[id]**
```typescript
// Elimina specialista e tutte le associazioni
```

**GET /api/specialisti/[id]/disponibilita**
```typescript
// Calcola slot orari disponibili
Query params:
  - data: YYYY-MM-DD
  - durata: minuti

Response: {
  successo: true,
  dati: {
    slot: [
      { ora: "09:00", disponibile: true },
      { ora: "09:15", disponibile: false },
      ...
    ]
  }
}
```

**GET /api/specialisti/[id]/servizi**
```typescript
// Lista servizi dello specialista
Response: {
  successo: true,
  dati: [
    {
      _id: "...",
      nome: "Manicure",
      durata: 60,
      prezzo: 35,
      associazioneId: "...",
      attivo: true,
      note: "..."
    }
  ]
}
```

**POST /api/specialisti/[id]/servizi**
```typescript
// Associa servizio allo specialista
Body: {
  servizioId: string,
  note?: string
}
```

**DELETE /api/specialisti/[id]/servizi?servizioId=xxx**
```typescript
// Rimuove associazione
```

#### ✅ API Servizi (Nuova Route)

**GET /api/servizi/[id]/specialisti**
```typescript
// Lista specialisti che possono fare il servizio
Response: {
  successo: true,
  dati: [
    {
      _id: "...",
      nome: "Maria",
      cognome: "Rossi",
      biografia: "...",
      orariSettimanali: {...},
      giorniChiusura: [...]
    }
  ]
}
```

#### ✅ API Appuntamenti (Aggiornata)

**POST /api/appuntamenti**
```typescript
// Supporta sia barberId (vecchio) che specialistaId (nuovo)
Body: {
  specialistaId?: string,  // NUOVO
  barberId?: string,       // Retrocompatibilità
  servizioId: string,
  data: string,
  oraInizio: string,
  note?: string,
  clienteNome: string,
  clienteCognome: string,
  clienteTelefono: string
}

// Validazioni aggiunte:
// - Verifica associazione specialista-servizio
// - Controlla sovrapposizioni per specialista specifico
```

### 3. Script di Migrazione

#### ✅ Script Migrazione Dati
- **File**: `scripts/migra-barber-a-specialisti.js`
- **Funzionalità**:
  1. Copia barber → specialisti
  2. Crea associazioni specialista-servizio (tutti con tutti)
  3. Aggiorna appuntamenti esistenti
  4. Verifica stato prima e dopo
  5. Conferma utente interattiva

**Esecuzione**:
```bash
node scripts/migra-barber-a-specialisti.js
```

### 4. Documentazione

#### ✅ Guida Migrazione Completa
- **File**: `MIGRAZIONE_BEAUTY_SALON.md`
- **Contenuto**:
  - Panoramica modifiche
  - Dettagli schemi database
  - Documentazione API
  - Piano di migrazione in 5 fasi
  - Script migrazione dati
  - Checklist finale
  - Note importanti

## 🔄 Nuovo Flusso di Prenotazione

### Flusso Vecchio (Barbershop)
```
1. Scegli Barber
2. Scegli Servizio
3. Scegli Data
4. Scegli Ora
5. Conferma
```

### Flusso Nuovo (Beauty Salon)
```
1. Scegli SERVIZIO ← INVERTITO
2. Scegli SPECIALISTA (filtrato per servizio) ← INVERTITO
3. Scegli Data
4. Scegli Ora (basata su specialista+servizio)
5. Conferma
```

### Vantaggi del Nuovo Flusso
✅ L'utente parte dal servizio desiderato
✅ Vede solo specialisti qualificati per quel servizio
✅ Evita errori di prenotazione (combinazioni invalide)
✅ Esperienza più intuitiva per beauty salon
✅ Disponibilità reale per specialista+servizio specifici

## 📋 Prossimi Passi

### 1. Eseguire Migrazione Dati
```bash
# 1. Backup database
mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)

# 2. Esegui script migrazione
node scripts/migra-barber-a-specialisti.js

# 3. Verifica dati
# - Controlla collection specialisti
# - Controlla collection specialisti_servizi
# - Controlla appuntamenti aggiornati
```

### 2. Implementare Frontend Prenotazione
```typescript
// Crea nuovo componente
app/(utente)/prenotazione-beauty/page.tsx

// Implementa 5 step:
// 1. Selezione Servizio
// 2. Selezione Specialista (GET /api/servizi/[id]/specialisti)
// 3. Selezione Data
// 4. Selezione Ora (GET /api/specialisti/[id]/disponibilita)
// 5. Conferma (POST /api/appuntamenti con specialistaId)
```

### 3. Implementare CMS Gestione Associazioni
```typescript
// Pagina specialisti
app/(cms)/cms/specialisti/page.tsx

// Componente gestione servizi
componenti/cms/SpecialistaServiziManager.tsx

// Funzionalità:
// - Lista specialisti con badge servizi
// - Modal per aggiungere/rimuovere servizi
// - Drag & drop per associazioni rapide
```

### 4. Aggiornare Pagine Esistenti

#### CMS Appuntamenti
- Mostrare "Specialista" invece di "Barber"
- Supportare filtro per specialista
- Aggiornare dettagli appuntamento

#### CMS Servizi
- Mostrare numero specialisti associati
- Link "Vedi specialisti" → lista specialisti per servizio
- Pulsante "Gestisci specialisti"

### 5. Testing

#### Test API
```bash
# Test lista specialisti
curl http://localhost:3000/api/specialisti

# Test specialisti per servizio
curl http://localhost:3000/api/servizi/[servizioId]/specialisti

# Test disponibilità
curl "http://localhost:3000/api/specialisti/[id]/disponibilita?data=2026-05-20&durata=60"

# Test creazione appuntamento
curl -X POST http://localhost:3000/api/appuntamenti \
  -H "Content-Type: application/json" \
  -d '{
    "specialistaId": "...",
    "servizioId": "...",
    "data": "2026-05-20",
    "oraInizio": "10:00",
    "clienteNome": "Test",
    "clienteCognome": "Cliente",
    "clienteTelefono": "+393331234567"
  }'
```

#### Test Frontend
- [ ] Flusso prenotazione completo
- [ ] Filtro specialisti per servizio
- [ ] Disponibilità corretta
- [ ] Validazione associazioni
- [ ] Gestione errori

#### Test CMS
- [ ] Creazione specialista
- [ ] Associazione servizi
- [ ] Rimozione associazioni
- [ ] Aggiornamento orari
- [ ] Gestione chiusure

## 🎯 Personalizzazione Associazioni

Dopo la migrazione, tutte le associazioni sono create automaticamente (tutti gli specialisti possono fare tutti i servizi). È necessario personalizzarle:

### Esempio: Salone Beauty con 3 Specialisti

**Maria Rossi** - Esperta Nails
```
Servizi:
✅ Manicure Base
✅ Manicure Gel
✅ Pedicure
✅ Nail Art
❌ Trattamento Laser
❌ Make-up Professionale
```

**Laura Bianchi** - Estetista Laser
```
Servizi:
✅ Epilazione Laser Viso
✅ Epilazione Laser Corpo
✅ Trattamento Fotoringiovanimento
❌ Manicure
❌ Pedicure
```

**Sofia Verdi** - Make-up Artist
```
Servizi:
✅ Make-up Giorno
✅ Make-up Sera
✅ Make-up Sposa
✅ Consulenza Colore
❌ Trattamento Laser
❌ Nail Art
```

### Come Personalizzare

1. **Via API**:
```bash
# Rimuovi associazione
DELETE /api/specialisti/[mariaId]/servizi?servizioId=[laserId]

# Aggiungi associazione
POST /api/specialisti/[lauraId]/servizi
Body: { "servizioId": "[laserId]" }
```

2. **Via CMS** (da implementare):
- Vai su "Specialisti"
- Click su "Gestisci Servizi"
- Seleziona/deseleziona servizi
- Salva modifiche

## 🔒 Retrocompatibilità

### API Barber (Mantenute)
Le vecchie API `/api/barber` continuano a funzionare:
- GET /api/barber → restituisce specialisti
- GET /api/barber/[id] → restituisce specialista
- GET /api/barber/[id]/disponibilita → funziona

### Frontend Vecchio
La pagina `/prenotazione` continua a funzionare con il vecchio flusso (barber → servizio).

### Database
- Campo `barber` in Appuntamento mantenuto
- Collection `barbers` può essere mantenuta per backup
- Nuovi appuntamenti usano `specialista`

## 📊 Monitoraggio

### Metriche da Tracciare
- Numero associazioni per specialista
- Servizi più richiesti
- Specialisti più prenotati
- Tasso conversione nuovo flusso
- Errori validazione associazioni

### Log Importanti
```javascript
// Quando un utente tenta prenotazione invalida
console.log('Associazione non trovata:', { specialistaId, servizioId });

// Quando viene creata un'associazione
console.log('Nuova associazione:', { specialista, servizio });

// Quando viene rimossa un'associazione
console.log('Associazione rimossa:', { specialista, servizio });
```

## 🆘 Troubleshooting

### Problema: "Lo specialista non può eseguire questo servizio"
**Causa**: Associazione mancante in `specialisti_servizi`
**Soluzione**: 
```bash
POST /api/specialisti/[id]/servizi
Body: { "servizioId": "..." }
```

### Problema: Nessuno specialista disponibile per servizio
**Causa**: Nessuna associazione attiva
**Soluzione**: Verifica che esistano associazioni con `attivo: true`

### Problema: Slot orari non disponibili
**Causa**: Orari specialista non configurati
**Soluzione**: Aggiorna `orariSettimanali` dello specialista

### Problema: Migrazione fallita
**Causa**: Dati inconsistenti o connessione database
**Soluzione**: 
1. Verifica MONGODB_URI
2. Controlla log errori
3. Ripristina backup
4. Riprova migrazione

## 📞 Supporto

Per domande o problemi:
1. Consulta `MIGRAZIONE_BEAUTY_SALON.md`
2. Verifica log applicazione
3. Controlla stato database
4. Apri issue su GitHub

## ✨ Conclusione

La trasformazione da barbershop a beauty salon è stata implementata con successo! Il sistema ora supporta:

✅ Relazioni many-to-many tra specialisti e servizi
✅ Flusso di prenotazione intelligente (servizio → specialista)
✅ Validazione automatica delle associazioni
✅ API complete per gestione specialisti
✅ Script di migrazione dati automatico
✅ Retrocompatibilità con sistema esistente
✅ Documentazione completa

Il prossimo passo è eseguire la migrazione dati e implementare il frontend con il nuovo flusso!
