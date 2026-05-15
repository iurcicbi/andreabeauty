# Beauty Salon - Sistema di Prenotazione Intelligente

Sistema di gestione prenotazioni per saloni beauty con specializzazioni specifiche e relazioni many-to-many tra specialisti e servizi.

## 🌟 Caratteristiche Principali

### Sistema Intelligente di Prenotazione
- **Flusso guidato**: Servizio → Specialista → Data → Ora
- **Filtro automatico**: Mostra solo specialisti qualificati per il servizio scelto
- **Validazione real-time**: Previene prenotazioni invalide
- **Disponibilità dinamica**: Basata su specialista e servizio specifici

### Gestione Specialisti
- Profili completi con competenze specifiche
- Orari di lavoro personalizzati per giorno
- Giorni di chiusura (ferie, festività)
- Associazioni multiple con servizi

### Relazioni Many-to-Many
- Ogni specialista può offrire più servizi
- Ogni servizio può essere eseguito da più specialisti
- Gestione flessibile delle competenze
- Associazioni attivabili/disattivabili

### CMS Completo
- Dashboard con statistiche
- Gestione appuntamenti
- Gestione specialisti e servizi
- Configurazione associazioni
- Impostazioni frontend dinamiche

## 🏗️ Architettura

### Stack Tecnologico
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB con Mongoose ODM
- **Autenticazione**: JWT
- **Notifiche**: Twilio WhatsApp

### Struttura Database

```
┌─────────────┐
│   users     │ (Utenti e credenziali)
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼──────┐    ┌──────▼──────────┐
│ specialisti │    │  appointments   │
└──────┬──────┘    └──────┬──────────┘
       │                  │
       │           ┌──────▼──────┐
       │           │  services   │
       │           └──────┬──────┘
       │                  │
       │    ┌─────────────┘
       │    │
┌──────▼────▼──────────────┐
│ specialisti_servizi      │ (Many-to-Many)
└──────────────────────────┘
```

### Collections MongoDB

#### `users`
```javascript
{
  _id: ObjectId,
  nome: String,
  cognome: String,
  email: String (unique),
  password: String (hashed),
  telefono: String,
  ruolo: 'utente' | 'barber',
  attivo: Boolean
}
```

#### `specialisti`
```javascript
{
  _id: ObjectId,
  utente: ObjectId → users,
  biografia: String,
  descrizioneCompetenze: String,
  telefono: String,
  orariSettimanali: {
    lunedi: { aperto, oraInizio, oraFine, pausa },
    martedi: { ... },
    // ... altri giorni
  },
  giorniChiusura: [{
    data: Date,
    motivo: String,
    tuttoIlGiorno: Boolean
  }],
  impostazioni: {
    anticipoMinimo: Number,
    durataSlot: Number,
    maxAppuntamentiGiorno: Number
  },
  attivo: Boolean
}
```

#### `services`
```javascript
{
  _id: ObjectId,
  nome: String,
  descrizione: String,
  durata: Number (minuti),
  prezzo: Number (euro),
  categoria: String,
  attivo: Boolean,
  immagine: String
}
```

#### `specialisti_servizi` (Pivot Table)
```javascript
{
  _id: ObjectId,
  specialista: ObjectId → specialisti,
  servizio: ObjectId → services,
  attivo: Boolean,
  note: String
}
```

#### `appointments`
```javascript
{
  _id: ObjectId,
  utente: {
    nome: String,
    cognome: String,
    telefono: String,
    email: String
  },
  specialista: ObjectId → specialisti,
  barber: ObjectId → users (retrocompatibilità),
  servizio: ObjectId → services,
  data: Date,
  oraInizio: String,
  oraFine: String,
  stato: 'in_attesa' | 'confermato' | 'completato' | 'cancellato',
  note: String,
  reminderSent: Boolean,
  reminderSentAt: Date
}
```

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- MongoDB 5+
- Account Twilio (opzionale, per WhatsApp)

### Installazione

```bash
# 1. Clona repository
git clone <repository-url>
cd beauty-salon

# 2. Installa dipendenze
npm install

# 3. Configura variabili ambiente
cp .env.example .env
# Modifica .env con le tue credenziali

# 4. Esegui migrazione dati (se hai dati esistenti)
node scripts/migra-barber-a-specialisti.js

# 5. Avvia server di sviluppo
npm run dev
```

### Variabili Ambiente (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/beauty-salon

