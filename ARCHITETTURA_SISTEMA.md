# Architettura Sistema Beauty Salon

## 📐 Diagramma Generale

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Prenotazione    │         │      CMS         │             │
│  │   Pubblica       │         │   (Autenticato)  │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                             │                        │
│           │  1. Scegli Servizio        │  - Gestione           │
│           │  2. Scegli Specialista     │    Specialisti        │
│           │  3. Scegli Data            │  - Gestione           │
│           │  4. Scegli Ora             │    Associazioni       │
│           │  5. Conferma               │  - Gestione           │
│           │                             │    Appuntamenti       │
└───────────┼─────────────────────────────┼───────────────────────┘
            │                             │
            │                             │
┌───────────▼─────────────────────────────▼───────────────────────┐
│                    API ROUTES (Next.js)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Specialisti   │  │    Servizi      │  │  Appuntamenti   │ │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤ │
│  │ GET /api/       │  │ GET /api/       │  │ GET /api/       │ │
│  │   specialisti   │  │   servizi       │  │   appuntamenti  │ │
│  │                 │  │                 │  │                 │ │
│  │ GET /:id        │  │ GET /:id        │  │ POST /api/      │ │
│  │                 │  │                 │  │   appuntamenti  │ │
│  │ POST /          │  │ GET /:id/       │  │                 │ │
│  │                 │  │   specialisti   │  │ PUT /:id        │ │
│  │ PUT /:id        │  │                 │  │                 │ │
│  │                 │  │ POST /          │  │ DELETE /:id     │ │
│  │ DELETE /:id     │  │                 │  │                 │ │
│  │                 │  │ PUT /:id        │  └─────────────────┘ │
│  │ GET /:id/       │  │                 │                       │
│  │   disponibilita │  │ DELETE /:id     │                       │
│  │                 │  │                 │                       │
│  │ GET /:id/       │  └─────────────────┘                       │
│  │   servizi       │                                            │
│  │                 │                                            │
│  │ POST /:id/      │                                            │
│  │   servizi       │                                            │
│  │                 │                                            │
│  │ DELETE /:id/    │                                            │
│  │   servizi       │                                            │
│  └─────────────────┘                                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware & Utilities                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  - verificaToken()      - Autenticazione JWT            │   │
│  │  - richiedeRuolo()      - Autorizzazione                │   │
│  │  - calcolaOraFine()     - Calcoli temporali             │   │
│  │  - normalizzaTelefono() - Validazione dati              │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      DATABASE (MongoDB)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐   ┌──────────────────┐   ┌─────────────┐      │
│  │    users    │   │   specialisti    │   │  services   │      │
│  ├─────────────┤   ├──────────────────┤   ├─────────────┤      │
│  │ _id         │◄──┤ utente (ref)     │   │ _id         │      │
│  │ nome        │   │ biografia        │   │ nome        │      │
│  │ cognome     │   │ descrizione      │   │ descrizione │      │
│  │ email       │   │   Competenze     │   │ durata      │      │
│  │ password    │   │ telefono         │   │ prezzo      │      │
│  │ telefono    │   │ orariSettimanali │   │ categoria   │      │
│  │ ruolo       │   │ giorniChiusura   │   │ attivo      │      │
│  │ attivo      │   │ impostazioni     │   │ immagine    │      │
│  └─────────────┘   │ attivo           │   └─────────────┘      │
│                     └──────────────────┘                         │
│                              │                    │               │
│                              │                    │               │
│                              ▼                    ▼               │
│                     ┌────────────────────────────────┐           │
│                     │  specialisti_servizi (PIVOT)   │           │
│                     ├────────────────────────────────┤           │
│                     │ _id                            │           │
│                     │ specialista (ref specialisti)  │           │
│                     │ servizio (ref services)        │           │
│                     │ attivo                         │           │
│                     │ note                           │           │
│                     └────────────────────────────────┘           │
│                              │                    │               │
│                              │                    │               │
│                              └────────┬───────────┘               │
│                                       │                           │
│                                       ▼                           │
│                              ┌─────────────────┐                 │
│                              │  appointments   │                 │
│                              ├─────────────────┤                 │
│                              │ _id             │                 │
│                              │ utente (embed)  │                 │
│                              │ specialista     │                 │
│                              │   (ref)         │                 │
│                              │ barber (ref)    │ ← Retrocompat.  │
│                              │ servizio (ref)  │                 │
│                              │ data            │                 │
│                              │ oraInizio       │                 │
│                              │ oraFine         │                 │
│                              │ stato           │                 │
│                              │ note            │                 │
│                              │ reminderSent    │                 │
│                              └─────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Flusso Dati Prenotazione

