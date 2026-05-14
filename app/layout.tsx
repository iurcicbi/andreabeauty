/**
 * LAYOUT PRINCIPALE
 * 
 * Questo è il layout root dell'applicazione Next.js.
 * Viene applicato a tutte le pagine.
 */

import type { Metadata } from 'next';
import './globals.css';
import { initializeScheduler } from '@/lib/scheduler/init';
import dbConnect from '@/utils/mongodb';
import Impostazioni from '@/models/Impostazioni';

// Funzione per caricare i metadati dinamici
async function getMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const impostazioni = await Impostazioni.getImpostazioni();
    
    return {
      title: impostazioni.seo?.titoloPagina || 'Barber Shop - Prenota il tuo appuntamento',
      description: impostazioni.seo?.descrizioneMeta || 'Portale di prenotazione per il tuo barber shop di fiducia',
      keywords: impostazioni.seo?.keywords || 'barbershop, barber, taglio capelli',
      openGraph: {
        title: impostazioni.seo?.titoloPagina || 'Barber Shop',
        description: impostazioni.seo?.descrizioneMeta || 'Portale di prenotazione',
        images: impostazioni.seo?.ogImage ? [impostazioni.seo.ogImage] : [],
      },
      icons: {
        icon: impostazioni.favicon || '/favicon.ico',
      }
    };
  } catch (error) {
    return {
      title: 'Barber Shop - Prenota il tuo appuntamento',
      description: 'Portale di prenotazione per il tuo barber shop di fiducia',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata();
}

// Inizializza lo scheduler all'avvio dell'applicazione
if (typeof window === 'undefined') {
  initializeScheduler();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
