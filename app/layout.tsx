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
      title: impostazioni.seo?.titoloPagina || 'AG Studio – Artă și Eleganță',
      description: impostazioni.seo?.descrizioneMeta || 'Platformă de prezentare a portofoliului artistic AG Studio – Makeup & Beauty în Chișinău',
      keywords: impostazioni.seo?.keywords || 'AG Studio, makeup, beauty, Chișinău, machiaj profesionist',
      openGraph: {
        title: impostazioni.seo?.titoloPagina || 'AG Studio – Artă și Eleganță',
        description: impostazioni.seo?.descrizioneMeta || 'Platformă de prezentare a portofoliului artistic AG Studio',
        images: impostazioni.seo?.ogImage ? [impostazioni.seo.ogImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'AG Studio – Artă și Eleganță',
      description: 'Platformă de prezentare a portofoliului artistic AG Studio – Makeup & Beauty în Chișinău',
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
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
