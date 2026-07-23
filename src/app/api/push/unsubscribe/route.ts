import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/app/actions/admin';

export async function POST(req: Request) {
  try {
    // Verificar se o usuário é ADMIN
    await checkAdmin();
    
    const { endpoint } = await req.json();
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    // Remover a inscrição do banco de dados
    await prisma.adminPushSubscription.deleteMany({
      where: { endpoint }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