```
┌──────────┐
│ CLIENTE  │
└────┬─────┘
     │
     │ 1. Visita /prenotazione-beauty
     ▼
┌─────────────────────────────────────────┐
│  STEP 1: Selezione Servizio             │
├─────────────────────────────────────────┤
│  GET /api/servizi                       │
│  → Lista tutti i servizi attivi         │
│  → Cliente seleziona: "Manicure Gel"    │
└────┬────────────────────────────────────┘
     │
     │ servizioId = "abc123"
     ▼
┌─────────────────────────────────────────┐
│  STEP 2: Selezione Specialista          │
├─────────────────────────────────────────┤
│  GET /api/servizi/abc123/specialisti    │
│  → Query specialisti_servizi            │
│  → Filtra solo attivi                   │
│  → Popola dati specialisti              │
│  → Cliente seleziona: "Maria Rossi"     │
└────┬────────────────────────────────────┘
     │
     │ specialistaId = "def456"
     ▼
┌─────────────────────────────────────────┐
│  STEP 3: Selezione Data                 │
├─────────────────────────────────────────┤
│  GET /api/specialisti/def456            │
│  → Carica giorniChiusura                │
│  → Mostra calendario                    │
│  → Disabilita date non disponibili      │
│  → Cliente seleziona: "2026-05-20"      │
└────┬────────────────────────────────────┘
     │
     │ data = "2026-05-20"
     ▼
┌─────────────────────────────────────────┐
│  STEP 4: Selezione Ora                  │
├─────────────────────────────────────────┤
│  GET /api/specialisti/def456/           │
│      disponibilita?data=2026-05-20      │
│                   &durata=60            │
│  → Calcola slot orari                   │
│  → Verifica appuntamenti esistenti      │
│  → Verifica blocchi temporanei          │
│  → Considera pausa pranzo               │
│  → Cliente seleziona: "10:00"           │
└────┬────────────────────────────────────┘
     │
     │ oraInizio = "10:00"
     ▼
┌─────────────────────────────────────────┐
│  STEP 5: Conferma                       │
├─────────────────────────────────────────┤
│  Cliente inserisce:                     │
│  - Nome: "Mario"                        │
│  - Cognome: "Rossi"                     │
│  - Telefono: "333-1234567"              │
│  - Note: "Prima volta"                  │
│                                         │
│  POST /api/appuntamenti                 │
│  Body: {                                │
│    specialistaId: "def456",             │
│    servizioId: "abc123",                │
│    data: "2026-05-20",                  │
│    oraInizio: "10:00",                  │
│    clienteNome: "Mario",                │
│    clienteCognome: "Rossi",             │
│    clienteTelefono: "+393331234567",    │
│    note: "Prima volta"                  │
│  }                                      │
│                                         │
│  Validazioni:                           │
│  1. ✓ Verifica associazione             │
│      specialista-servizio               │
│  2. ✓ Calcola oraFine automaticamente  │
│  3. ✓ Verifica data non passata         │
│  4. ✓ Verifica sovrapposizioni          │
│  5. ✓ Crea/trova cliente                │
│  6. ✓ Crea appuntamento                 │
│                                         │
│  → Redirect /prenotazione/successo      │
└─────────────────────────────────────────┘
```

## 🔐 Flusso Autenticazione

