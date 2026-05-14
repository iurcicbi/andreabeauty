import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tipo = formData.get('tipo') as string; // 'logo' o 'documento'

    if (!file) {
      return NextResponse.json(
        { errore: 'Nessun file caricato' },
        { status: 400 }
      );
    }

    // Validazione tipo file
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      documento: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const tipoFile = tipo === 'logo' ? 'logo' : 'documento';
    
    if (!allowedTypes[tipoFile].includes(file.type)) {
      return NextResponse.json(
        { errore: `Tipo file non supportato. Usa: ${allowedTypes[tipoFile].join(', ')}` },
        { status: 400 }
      );
    }

    // Validazione dimensione (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { errore: 'File troppo grande. Massimo 10MB' },
        { status: 400 }
      );
    }

    // Converti il file in buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Genera nome file sicuro
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;

    // Determina la cartella di destinazione
    const folder = tipo === 'logo' ? 'uploads/logo' : 'uploads/documenti';
    const uploadDir = path.join(process.cwd(), 'public', folder);

    // Crea la cartella se non esiste
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('Cartella già esistente o errore nella creazione:', err);
    }

    // Salva il file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Ritorna il percorso pubblico
    const publicPath = `/${folder}/${fileName}`;

    return NextResponse.json({
      messaggio: 'File caricato con successo',
      url: publicPath,
      nome: fileName,
      dimensione: file.size,
      tipo: file.type,
    });

  } catch (errore: any) {
    console.error('Errore upload file:', errore);
    return NextResponse.json(
      { errore: 'Errore durante il caricamento del file' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { errore: 'Percorso file mancante' },
        { status: 400 }
      );
    }

    // Sicurezza: verifica che il path sia nelle cartelle consentite
    if (!filePath.startsWith('/uploads/')) {
      return NextResponse.json(
        { errore: 'Percorso non autorizzato' },
        { status: 403 }
      );
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    // Elimina il file
    const fs = require('fs').promises;
    await fs.unlink(fullPath);

    return NextResponse.json({
      messaggio: 'File eliminato con successo',
    });

  } catch (errore: any) {
    console.error('Errore eliminazione file:', errore);
    return NextResponse.json(
      { errore: 'Errore durante l\'eliminazione del file' },
      { status: 500 }
    );
  }
}
