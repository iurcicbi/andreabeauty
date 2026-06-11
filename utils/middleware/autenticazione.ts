/**
 * MIDDLEWARE AUTENTICAZIONE
 * 
 * Protegge le route API verificando il token JWT.
 * 
 * FLUSSO:
 * 1. Estrae il token dall'header Authorization
 * 2. Verifica che il token sia valido
 * 3. Decodifica il token per ottenere i dati utente
 * 4. Aggiunge i dati utente alla richiesta
 * 5. Permette l'accesso alla route
 * 
 * UTILIZZO nelle API:
 * import { verificaToken, richiedeRuolo } from '@/utils/middleware/autenticazione';
 * 
 * export async function GET(req: Request) {
 *   const utente = await verificaToken(req);
 *   // ... logica API
 * }
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

function getJWTSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('❌ JWT_SECRET non configurata. Imposta la variabile d\'ambiente JWT_SECRET.');
  }
  return process.env.JWT_SECRET;
}

// Interfaccia per il payload del token
export interface TokenPayload {
  id: string;
  email: string;
  ruolo: 'utente' | 'specialist' | 'barber' | 'admin';
  iat?: number; // issued at
  exp?: number; // expiration
}

/**
 * Estrae il token dall'header Authorization
 * 
 * @param req - Richiesta HTTP
 * @returns Token JWT o null
 */
function estraiToken(req: NextRequest | Request): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Il formato è: "Bearer TOKEN"
  const parti = authHeader.split(' ');
  
  if (parti.length !== 2 || parti[0] !== 'Bearer') {
    return null;
  }

  return parti[1];
}

/**
 * VERIFICA TOKEN
 * 
 * Verifica che il token JWT sia valido e restituisce i dati utente.
 * 
 * @param req - Richiesta HTTP
 * @returns Dati utente dal token
 * @throws Errore se il token non è valido
 */
export async function verificaToken(req: NextRequest | Request): Promise<TokenPayload> {
  const token = estraiToken(req);

  if (!token) {
    throw new Error('Token non fornito');
  }

  try {
    // Verifica e decodifica il token
    const decoded = jwt.verify(token, getJWTSecret()) as TokenPayload;
    
    return decoded;
  } catch (errore) {
    if (errore instanceof jwt.TokenExpiredError) {
      throw new Error('Token scaduto');
    } else if (errore instanceof jwt.JsonWebTokenError) {
      throw new Error('Token non valido');
    } else {
      throw new Error('Errore nella verifica del token');
    }
  }
}

/**
 * RICHIEDE RUOLO
 * 
 * Verifica che l'utente abbia il ruolo richiesto.
 * 
 * @param req - Richiesta HTTP
 * @param ruoloRichiesto - Ruolo necessario ('utente' o 'specialist')
 * @returns Dati utente se il ruolo è corretto
 * @throws Errore se il ruolo non corrisponde
 */
export async function richiedeRuolo(
  req: NextRequest | Request,
  ruoloRichiesto: 'utente' | 'specialist'
): Promise<TokenPayload> {
  const utente = await verificaToken(req);

  // Admin ha sempre accesso a tutto
  if (utente.ruolo === 'admin') {
    return utente;
  }

  const ruoliValidi = ruoloRichiesto === 'specialist'
    ? ['specialist', 'barber']
    : [ruoloRichiesto];

  if (!ruoliValidi.includes(utente.ruolo)) {
    throw new Error(`Accesso negato. Ruolo richiesto: ${ruoloRichiesto}`);
  }

  return utente;
}

/**
 * GENERA TOKEN
 * 
 * Crea un nuovo token JWT per l'utente.
 * 
 * @param payload - Dati da includere nel token
 * @param expiresIn - Durata del token (default: 7 giorni)
 * @returns Token JWT
 */
export function generaToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresIn: string = '7d'
): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn } as SignOptions);
}

/**
 * WRAPPER PER GESTIONE ERRORI
 * 
 * Avvolge una funzione handler API con gestione errori automatica.
 * 
 * @param handler - Funzione handler da proteggere
 * @returns Handler con gestione errori
 */
export function conGestioneErrori(
  handler: (req: NextRequest, utente: TokenPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const utente = await verificaToken(req);
      return await handler(req, utente);
    } catch (errore) {
      const messaggio = errore instanceof Error ? errore.message : 'Errore sconosciuto';
      
      // Determina lo status code appropriato
      let status = 500;
      if (messaggio.includes('Token')) {
        status = 401;
      } else if (messaggio.includes('Accesso negato')) {
        status = 403;
      }

      return NextResponse.json(
        { successo: false, errore: messaggio },
        { status }
      );
    }
  };
}