# JWT
JWT_SECRET=your-secret-key-here

# Twilio (opzionale)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 API Endpoints

### Specialisti

```http
GET    /api/specialisti
GET    /api/specialisti/:id
POST   /api/specialisti
PUT    /api/specialisti/:id
DELETE /api/specialisti/:id

GET    /api/specialisti/:id/disponibilita?data=YYYY-MM-DD&durata=60
GET    /api/specialisti/:id/servizi
POST   /api/specialisti/:id/servizi
DELETE /api/specialisti/:id/servizi?servizioId=xxx
```

### Servizi

```http
GET    /api/servizi
GET    /api/servizi/:id
POST   /api/servizi
PUT    /api/servizi/:id
DELETE /api/servizi/:id

GET    /api/servizi/:id/specialisti
```

### Appuntamenti

```http
GET    /api/appuntamenti?stato=confermato&data=YYYY-MM-DD
POST   /api/appuntamenti
GET    /api/appuntamenti/:id
PUT    /api/appuntamenti/:id
DELETE /api/appuntamenti/:id
```

### Autenticazione

```http
POST   /api/autenticazione/login
POST   /api/autenticazione/registrazione
```

## 🎨 Frontend Routes

### Pubbliche
- `/` - Homepage
- `/servizi` - Lista servizi
- `/contatti` - Contatti
- `/prenotazione` - Flusso prenotazione (vecchio)
- `/prenotazione-beauty` - Flusso prenotazione nuovo
- `/login` - Login
- `/registrazione` - Registrazione

### CMS (Autenticazione richiesta)
- `/cms` - Dashboard
- `/cms/appuntamenti` - Gestione appuntamenti
- `/cms/specialisti` - Gestione specialisti
- `/cms/servizi` - Gestione servizi
- `/cms/orari` - Configurazione orari
- `/cms/disponibilita` - Giorni chiusura
- `/cms/frontend` - Impostazioni frontend
- `/cms/profilo` - Profilo utente

## 🔄 Flusso di Prenotazione

### Step 1: Selezione Servizio
```typescript
// GET /api/servizi
const servizi = await fetch('/api/servizi');
// Utente seleziona servizio desiderato
```

### Step 2: Selezione Specialista
```typescript
// GET /api/servizi/:servizioId/specialisti
const specialisti = await fetch(`/api/servizi/${servizioId}/specialisti`);
// Mostra solo specialisti che possono fare quel servizio
```

### Step 3: Selezione Data
```typescript
// GET /api/specialisti/:id
const specialista = await fetch(`/api/specialisti/${specialistaId}`);
// Mostra calendario con giorniChiusura disabilitati
```

### Step 4: Selezione Ora
```typescript
// GET /api/specialisti/:id/disponibilita?data=xxx&durata=xxx
const disponibilita = await fetch(
  `/api/specialisti/${specialistaId}/disponibilita?data=${data}&durata=${servizio.durata}`
);
// Mostra slot orari disponibili
```

### Step 5: Conferma
```typescript
// POST /api/appuntamenti
const appuntamento = await fetch('/api/appuntamenti', {
  method: 'POST',
  body: JSON.stringify({
    specialistaId,
    servizioId,
    data,
    oraInizio,
    clienteNome,
    clienteCognome,
    clienteTelefono
  })
});
```

## 🛠️ Gestione Associazioni

### Associare Servizio a Specialista

```typescript
// POST /api/specialisti/:id/servizi
await fetch(`/api/specialisti/${specialistaId}/servizi`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    servizioId: '...',
    note: 'Disponibile solo il martedì'
  })
});
```

### Rimuovere Associazione

```typescript
// DELETE /api/specialisti/:id/servizi?servizioId=xxx
await fetch(
  `/api/specialisti/${specialistaId}/servizi?servizioId=${servizioId}`,
  { method: 'DELETE' }
);
```

### Verificare Associazioni

```typescript
// GET /api/specialisti/:id/servizi
const servizi = await fetch(`/api/specialisti/${specialistaId}/servizi`);

// GET /api/servizi/:id/specialisti
const specialisti = await fetch(`/api/servizi/${servizioId}/specialisti`);
```

## 📊 Esempi d'Uso

### Esempio 1: Salone con 3 Specialisti

**Maria Rossi** - Nail Artist
- Manicure Base (30 min, €25)
- Manicure Gel (60 min, €35)
- Pedicure (45 min, €30)
- Nail Art (90 min, €50)

