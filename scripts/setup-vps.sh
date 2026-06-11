#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║             BEAUTY SALON - DEPLOY VPS                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# ─── Configurazioni ─────────────────────────────────────────────
DOMAIN="cambia.con.tuo.dominio.com"
MONGODB_URI_INTERNA="mongodb://mongo:27017/beauty"
PWD=$(pwd)

# ─── Step 1: Crea .env ──────────────────────────────────────────
if [ ! -f .env ]; then
    echo "❌ .env non trovato!"
    echo ""
    echo "Crea il file .env a partire da .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    echo ""
    echo "Genera i segreti con:"
    echo "  openssl rand -hex 64"
    echo "  openssl rand -hex 32 (per CRON_SECRET)"
    echo ""
    echo "Poi imposta DOMAIN e gli URL pubblici in .env."
    exit 1
fi

# ─── Step 2: Costruisci e avvia ─────────────────────────────────
echo ""
echo "🛠  Costruisco le immagini Docker..."
docker compose build --no-cache

echo ""
echo "🚀 Avvio i container..."
docker compose up -d mongo

echo ""
echo "⏳ Attendo che MongoDB sia pronto..."
sleep 5
docker compose up -d app

echo ""
echo "📋 Log del container app (per QR code WhatsApp):"
echo "   docker logs -f $(docker compose ps -q app)"
echo ""

# ─── Step 3: Istruzioni ─────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  DEPLOY COMPLETATO                                          ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  📱 QR CODE WHATSAPP:                                       ║"
echo "║     docker logs -f $(docker compose ps -q app | head -1)    ║"
echo "║     Scannerizza il QR con WhatsApp → Dispositivi collegati  ║"
echo "║                                                              ║"
echo "║  🔄 RIAVVIO DOPO QR:                                        ║"
echo "║     docker compose restart app                               ║"
echo "║                                                              ║"
echo "║  🌐 L'APP È IN ASCOLTO SU: http://$(hostname -I | awk '{print $1}'):3000  ║"
echo "║                                                              ║"
echo "║  🚀 COMANDI UTILI:                                          ║"
echo "║     docker compose logs -f        # Log in tempo reale       ║"
echo "║     docker compose down           # Ferma tutto              ║"
echo "║     docker compose up -d          # Avvia tutto              ║"
echo "║     docker compose restart app    # Riavvia solo l'app       ║"
echo "║                                                              ║"
echo "║  🔒 REVERSE PROXY (Nginx/Caddy):                             ║"
echo "║     Mappa il dominio $DOMAIN → http://localhost:3000       ║"
echo "║     Con SSL (Let's Encrypt)                                  ║"
echo "║                                                              ║"
echo "║  📊 HEALTH CHECK:                                            ║"
echo "║     curl http://localhost:3000/api/health                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
