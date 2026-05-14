/**
 * Custom server for Next.js
 * Server personalizzato per gestire Next.js con Node.js
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Determina se siamo in sviluppo o produzione
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Crea l'app Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('🚀 Avvio server Next.js...');

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parsing dell'URL
      const parsedUrl = parse(req.url, true);
      
      // Gestisci la richiesta con Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Errore nella gestione della richiesta:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Server pronto su http://${hostname}:${port}`);
    console.log(`📦 Ambiente: ${dev ? 'development' : 'production'}`);
    console.log(`⏰ ${new Date().toLocaleString('it-IT')}`);
  });
});

// Gestione errori non catturati
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Gestione chiusura graceful
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM ricevuto, chiusura server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT ricevuto, chiusura server...');
  process.exit(0);
});
