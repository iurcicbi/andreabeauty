# 💈 Barber Shop Portal

Portale web completo per la gestione di un barber shop con sistema di prenotazioni online e CMS per il barber.

## 📋 Indice

- [Tecnologie](#tecnologie)
- [Struttura del Progetto](#struttura-del-progetto)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Architettura](#architettura)
- [Funzionalità](#funzionalità)
- [API Endpoints](#api-endpoints)
- [Componenti](#componenti)
- [Database](#database)
- [Autenticazione](#autenticazione)

## 🛠 Tecnologie

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB con Mongoose
- **Autenticazione**: JWT (JSON Web Tokens)
- **HTTP Client**: Axios (centralizzato in webservice.ts)
- **Validazione**: Zod
- **Date Handling**: date-fns

## 📁 Struttura del Progetto

```
barbershop-portal/
├── app/                          # Directory Next.js App Router
│   ├── (utente)/                 # Route group per utenti
│   │   ├── servizi/              # Visualizzazione servizi
│   │   ├── prenotazione/         # Prenotazione appuntamenti
│   │   └── profilo/              # Profilo utente
│   ├── (cms)/                    # Route group per barber (CMS)
│   │   └── cms/
│   │       ├── cruscotto/        # Dashboard barber
│   │       ├── appuntamenti/     # Gestione appuntamenti
│   │       ├── orari/            # Gestione orari
│   │       └── profilo/          # Profilo barber
│   ├── api/                      # API Routes
│   │   ├── autenticazione/       # Login e registrazione
│   │   ├── appuntamenti/         # CRUD appuntamenti
│   │   ├── servizi/              # CRUD servizi
│   │   └── barber/               # Gestione barber
│   ├── layout.tsx                # Layout root
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Stili globali
├── componenti/                   # Componenti React riutilizzabili
│   ├── interfaccia/              # Componenti UI base
│   │   ├── Card.tsx
│   │   ├── Bottone.tsx
│   │   └── Input.tsx
│   └── comuni/                   # Componenti comuni
│       ├── Messaggio.tsx
│       └── Caricamento.tsx
├── utils/                        # Utilità e helpers
│   ├── mongo/                    # MongoDB
│   │   ├── connessione.ts        # Connessione database
│   │   └── schemi/               # Schemi Mongoose
│   │       ├── Utente.ts
│   │       ├── Appuntamento.ts
│   │       ├── Servizio.ts
│   │       └── Barber.ts
│   ├── middleware/
│   │   └── autenticazione.ts     # Middleware JWT
│   ├── webservice.ts             # Client HTTP centralizzato
│   └── helpers.ts                # Funzioni di utilità
├── pubblico/                     # File statici
├── .env.example                  # Esempio variabili ambiente
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🚀 Installazione

### Prerequisiti

- Node.js 18+ e npm/yarn
- MongoDB (locale o Atlas)
- Git

### Passi

1. **Clona il repository**
```bash
git clone <repository-url>
cd barbershop-portal
```

2. **Installa le dipendenze**
```bash
npm install
# oppure
yarn install
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env
```

Modifica il file `.env` con i tuoi valori:
```env
MONGODB_URI=mongodb://localhost:27017/barbershop
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL_API=http://localhost:3000/api
HOSTNAME=localhost
PORT=3000
```

4. **Avvia MongoDB** (se locale)
```bash
mongod
```

5. **Avvia il server di sviluppo**
```bash
npm run dev
# oppure
yarn dev
```

Il server personalizzato (server.js) verrà avviato automaticamente.

6. **Apri il browser**
```
http://localhost:3000
```

### Accesso CMS

Per accedere al CMS (area barber):
1. Vai su `http://localhost:3000/cms`
2. Verrai reindirizzato al login
3. Accedi con un account barber
4. Verrai reindirizzato alla dashboard CMS

## ⚙️ Configurazione

### MongoDB

Il progetto supporta sia MongoDB locale che MongoDB Atlas.

**Locale:**
```env
MONGODB_URI=mongodb://localhost:27017/barbershop
```

**Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barbershop
```

### JWT Secret

Genera una chiave segreta sicura per JWT:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🏗 Architettura

### Pattern Architetturali

1. **Singleton Pattern** - Connessione MongoDB
2. **Repository Pattern** - Schemi Mongoose
3. **Middleware Pattern** - Autenticazione JWT
4. **Centralized HTTP Client** - Webservice

### Flusso Dati

```
Client (React) 
    ↓
Webservice (axios)
    ↓
API Routes (Next.js)
    ↓
Middleware (autenticazione)
    ↓
Database (MongoDB)
```

## 🎯 Funzionalità

### Per gli Utenti

- ✅ Registrazione e login
- ✅ Visualizzazione servizi disponibili
- ✅ Prenotazione appuntamenti
- ✅ Gestione profilo personale
- ✅ Visualizzazione storico appuntamenti

### Per il Barber (CMS)

- ✅ Dashboard con statistiche
- ✅ Gestione appuntamenti (conferma, completa, cancella)
- ✅ Gestione servizi (crea, modifica, elimina)
- ✅ Gestione orari di lavoro
- ✅ Visualizzazione calendario
- ✅ Gestione giorni di chiusura

## 🔌 API Endpoints

### Autenticazione

```typescript
POST /api/autenticazione/registrazione
Body: { nome, cognome, email, password, telefono, ruolo? }
Response: { successo, dati: { utente, token } }

POST /api/autenticazione/login
Body: { email, password }
Response: { successo, dati: { utente, token } }
```

### Servizi

```typescript
GET /api/servizi
Response: { successo, dati: Servizio[] }

POST /api/servizi (solo barber)
Body: { nome, descrizione, durata, prezzo, categoria }
Response: { successo, dati: Servizio }

GET /api/servizi/[id]
Response: { successo, dati: Servizio }

PUT /api/servizi/[id] (solo barber)
Body: { ...campi da aggiornare }
Response: { successo, dati: Servizio }

DELETE /api/servizi/[id] (solo barber)
Response: { successo, messaggio }
```

### Appuntamenti

```typescript
GET /api/appuntamenti
Query: ?stato=confermato&data=2024-01-01
Response: { successo, dati: Appuntamento[] }

POST /api/appuntamenti
Body: { barberId, servizioId, data, oraInizio, note? }
Response: { successo, dati: Appuntamento }

PATCH /api/appuntamenti/[id]
Body: { stato }
Response: { successo, dati: Appuntamento }
```

## 🧩 Componenti

### Componenti UI Base

**Card** - Contenitore per contenuti
```tsx
<Card titolo="Titolo">
  <p>Contenuto</p>
</Card>
```

**Bottone** - Bottone riutilizzabile
```tsx
<Bottone 
  variante="primary" 
  dimensione="medium"
  onClick={handleClick}
>
  Clicca qui
</Bottone>
```

**Input** - Campo input con label
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  errore={erroreEmail}
  required
/>
```

**Messaggio** - Alert per feedback
```tsx
<Messaggio 
  tipo="successo" 
  messaggio="Operazione completata"
  onChiudi={() => setMessaggio('')}
/>
```

## 💾 Database

### Schemi MongoDB

#### Utente
```typescript
{
  nome: string
  cognome: string
  email: string (unique)
  password: string (hashed)
  telefono: string
  ruolo: 'utente' | 'barber'
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Servizio
```typescript
{
  nome: string
  descrizione: string
  durata: number (minuti)
  prezzo: number (euro)
  categoria: 'capelli' | 'barba' | 'trattamenti' | 'colorazione' | 'altro'
  attivo: boolean
  immagine?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Appuntamento
```typescript
{
  utente: ObjectId (ref: Utente)
  barber: ObjectId (ref: Utente)
  servizio: ObjectId (ref: Servizio)
  data: Date
  oraInizio: string (HH:mm)
  oraFine: string (HH:mm)
  stato: 'confermato' | 'in_attesa' | 'completato' | 'cancellato'
  note?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Barber
```typescript
{
  utente: ObjectId (ref: Utente, unique)
  biografia?: string
  specializzazioni: string[]
  orariSettimanali: {
    lunedi: { aperto, oraInizio, oraFine, pausa? }
    // ... altri giorni
  }
  giorniChiusura: [{ data, motivo }]
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Autenticazione

### Flusso JWT

1. **Login/Registrazione**
   - Utente invia credenziali
   - Server verifica e genera token JWT
   - Token contiene: id, email, ruolo

2. **Richieste Autenticate**
   - Client include token nell'header: `Authorization: Bearer TOKEN`
   - Middleware verifica token
   - Se valido, permette accesso alla risorsa

3. **Protezione Route**
```typescript
// In API route
import { verificaToken, richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: Request) {
  const utente = await verificaToken(req); // Verifica token
  // oppure
  const barber = await richiedeRuolo(req, 'barber'); // Richiede ruolo specifico
}
```

### Webservice Centralizzato

Tutte le chiamate HTTP passano attraverso `utils/webservice.js`:

```typescript
import webservice from '@/utils/webservice';

// GET
const servizi = await webservice.get('/api/servizi');

// POST
const nuovoAppuntamento = await webservice.post('/api/appuntamenti', dati);

// PUT
const aggiornato = await webservice.put('/api/servizi/123', dati);

// DELETE
await webservice.delete('/api/servizi/123');
```

**Vantaggi:**
- Token JWT aggiunto automaticamente
- Gestione errori centralizzata
- Logging automatico
- Redirect automatico al login se non autenticato

## 📚 Helpers e Utilità

### Funzioni Disponibili

```typescript
// Formattazione
formattaData(data, 'dd/MM/yyyy') // "14/02/2024"
formattaPrezzo(25) // "25,00 €"
formattaOra('14:30') // "14:30"

// Calcoli
calcolaOraFine('14:00', 30) // "14:30"
generaSlotOrari('09:00', '18:00', 30) // ['09:00', '09:30', ...]

// Validazioni
isEmailValida('test@email.com') // true
isTelefonoValido('1234567890') // true
isDataPassata(new Date('2020-01-01')) // true

// Utilità
capitalizza('mario') // "Mario"
getNomeGiorno(new Date()) // "lunedi"
```

## 🎨 Styling

### Tailwind CSS

Il progetto usa Tailwind CSS con una palette personalizzata:

```javascript
// tailwind.config.js
colors: {
  primary: { ... },
  barber: {
    dark: '#1a1a1a',
    gold: '#d4af37',
    cream: '#f5f5dc',
  }
}
```

### Classi Utility Personalizzate

```css
.btn-primary - Bottone primario
.btn-secondary - Bottone secondario
.card - Card container
.input-field - Campo input
.label - Label per input
```

## 🧪 Testing

Per testare l'applicazione:

1. **Crea un utente barber**
```bash
# Usa MongoDB Compass o mongosh
db.utentes.insertOne({
  nome: "Mario",
  cognome: "Rossi",
  email: "barber@test.com",
  password: "$2a$10$...", // hash di "password123"
  telefono: "1234567890",
  ruolo: "barber",
  attivo: true
})
```

2. **Crea alcuni servizi**
3. **Testa il flusso di prenotazione**

## 📝 Note Importanti

### Sicurezza

- ✅ Password hashate con bcrypt
- ✅ JWT per autenticazione
- ✅ Validazione input lato server
- ✅ Protezione route API con middleware
- ✅ Soft delete (attivo: false) invece di eliminazione fisica

### Performance

- ✅ Connessione MongoDB con pattern singleton
- ✅ Indici database per query ottimizzate
- ✅ Populate selettivo per ridurre payload
- ✅ Caching connessione in development

### Best Practices

- ✅ TypeScript per type safety
- ✅ Componenti riutilizzabili
- ✅ Separazione concerns (UI, logica, dati)
- ✅ Gestione errori centralizzata
- ✅ Codice commentato e documentato

## 🚧 Sviluppi Futuri

- [ ] Sistema di notifiche (email/SMS)
- [ ] Calendario interattivo
- [ ] Upload immagini servizi
- [ ] Sistema di recensioni
- [ ] Dashboard analytics avanzata
- [ ] Multi-barber support
- [ ] Integrazione pagamenti
- [ ] App mobile (React Native)

## 📄 Licenza

Questo progetto è stato creato a scopo didattico.

## 👨‍💻 Autore

Progetto sviluppato come esempio di full-stack application con Next.js, TypeScript e MongoDB.

---

**Buon coding! 💈✂️**
# Email: barber@test.com
# Password: password123# andreamakeup
