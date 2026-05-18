import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { env } from '@/src/config/env';
import { validateMimeType } from '@/src/middleware/security';
import { logger } from '@/src/logging/logger';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'image/gif', 'image/svg+xml',
];

const BLOCKED_SVG_PATTERNS = [
  /<script/i, /<object/i, /<embed/i, /onload=/i, /onerror=/i,
  /javascript:/i, /data:/i, /<foreignObject/i,
];

function validateImage(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'image/svg+xml') {
    const content = buffer.toString('utf-8');
    if (BLOCKED_SVG_PATTERNS.some(p => p.test(content))) return false;
  }
  if (mimeType === 'image/jpeg' && buffer[0] !== 0xFF && buffer[1] !== 0xD8) return false;
  if (mimeType === 'image/png' && (buffer[0] !== 0x89 || buffer[1] !== 0x50)) return false;
  return true;
}

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: { code: 'UPLOAD_ERROR', message: 'No file provided' } }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type) || !validateMimeType(file.type)) {
      return NextResponse.json({ error: { code: 'UPLOAD_ERROR', message: 'File type not allowed' } }, { status: 400 });
    }

    if (file.size > env.UPLOAD_MAX_SIZE) {
      return NextResponse.json({ error: { code: 'UPLOAD_ERROR', message: 'File too large' } }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateImage(buffer, file.type)) {
      return NextResponse.json({ error: { code: 'UPLOAD_ERROR', message: 'Invalid image content' } }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), env.UPLOAD_DIR);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    logger.info({ msg: 'File uploaded', filename, size: file.size, type: file.type });

    return NextResponse.json({
      success: true,
      dati: { filename, url: `/uploads/${filename}`, size: file.size, mimetype: file.type },
    });
  } catch (err: any) {
    logger.error({ msg: 'Upload failed', error: err.message });
    return NextResponse.json({ error: { code: 'UPLOAD_ERROR', message: 'Upload failed' } }, { status: 500 });
  }
};
