# 🚀 Quick Start - Sistema WhatsApp Promemoria

## ⚡ Setup Rapido (5 minuti)

### 1. Avvia il Server

```bash
# Terminal 1: Avvia Next.js
npm run dev
```

### 2. Avvia ngrok

```bash
# Terminal 2: Avvia ngrok
ngrok http 3000
```

**📋 Copia l'URL HTTPS** (es: `https://abc123.ngrok.io`)

### 3. Configura Twilio

1. **Vai su:** [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. **Incolla URL webhook:** `https://abc123.ngrok.io/api/webhooks/whatsapp`
3. **Clicca:** "Save Configuration"

### 4. Unisciti al Sandbox

1. **Trova il numero sandbox** (es: +1 415 523 8886)
2. **Trova il codice join** (es: "join abc-def")
3. **Invia WhatsApp:** al numero con il codice

### 5. Test Sistema

```bash
# Test configurazione
npm run test:whatsapp:config

# Test invio promemoria (sostituisci con il tuo numero)
npm run test:whatsapp -- --send +393331234567 "Mario Rossi"
```

### 6. Test Risposta

Dopo aver ricevuto il promemoria WhatsApp, rispondi:
- `CONFERMO` ✅
- `CANCELLA` ❌

## 🎯 Comandi Utili

```bash
# Test completo sistema
npm run test:whatsapp

# Test solo configurazione
npm run test:whatsapp:config

# Test solo scheduler
npm run test:whatsapp:scheduler

# Test invio specifico
npm run test:whatsapp -- --send +393331234567 "Nome Cliente"

# Test webhook specifico
npm run test:whatsapp -- --webhook +393331234567 "CONFERMO"
```

## 🔧 Variabili d'Ambiente

Crea `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_CONTENT_SID=HXd157734942ace80065f74546513e07b1
MONGODB_URI=mongodb://localhost:27017/barbershop
```

## ✅ Checklist

- [ ] Server Next.js attivo (`npm run dev`)
- [ ] ngrok attivo (`ngrok http 3000`)
- [ ] Webhook configurato in Twilio
- [ ] Unito al WhatsApp Sandbox
- [ ] Test configurazione OK
- [ ] Test invio promemoria OK
- [ ] Test risposta WhatsApp OK

## 🆘 Problemi?

```bash
# Verifica configurazione
npm run test:whatsapp:config

# Se errore webhook, controlla:
curl https://abc123.ngrok.io/api/webhooks/whatsapp

# Se errore Twilio, controlla variabili d'ambiente
echo $TWILIO_ACCOUNT_SID
```

## 📚 Documentazione Completa

- `CONFIGURAZIONE_WEBHOOK_TWILIO.md` - Guida dettagliata
- `SISTEMA_WHATSAPP_PROMEMORIA.md` - Documentazione tecnica

---

**🎉 Sistema pronto!** I promemoria verranno inviati automaticamente 24h prima degli appuntamenti confermati.