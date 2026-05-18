import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const GET = async (_req: NextRequest) => {
  const checks = {
    status: 'ok',
    mongo: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
    },
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV,
  };

  const status = checks.mongo ? 200 : 503;
  return NextResponse.json(checks, { status });
};
