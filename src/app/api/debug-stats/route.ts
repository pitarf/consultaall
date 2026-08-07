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

    const allSearches = await prisma.searchHistory.findMany({
      where: {
        createdAt: { gte: startUTC, lte: endUTC }
      },
      select: {
        id: true,
        target: true,
        status: true,
        query: true,
        cost: true,
        createdAt: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      total: allSearches.length,
      statusCounts: allSearches.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as any),
      searches: allSearches
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
