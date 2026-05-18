/**
 * LAYOUT PRINCIPALE
 * 
 * Questo è il layout root dell'applicazione Next.js.
 * Viene applicato a tutte le pagine.
 */

import type { Metadata } from 'next';
import './globals.css';
import dbConnect from '@/utils/mongodb';
import Impostazioni from '@/models/Impostazioni';

// Funzione per caricare i metadati dinamici
async function getMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const impostazioni = await Impostazioni.getImpostazioni();
    
    return {
      title: impostazioni.seo?.titoloPagina || 'Beauty Salon - Prenota il tuo appuntamento',
      description: impostazioni.seo?.descrizioneMeta || 'Portale di prenotazione per il tuo beauty salon di fiducia',
      keywords: impostazioni.seo?.keywords || 'beauty salon, makeup, aesthetic, skincare',
      openGraph: {
        title: impostazioni.seo?.titoloPagina || 'Beauty Salon',
        description: impostazioni.seo?.descrizioneMeta || 'Portale di prenotazione',
        images: impostazioni.seo?.ogImage ? [impostazioni.seo.ogImage] : [],
      },
      icons: {
        icon: impostazioni.favicon || '/favicon.ico',
      }
    };
  } catch (error) {
    return {
      title: 'Beauty Salon - Prenota il tuo appuntamento',
      description: 'Portale di prenotazione per il tuo beauty salon di fiducia',
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return await getMetadata();
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
