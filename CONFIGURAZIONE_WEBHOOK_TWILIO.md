# 🔧 Configurazione Webhook Twilio WhatsApp

## 📋 Panoramica

Questa guida ti aiuta a configurare il webhook Twilio per ricevere le risposte WhatsApp dei clienti nel tuo sistema di promemoria.

## 🚀 Configurazione Sviluppo Locale

### 1. Avvia il Server Next.js

```bash
npm run dev
# Server in esecuzione su http://localhost:3000
```

### 2. Avvia ngrok (in un nuovo terminale)

```bash
# Avvia ngrok sulla porta 3000
ngrok http 3000
```

**Output ngrok:**
```
ngrok by @inconshreveable

Session Status                online
Account                       your-account
Version                       3.x.x
Region                        Europe (eu)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
Forwarding                    http://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**⚠️ IMPORTANTE:** Copia l'URL HTTPS (es: `https://abc123.ngrok.io`)

### 3. Testa il Webhook Localmente

```bash
# Testa che il webhook risponda
curl -X POST https://abc123.ngrok.io/api/webhooks/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+393331234567&Body=CONFERMO&MessageSid=test123"
```

**Risposta attesa:**
```xml
<Response></Response>
```

## 🌐 Configurazione Twilio Console

### 1. Accedi a Twilio Console

1. Vai su [Twilio Console](https://console.twilio.com/)
2. Accedi con le tue credenziali

### 2. Configura WhatsApp Sandbox

1. **Naviga a:** `Messaging` → `Try it out` → `WhatsApp Sandbox`
2. **URL:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### 3. Configura il Webhook

Nella sezione **"Sandbox Configuration"**:

**When a message comes in:**
```
https://abc123.ngrok.io/api/webhooks/whatsapp
```

**HTTP Method:** `POST`

**Content Type:** `application/x-www-form-urlencoded`

### 4. Salva la Configurazione

Clicca **"Save Configuration"**

## 📱 Test del Sistema Completo

### 1. Unisciti al Sandbox WhatsApp

1. Nella Twilio Console, troverai il **numero sandbox** (es: +1 415 523 8886)
2. Troverai il **codice join** (es: "join abc-def")
3. **Invia un messaggio WhatsApp** al numero sandbox con il codice join

**Esempio:**
```
Numero: +1 415 523 8886
Messaggio: join abc-def
```

### 2. Testa l'Invio Promemoria

```bash
# Testa invio promemoria
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+393331234567",
    "customerName": "Mario Rossi", 
    "appointmentTime": "14:30",
    "appointmentDate": "lunedì 23 dicembre 2024"
  }'
```

### 3. Testa le Risposte

Dopo aver ricevuto il promemoria WhatsApp, rispondi con:
- `CONFERMO` → Conferma appuntamento
- `CANCELLA` → Cancella appuntamento

## 🚀 Configurazione Produzione

### 1. Deploy su Vercel

```bash
# Deploy su Vercel
vercel --prod
```

### 2. Aggiorna Webhook Twilio

Sostituisci l'URL ngrok con l'URL di produzione:

**Webhook URL:**
```
https://tuo-dominio.vercel.app/api/webhooks/whatsapp
```

### 3. Configura Variabili d'Ambiente

In Vercel Dashboard → Settings → Environment Variables:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_CONTENT_SID=HXd157734942ace80065f74546513e07b1
MONGODB_URI=your_mongodb_connection_string
```

## 🔍 Debug e Troubleshooting

### 1. Verifica Webhook

```bash
# Controlla che il webhook risponda
curl -X GET https://abc123.ngrok.io/api/webhooks/whatsapp
```

### 2. Log Twilio

1. Vai su **Twilio Console** → **Monitor** → **Logs** → **Errors**
2. Controlla eventuali errori di webhook

### 3. Log Applicazione

Controlla i log del server Next.js per vedere i webhook ricevuti:

```bash
# Nel terminale dove gira npm run dev
📱 Webhook WhatsApp ricevuto
📦 Dati webhook: { From: 'whatsapp:+393331234567', Body: 'CONFERMO' }
✅ Cliente ha confermato l'appuntamento
```

### 4. Test Configurazione Sistema

```bash
# Verifica configurazione completa
curl http://localhost:3000/api/test/whatsapp
```

**Risposta attesa:**
```json
{
  "success": true,
  "message": "Sistema WhatsApp configurato correttamente",
  "twilio": { "configured": true },
  "database": { "totalAppuntamenti": 0 }
}
```

## ⚠️ Problemi Comuni

### 1. Webhook non ricevuto

**Problema:** Twilio non riesce a raggiungere il webhook

**Soluzioni:**
- Verifica che ngrok sia attivo
- Controlla che l'URL sia HTTPS
- Verifica che il server Next.js sia in esecuzione

### 2. Errore 404 sul webhook

**Problema:** Endpoint non trovato

**Soluzioni:**
- Verifica che il file `app/api/webhooks/whatsapp/route.ts` esista
- Controlla che l'URL sia corretto: `/api/webhooks/whatsapp`

### 3. Errore parsing dati

**Problema:** Dati webhook non parsati correttamente

**Soluzioni:**
- Verifica che Content-Type sia `application/x-www-form-urlencoded`
- Controlla i log per vedere i dati ricevuti

### 4. Database non aggiornato

**Problema:** Stato appuntamento non cambia

**Soluzioni:**
- Verifica connessione MongoDB
- Controlla che l'appuntamento esista nel database
- Verifica che il numero telefono corrisponda

## 📋 Checklist Configurazione

- [ ] Server Next.js in esecuzione (`npm run dev`)
- [ ] ngrok installato e attivo (`ngrok http 3000`)
- [ ] URL ngrok copiato (HTTPS)
- [ ] Webhook configurato in Twilio Console
- [ ] Unito al WhatsApp Sandbox
- [ ] Test endpoint `/api/test/whatsapp` funzionante
- [ ] Test invio promemoria riuscito
- [ ] Test risposta WhatsApp funzionante
- [ ] Log webhook visibili nel terminale

## 🎯 Prossimi Passi

1. **Completa la configurazione** seguendo questa guida
2. **Testa il sistema** con un appuntamento reale
3. **Monitora i log** per verificare il funzionamento
4. **Deploy in produzione** quando tutto funziona localmente

## 📞 Supporto

Se hai problemi:
1. Controlla i log del server Next.js
2. Verifica i log di Twilio Console
3. Testa con `curl` gli endpoint
4. Controlla che tutte le variabili d'ambiente siano configurate