```
┌──────────┐
│  UTENTE  │
└────┬─────┘
     │
     │ POST /api/autenticazione/login
     │ Body: { email, password }
     ▼
┌─────────────────────────────────────┐
│  Verifica Credenziali               │
├─────────────────────────────────────┤
│  1. Trova utente per email          │
│  2. Compara password (bcrypt)       │
│  3. Verifica utente attivo          │
└────┬────────────────────────────────┘
     │
     │ ✓ Credenziali valide
     ▼
┌─────────────────────────────────────┐
│  Genera JWT Token                   │
├─────────────────────────────────────┤
│  Payload: {                         │
│    id: utente._id,                  │
│    email: utente.email,             │
│    ruolo: utente.ruolo              │
│  }                                  │
│  Secret: JWT_SECRET                 │
│  Expiry: 7 giorni                   │
└────┬────────────────────────────────┘
     │
     │ token = "eyJhbGc..."
     ▼
┌─────────────────────────────────────┐
│  Response                           │
├─────────────────────────────────────┤
│  {                                  │
│    successo: true,                  │
│    token: "eyJhbGc...",             │
│    utente: {                        │
│      id, nome, cognome, email,      │
│      ruolo                          │
│    }                                │
│  }                                  │
└────┬────────────────────────────────┘
     │
     │ Client salva token
     ▼
┌─────────────────────────────────────┐
│  Richieste Successive               │
├─────────────────────────────────────┤
│  Header:                            │
│  Authorization: Bearer eyJhbGc...   │
│                                     │
│  Middleware verificaToken():        │
│  1. Estrae token da header          │
│  2. Verifica firma JWT              │
│  3. Controlla scadenza              │
│  4. Decodifica payload              │
│  5. Passa utente a route handler    │
└─────────────────────────────────────┘
```

## 🗄️ Schema Relazioni Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELAZIONI MANY-TO-MANY                        │
└─────────────────────────────────────────────────────────────────┘

    SPECIALISTI                                    SERVIZI
    
┌─────────────────┐                          ┌─────────────────┐
│ Maria Rossi     │                          │ Manicure Base   │
│ ID: spec001     │                          │ ID: serv001     │
└────────┬────────┘                          └────────┬────────┘
         │                                            │
         │                                            │
         │         ┌──────────────────────┐          │
         └────────►│ specialisti_servizi  │◄─────────┘
         │         ├──────────────────────┤          │
         │         │ spec001 → serv001    │          │
         │         │ spec001 → serv002    │          │
         │         │ spec001 → serv003    │          │
         │         └──────────────────────┘          │
         │                                            │
┌────────┴────────┐                          ┌────────┴────────┐
│ Laura Bianchi   │                          │ Manicure Gel    │
│ ID: spec002     │                          │ ID: serv002     │
└────────┬────────┘                          └────────┬────────┘
         │                                            │
         │         ┌──────────────────────┐          │
         └────────►│ specialisti_servizi  │◄─────────┘
         │         ├──────────────────────┤          │
         │         │ spec002 → serv004    │          │
         │         │ spec002 → serv005    │          │
         │         └──────────────────────┘          │
         │                                            │
┌────────┴────────┐                          ┌────────┴────────┐
│ Sofia Verdi     │                          │ Pedicure        │
│ ID: spec003     │                          │ ID: serv003     │
└─────────────────┘                          └─────────────────┘

ESEMPIO QUERY:

1. "Chi può fare Manicure Gel?"
   → Query specialisti_servizi WHERE servizio = serv002
   → Risultato: Maria Rossi (spec001)

2. "Quali servizi fa Laura Bianchi?"
   → Query specialisti_servizi WHERE specialista = spec002
   → Risultato: Epilazione Laser (serv004), Fotoringiovanimento (serv005)

3. "Crea appuntamento: Laura + Manicure Gel"
   → Query specialisti_servizi WHERE specialista = spec002 AND servizio = serv002
   → Risultato: NESSUNA ASSOCIAZIONE → ERRORE
```

## 📊 Calcolo Disponibilità

```
┌─────────────────────────────────────────────────────────────────┐
│  ALGORITMO CALCOLO SLOT DISPONIBILI                              │
└─────────────────────────────────────────────────────────────────┘

INPUT:
  - specialistaId: "spec001"
  - data: "2026-05-20" (Martedì)
  - durata: 60 minuti

STEP 1: Carica Orari Specialista
  orariSettimanali.martedi = {
    aperto: true,
    oraInizio: "09:00",
    oraFine: "18:00",
    pausa: { oraInizio: "13:00", oraFine: "14:00" }
  }

