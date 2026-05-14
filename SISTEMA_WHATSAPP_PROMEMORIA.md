# 📱 Sistema WhatsApp Promemoria - Documentazione Completa

## 📋 Panoramica

Il sistema di promemoria WhatsApp invia automaticamente messaggi ai clienti 24 ore prima del loro appuntamento e gestisce le loro risposte (conferma/cancellazione). È integrato con Twilio e MongoDB.

## 🏗️ Architettura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Next.js App   │    │     Twilio      │
│  (appointments) │◄──►│   (Webhook)     │◄──►│   (WhatsApp)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                       ▲                       ▲
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Scheduler     │    │   API Routes    │    │    Cliente      │
│  (ogni minuto)  │    │   (Test/Cron)   │    │   WhatsApp      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Struttura File Implementati

### 1. **Client Twilio** - `lib/twilio/client.ts`
**Scopo:** Gestisce la comunicazione con Twilio per inviare messaggi WhatsApp

```typescript
// Funzioni principali:
- initTwilioClient(): Inizializza client Twilio con lazy loading
- sendWhatsAppReminder(): Invia promemoria usando template Twilio
- verifyTwilioConfig(): Verifica configurazione
- getTwilioAccountInfo(): Info account per debug
```

**Caratteristiche:**
- ✅ Lazy loading (client creato solo quando necessario)
- ✅ Gestione errori Twilio specifici (rate limit, numero non valido)
- ✅ Validazione formato E.164 per numeri telefono
- ✅ Template Twilio con placeholder dinamici
- ✅ Graceful degradation se Twilio non configurato

### 2. **Webhook WhatsApp** - `app/api/webhooks/whatsapp/route.ts`
**Scopo:** Riceve e processa le risposte dei clienti da Twilio

```typescript
// Flusso webhook:
1. Riceve POST da Twilio con form-data
2. Estrae numero telefono e messaggio
3. Trova appuntamento nel database
4. Riconosce risposta (CONFERMO/CANCELLA)
5. Aggiorna stato appuntamento
6. Restituisce XML response a Twilio
```

**Risposte riconosciute:**
- **CONFERMA:** `CONFERMO`, `CONFERMA`, `SI`, `OK`
- **CANCELLA:** `CANCELLA`, `CANCELLO`, `ANNULLA`, `NO`

**Logica database:**
- Cerca appuntamenti con `reminderSent: true`
- Solo appuntamenti futuri (`data >= oggi`)
- Stato `confermato` o `in_attesa`
- Ordina per data (prende il prossimo)

### 3. **Scheduler Automatico** - `services/reminderScheduler.ts`
**Scopo:** Controlla ogni minuto gli appuntamenti e invia promemoria automatici

```typescript
// Logica scheduler:
1. Calcola finestra 24h ± 5 minuti
2. Trova appuntamenti candidati
3. Invia promemoria con rate limiting (2s tra messaggi)
4. Aggiorna database (reminderSent: true)
5. Gestisce errori e retry
```

**Finestra temporale:**
```javascript
const now = new Date();
const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000); // -5 min
const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);   // +5 min
```

**Criteri selezione appuntamenti:**
- `reminderSent: false`
- `stato: 'confermato'`
- `data` nella finestra 24h ± 5 minuti
- Numero telefono in formato E.164

### 4. **Schema Database** - `utils/mongo/schemi/Appuntamento.ts`
**Scopo:** Definisce struttura appuntamenti con campi WhatsApp

```typescript
// Campi aggiunti per WhatsApp:
reminderSent: boolean;           // Promemoria inviato
reminderSentAt: Date;           // Quando inviato
reminderError: string;          // Errore invio
reminderErrorAt: Date;          // Quando errore
twilioMessageSid: string;       // ID messaggio Twilio
cancelledBy: 'customer'|'barber'; // Chi ha cancellato
cancelledAt: Date;              // Quando cancellato
```

**Collection:** `appointments` (usa quella esistente)

### 5. **API Test** - `app/api/test/whatsapp/route.ts`
**Scopo:** Endpoint per testare il sistema

```typescript
// GET: Verifica configurazione
// POST: Invia promemoria di test
```

**Response GET:**
```json
{
  "success": true,
  "twilio": { "configured": true, "account": {...} },
  "database": { "totalAppuntamenti": 8, "promemoriaDaInviare": 1 },
  "endpoints": { "webhook": "/api/webhooks/whatsapp", ... }
}
```

### 6. **API Cron** - `app/api/cron/reminders/route.ts`
**Scopo:** Trigger manuale scheduler (protetto)

### 7. **API Test Scheduler** - `app/api/test/scheduler/route.ts`
**Scopo:** Test manuale scheduler (senza protezione)

### 8. **Inizializzazione** - `lib/scheduler/init.ts`
**Scopo:** Avvia scheduler automatico all'avvio app

```typescript
// Avviato in app/layout.tsx:
import '@/lib/scheduler/init';
```

## ⚙️ Configurazione

### 1. **Variabili d'Ambiente** - `.env.local`
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_CONTENT_SID=HXd157734942ace80065f74546513e07b1

