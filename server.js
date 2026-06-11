/**
 * PRODUCTION SERVER - Next.js + Cron Reminders
 *
 * Single process: Next.js + MongoDB + WhatsApp + Cron reminders.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Load .env files before environment validation
try { require('dotenv').config({ path: '.env' }); } catch (_) {}
try { require('dotenv').config({ path: '.env.local', override: true }); } catch (_) {}

// Fail-fast: validate environment on startup
const { env: validatedEnv } = require('./src/config/env');
// Trigger validation immediately
void validatedEnv.NODE_ENV;

async function main() {
  await app.prepare();

  // Bootstrap: MongoDB + WhatsApp + Cron reminders
  try {
    const { bootstrap } = await import('./src/bootstrap');
    await bootstrap();
  } catch (err) {
    console.error('❌ Bootstrap error:', err.message);
    console.log('⚠️ Server continuing without bootstrap services');
  }

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Request error:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`📦 Environment: ${dev ? 'development' : 'production'}`);
  });
}

main().catch(err => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('⚠️ Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️ Shutting down...');
  process.exit(0);
});
