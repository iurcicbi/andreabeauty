/**
 * PRODUCTION SERVER - Next.js + Cron Reminders
 *
 * Single process: Next.js + MongoDB + WhatsApp + Cron reminders.
 */

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
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
    const mod = await import('./src/bootstrap');
    const bootstrapFn = mod.bootstrap || mod.default?.bootstrap || mod.default;
    if (typeof bootstrapFn !== 'function') {
      console.error(' Bootstrap export not found. Module keys:', Object.keys(mod));
      throw new Error('bootstrap export not found');
    }
    await bootstrapFn();
  } catch (err) {
    console.error(' Bootstrap error:', err.message);
    console.log(' Server continuing without bootstrap services');
  }

  const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      // Serve file statici da public/uploads/ (caricati dopo il build)
      if (parsedUrl.pathname.startsWith('/uploads/')) {
        const filePath = path.join(UPLOADS_DIR, parsedUrl.pathname.replace('/uploads/', ''));
        // Security: evita path traversal
        if (!filePath.startsWith(UPLOADS_DIR)) {
          res.statusCode = 403;
          res.end('Forbidden');
          return;
        }
        const stat = fs.existsSync(filePath) && fs.statSync(filePath);
        if (stat && stat.isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
            '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
            '.avif': 'image/avif', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          const stream = fs.createReadStream(filePath);
          stream.on('error', () => {
            res.statusCode = 404;
            res.end('Not Found');
          });
          stream.pipe(res);
          return;
        }
      }
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error(' Request error:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(` Server ready on http://${hostname}:${port}`);
    console.log(` Environment: ${dev ? 'development' : 'production'}`);
  });
}

main().catch(err => {
  console.error(' Fatal startup error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error(' Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log(' Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(' Shutting down...');
  process.exit(0);
});