STEP 2: Genera Slot Base (ogni 15 min)
  09:00, 09:15, 09:30, 09:45,
  10:00, 10:15, 10:30, 10:45,
  11:00, 11:15, 11:30, 11:45,
  12:00, 12:15, 12:30, 12:45,
  [PAUSA 13:00-14:00]
  14:00, 14:15, 14:30, 14:45,
  15:00, 15:15, 15:30, 15:45,
  16:00, 16:15, 16:30, 16:45,
  17:00, 17:15, 17:30, 17:45

STEP 3: Filtra Slot Insufficienti
  Servizio durata 60 min → rimuovi slot dopo 17:00
  (non c'è tempo per completare prima delle 18:00)
  
  Slot validi: 09:00 - 17:00

STEP 4: Rimuovi Slot in Pausa
  Rimuovi: 13:00, 13:15, 13:30, 13:45
  
  Slot validi: 09:00-12:45, 14:00-17:00

STEP 5: Carica Appuntamenti Esistenti
  appointments WHERE specialista = spec001
                AND data = 2026-05-20
                AND stato IN ['confermato', 'in_attesa']
  
  Risultato:
  - 10:00-11:00 (Manicure)
  - 15:00-16:30 (Nail Art)

STEP 6: Rimuovi Slot Occupati
  10:00 → OCCUPATO (appuntamento 10:00-11:00)
  10:15 → OCCUPATO (dentro appuntamento)
  10:30 → OCCUPATO (dentro appuntamento)
  10:45 → OCCUPATO (dentro appuntamento)
  
  15:00 → OCCUPATO (appuntamento 15:00-16:30)
  15:15 → OCCUPATO (dentro appuntamento)
  15:30 → OCCUPATO (dentro appuntamento)
  15:45 → OCCUPATO (dentro appuntamento)
  16:00 → OCCUPATO (dentro appuntamento)
  16:15 → OCCUPATO (dentro appuntamento)

STEP 7: Verifica Slot Attraversano Pausa
  12:30 → INVALIDO (12:30 + 60min = 13:30, attraversa pausa)
  12:45 → INVALIDO (12:45 + 60min = 13:45, attraversa pausa)

OUTPUT: Slot Disponibili
  ✓ 09:00, 09:15, 09:30, 09:45,
  ✓ 11:00, 11:15, 11:30, 11:45,
  ✓ 12:00, 12:15,
  ✓ 14:00, 14:15, 14:30, 14:45,
  ✓ 16:30, 16:45,
  ✓ 17:00

TOTALE: 17 slot disponibili
```

## 🔄 Ciclo di Vita Appuntamento

```
┌─────────────────────────────────────────────────────────────────┐
│  STATI APPUNTAMENTO                                              │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  in_attesa   │  ← Creato da cliente
    └──────┬───────┘
           │
           │ Barber conferma
           ▼
    ┌──────────────┐
    │  confermato  │  ← Appuntamento confermato
    └──────┬───────┘
           │
           │ 24h prima: invia reminder WhatsApp
           │
           │ Giorno appuntamento
           ▼
    ┌──────────────┐
    │  completato  │  ← Servizio eseguito
    └──────────────┘

           │
           │ In qualsiasi momento
           ▼
    ┌──────────────┐
    │  cancellato  │  ← Cancellato da cliente o barber
    └──────────────┘
    
TRANSIZIONI VALIDE:
  in_attesa → confermato
  in_attesa → cancellato
  confermato → completato
  confermato → cancellato

TRANSIZIONI INVALIDE:
  completato → confermato ❌
  cancellato → confermato ❌
  completato → cancellato ❌
```

## 🏗️ Struttura File Progetto

```
beauty-salon/
├── app/
│   ├── (utente)/
│   │   ├── prenotazione/          # Vecchio flusso (retrocompat.)
│   │   ├── prenotazione-beauty/   # Nuovo flusso ✨
│   │   ├── servizi/
│   │   └── contatti/
│   │
│   ├── (cms)/
│   │   └── cms/
│   │       ├── appuntamenti/
│   │       ├── specialisti/       # Nuovo ✨
│   │       ├── servizi/
│   │       ├── orari/
│   │       ├── disponibilita/
│   │       └── frontend/
│   │
│   ├── api/
│   │   ├── specialisti/           # Nuovo ✨
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── disponibilita/
│   │   │       └── servizi/
│   │   │
│   │   ├── servizi/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── specialisti/   # Nuovo ✨
│   │   │
│   │   ├── appuntamenti/
│   │   │   ├── route.ts           # Aggiornato ✨
│   │   │   └── [id]/
│   │   │
│   │   └── autenticazione/
│   │
│   ├── login/
│   ├── registrazione/
│   └── page.tsx
│
├── componenti/
│   ├── cms/
│   │   ├── Sidebar.tsx
│   │   ├── FiltriAppuntamenti.tsx
│   │   └── SpecialistaServiziManager.tsx  # Nuovo ✨
│   │
│   ├── comuni/
│   │   ├── Caricamento.tsx
│   │   ├── Messaggio.tsx
│   │   └── Modal.tsx
│   │
│   └── interfaccia/
│       ├── Bottone.tsx
│       ├── Card.tsx
│       └── Input.tsx
│
├── utils/
│   ├── mongo/
│   │   ├── connessione.ts
│   │   └── schemi/
│   │       ├── Utente.ts
│   │       ├── Barber.ts              # Vecchio
│   │       ├── Specialista.ts         # Nuovo ✨
│   │       ├── SpecialistaServizio.ts # Nuovo ✨
│   │       ├── Servizio.ts
│   │       ├── Appuntamento.ts        # Aggiornato ✨
│   │       └── PrenotazioneTemporanea.ts
│   │
│   ├── middleware/
│   │   └── autenticazione.ts
│   │
│   ├── helpers.ts
│   └── webservice.ts
│
├── scripts/
│   ├── migra-barber-a-specialisti.js  # Nuovo ✨
│   ├── setup-completo.js
│   └── test-whatsapp.js
│
├── docs/
│   ├── MIGRAZIONE_BEAUTY_SALON.md     # Nuovo ✨
│   ├── RIEPILOGO_TRASFORMAZIONE_BEAUTY.md  # Nuovo ✨
│   ├── README_BEAUTY_SALON.md         # Nuovo ✨
│   ├── ESEMPI_API_BEAUTY.md           # Nuovo ✨
│   ├── CHECKLIST_IMPLEMENTAZIONE.md   # Nuovo ✨
│   └── ARCHITETTURA_SISTEMA.md        # Nuovo ✨
│
├── .env
├── .env.example
├── package.json                        # Aggiornato ✨
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 Performance e Scalabilità

### Indici Database
```javascript
// Collection: specialisti_servizi
db.specialisti_servizi.createIndex({ specialista: 1, servizio: 1 }, { unique: true })
db.specialisti_servizi.createIndex({ specialista: 1 })
db.specialisti_servizi.createIndex({ servizio: 1 })

// Collection: appointments
db.appointments.createIndex({ specialista: 1, data: 1 })
db.appointments.createIndex({ data: 1, stato: 1 })
db.appointments.createIndex({ 'utente.telefono': 1 })

// Collection: specialisti
db.specialisti.createIndex({ utente: 1 }, { unique: true })
db.specialisti.createIndex({ attivo: 1 })
```

### Caching Strategy
```
┌─────────────────────────────────────────┐
│  CACHE LAYERS                            │
├─────────────────────────────────────────┤
│                                          │
│  1. Browser Cache                       │
│     - Immagini servizi (1 giorno)       │
│     - Logo (1 settimana)                │
│     - CSS/JS (1 settimana)              │
│                                          │
│  2. API Response Cache (Redis)          │
│     - Lista servizi (5 minuti)          │
│     - Lista specialisti (5 minuti)      │
│     - Specialisti per servizio (5 min)  │
│                                          │
│  3. Database Query Cache                │
│     - Mongoose cache (1 minuto)         │
│                                          │
│  4. CDN Cache                           │
│     - Static assets (1 mese)            │
│     - Immagini ottimizzate (1 mese)     │
└─────────────────────────────────────────┘
```

### Load Balancing
```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
      │ Server 1  │  │ Server 2  │  │ Server 3  │
      │ Next.js   │  │ Next.js   │  │ Next.js   │
      └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼───────┐
                    │   MongoDB    │
                    │   Replica    │
                    │     Set      │
                    └──────────────┘
```

---

**Documento creato**: 14 Maggio 2026
**Versione**: 2.0.0
**Autore**: Sistema Beauty Salon Team