**Laura Bianchi** - Estetista Laser
- Epilazione Laser Viso (30 min, €80)
- Epilazione Laser Corpo (60 min, €150)
- Fotoringiovanimento (45 min, €120)

**Sofia Verdi** - Make-up Artist
- Make-up Giorno (45 min, €40)
- Make-up Sera (60 min, €60)
- Make-up Sposa (120 min, €150)

### Esempio 2: Prenotazione Cliente

1. Cliente cerca "Manicure Gel"
2. Sistema mostra: Maria Rossi (unica specialista per quel servizio)
3. Cliente seleziona Maria
4. Sistema mostra calendario con disponibilità di Maria
5. Cliente sceglie Martedì 20 Maggio
6. Sistema mostra slot: 09:00, 09:30, 10:00, ... (basati su orari Maria)
7. Cliente seleziona 10:00
8. Cliente inserisce dati e conferma
9. Appuntamento creato con validazione automatica

## 🔐 Sicurezza

### Autenticazione
- JWT con scadenza 7 giorni
- Password hashate con bcrypt (10 rounds)
- Token in header Authorization: Bearer

### Validazioni
- Verifica associazione specialista-servizio
- Controllo sovrapposizioni appuntamenti
- Validazione date (no passato)
- Sanitizzazione input utente

### Autorizzazioni
- Utenti: possono prenotare solo per sé
- Barber/Specialisti: accesso completo CMS
- Admin: gestione utenti e configurazioni

## 🧪 Testing

### Test API

```bash
# Test lista specialisti
curl http://localhost:3000/api/specialisti

# Test specialisti per servizio
curl http://localhost:3000/api/servizi/[id]/specialisti

# Test disponibilità
curl "http://localhost:3000/api/specialisti/[id]/disponibilita?data=2026-05-20&durata=60"

# Test creazione appuntamento
curl -X POST http://localhost:3000/api/appuntamenti \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "specialistaId": "...",
    "servizioId": "...",
    "data": "2026-05-20",
    "oraInizio": "10:00",
    "clienteNome": "Mario",
    "clienteCognome": "Rossi",
    "clienteTelefono": "+393331234567"
  }'
```

### Test Frontend

```bash
# Avvia server di sviluppo
npm run dev

# Testa flusso prenotazione
# 1. Vai su http://localhost:3000/prenotazione-beauty
# 2. Seleziona servizio
# 3. Seleziona specialista
# 4. Seleziona data
# 5. Seleziona ora
# 6. Conferma prenotazione
```

## 📈 Performance

### Ottimizzazioni Database
- Indici su campi frequenti (specialista, servizio, data)
- Compound index su (specialista, servizio) in pivot table
- Populate selettivo per ridurre payload

### Ottimizzazioni Frontend
- Lazy loading componenti
- Debounce su ricerche
- Cache query frequenti
- Immagini ottimizzate

## 🐛 Troubleshooting

### Problema: Nessuno specialista disponibile
**Soluzione**: Verifica associazioni in `specialisti_servizi`

### Problema: Slot orari vuoti
**Soluzione**: Controlla `orariSettimanali` dello specialista

### Problema: Errore "Associazione non trovata"
**Soluzione**: Crea associazione con POST `/api/specialisti/:id/servizi`

### Problema: Migrazione fallita
**Soluzione**: Verifica MONGODB_URI e ripristina backup

## 📝 Changelog

### v2.0.0 - Beauty Salon Transformation
- ✨ Aggiunto sistema many-to-many specialisti-servizi
- ✨ Nuovo flusso prenotazione (servizio → specialista)
- ✨ API complete per gestione specialisti
- ✨ Script migrazione automatica
- 🔄 Retrocompatibilità con sistema barber
- 📚 Documentazione completa

### v1.0.0 - Barbershop System
- ✨ Sistema prenotazioni base
- ✨ Gestione barber e servizi
- ✨ CMS completo
- ✨ Notifiche WhatsApp

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT.

## 📞 Supporto

- 📧 Email: support@beautysalon.com
- 📖 Documentazione: `/docs`
- 🐛 Issues: GitHub Issues
- 💬 Discord: [Link al server]

## 🙏 Ringraziamenti

- Next.js team per il framework
- MongoDB team per il database
- Twilio per le notifiche WhatsApp
- Community open source

---

**Fatto con ❤️ per i saloni beauty moderni**
