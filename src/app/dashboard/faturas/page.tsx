import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import FaturasClient from './FaturasClient';

export default async function FaturasPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, balance: true }
  });

  if (!user) {
    redirect('/login');
  }

  const deposits = await prisma.transaction.findMany({
    where: { userId: session.userId, type: 'DEPOSIT' },
    orderBy: { createdAt: 'desc' }
  });

  return <FaturasClient initialUser={user} initialDeposits={deposits} />;
}
