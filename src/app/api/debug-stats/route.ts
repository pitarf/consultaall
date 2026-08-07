import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const BR_OFFSET_MS = -3 * 60 * 60 * 1000;
    const startBr = new Date(dateStr + 'T00:00:00');
    const endBr = new Date(dateStr + 'T23:59:59.999');
    const startUTC = new Date(startBr.getTime() - BR_OFFSET_MS);
    const endUTC = new Date(endBr.getTime() - BR_OFFSET_MS);

    const logs = await prisma.systemLog.findMany({
      where: {
        createdAt: { gte: startUTC, lte: endUTC }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      totalLogs: logs.length,
      logs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
