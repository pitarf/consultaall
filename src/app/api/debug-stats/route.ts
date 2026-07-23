import { NextResponse } from 'next/server';
import { getAdvancedMetrics } from '@/app/actions/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const m = month ? parseInt(month) : new Date().getMonth();
    
    const advanced = await getAdvancedMetrics(m);
    
    return NextResponse.json({
      success: true,
      month: m,
      statsByDay: advanced.statsByDay,
      monthlyRevenue: advanced.monthlyRevenue
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
