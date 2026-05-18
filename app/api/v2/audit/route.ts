import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { getAuditLogs } from '@/src/logging/audit';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const result = await getAuditLogs(ctx.query);
    return NextResponse.json({ success: true, ...result });
  },
  {
    auth: true,
    permissions: ['audit:read' as Permission],
  },
);
