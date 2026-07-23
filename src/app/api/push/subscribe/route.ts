import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/app/actions/admin';
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Helper to get userId securely
async function getUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Verificar se o usuário é ADMIN
    await checkAdmin();
    
    const subscription = await req.json();
    
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const userId = await getUserId();

    // Salvar ou atualizar no banco de dados
    await prisma.adminPushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: userId || undefined
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: userId || undefined
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