# Database
MONGODB_URI=mongodb://localhost:27017/barbershop
```

### 2. **Vercel Cron Jobs** - `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "* * * * *"
    }
  ]
}
```

### 3. **Package.json** - Dipendenze aggiunte
```json
{
  "dependencies": {
    "twilio": "^4.x.x",
    "mongoose": "^8.x.x",
    "node-cron": "^3.x.x"
  }
}
```

## 🔄 Flusso Operativo Completo

### 1. **Creazione Appuntamento**
```
Cliente prenota → Appuntamento salvato in DB → reminderSent: false
```

### 2. **Scheduler Automatico (ogni minuto)**
```
Scheduler → Controlla finestra 24h → Trova appuntamenti → Invia promemoria → Aggiorna DB
```

### 3. **Invio Promemoria**
```
Sistema → Twilio API → WhatsApp → Cliente riceve messaggio
```

### 4. **Risposta Cliente**
```
Cliente risponde → Twilio → Webhook → Aggiorna DB → Log sistema
```

### 5. **Gestione Stati**
```
Appuntamento: confermato → reminderSent: true → Cliente: CONFERMO → stato: confermato
Appuntamento: confermato → reminderSent: true → Cliente: CANCELLA → stato: cancellato
```

## 📊 Stati Appuntamento

| Stato | Descrizione | Promemoria | Azioni |
|-------|-------------|------------|---------|
| `in_attesa` | Appena creato | ❌ No | Attende conferma |
| `confermato` | Confermato dal sistema | ✅ Si | Scheduler lo trova |
| `completato` | Servizio erogato | ❌ No | Archiviato |
| `cancellato` | Cancellato | ❌ No | Non processato |

## 🛠️ Comandi di Test

### Test Configurazione
```bash
curl http://localhost:3000/api/test/whatsapp
```

### Test Invio Promemoria
```bash
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+393288625535", "customerName": "Mario Rossi"}'
```

### Test Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+393288625535&Body=CONFERMO"
```

### Test Scheduler
```bash
curl -X POST http://localhost:3000/api/test/scheduler
```

## 🔧 Script di Utilità

### 1. **Verifica Appuntamenti** - `scripts/verifica-appuntamenti.js`
- Mostra tutti gli appuntamenti per un numero
- Statistiche promemoria
- Finestra scheduler 24h

### 2. **Test Completo** - `scripts/test-finale-whatsapp.js`
- Test end-to-end completo
- Verifica tutti i componenti
- Statistiche finali

### 3. **Crea Test** - `scripts/crea-appuntamento-test-whatsapp.js`
- Crea appuntamenti di test
- Uno per test manuale
- Uno per scheduler 24h

## 🚨 Gestione Errori

### 1. **Errori Twilio**
```typescript
// Codici errore gestiti:
21211: 'Numero WhatsApp non valido'
20429: 'Rate limit raggiunto'
21408: 'Numero non abilitato per WhatsApp'
```

### 2. **Graceful Degradation**
- Sistema funziona anche senza Twilio configurato
- Log dettagliati per debug
- Fallback per errori database

### 3. **Rate Limiting**
- 2 secondi tra messaggi consecutivi
- Evita spam e rispetta limiti Twilio

## 📱 Template Messaggio

**Template Twilio ID:** `HXd157734942ace80065f74546513e07b1`

**Placeholder:**
- `{{1}}` = Nome cliente
- `{{2}}` = Orario e data appuntamento

**Messaggio tipo:**
```
Ciao Mario! Ti ricordiamo il tuo appuntamento per domani alle 15:00 del 23 marzo 2026. 
Rispondi CONFERMO per confermare o CANCELLA per cancellare.
```

## 🔐 Sicurezza

### 1. **Validazione Input**
- Numeri telefono formato E.164
- Sanitizzazione messaggi webhook
- Validazione dati Twilio

### 2. **Protezione Endpoint**
- Cron endpoint protetto (produzione)
- Test endpoint solo sviluppo
- Webhook pubblico (necessario per Twilio)

### 3. **Gestione Credenziali**
- Variabili d'ambiente per Twilio
- Lazy loading client
- Non esporre credenziali nei log

## 📈 Monitoraggio

### 1. **Log Sistema**
```
📱 Webhook WhatsApp ricevuto
✅ Promemoria inviato con successo
🔄 Scheduler completato
❌ Errore invio promemoria
```

### 2. **Metriche Database**
- Promemoria inviati vs falliti
- Tasso conferma/cancellazione
- Appuntamenti in finestra 24h

### 3. **Debug Twilio**
- Message SID per tracking
- Status messaggi
- Info account Twilio

## 🚀 Deployment

### 1. **Sviluppo Locale**
- Server Next.js: `npm run dev`
- ngrok: `ngrok http 3000`
- Webhook: `https://abc123.ngrok.io/api/webhooks/whatsapp`

### 2. **Produzione Vercel**
- Deploy: `vercel --prod`
- Cron Jobs automatici
- Webhook: `https://tuo-dominio.vercel.app/api/webhooks/whatsapp`

### 3. **Configurazione Twilio**
- WhatsApp Sandbox per test
- Webhook URL configurato
- Template approvato

## ✅ Checklist Funzionamento

- [ ] Variabili d'ambiente configurate
- [ ] Database MongoDB connesso
- [ ] Schema appuntamenti aggiornato
- [ ] Twilio account attivo
- [ ] Webhook configurato in Twilio
- [ ] ngrok attivo (sviluppo)
- [ ] Template Twilio disponibile
- [ ] Scheduler automatico avviato
- [ ] Test configurazione OK
- [ ] Test invio promemoria OK
- [ ] Test webhook risposte OK

## 🎯 Risultato Finale

Il sistema è completamente automatico:

1. **Cliente prenota** → Appuntamento in DB
2. **24h prima** → Scheduler invia promemoria automatico
3. **Cliente risponde** → Webhook aggiorna stato
4. **Barbiere vede** → Stato aggiornato nel CMS

**Zero intervento manuale richiesto!** 🎉