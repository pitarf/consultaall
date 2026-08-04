'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function getReferralData() {
  const session = await verifySession();
  if (!session) throw new Error('Não autenticado');

  // 1. Busca o usuário
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      referralCode: true,
      referredById: true,
    }
  });

  if (!user) throw new Error('Usuário não encontrado');

  // Se o usuário não tiver referralCode, gera um novo código de indicação único
  let finalReferralCode = user.referralCode;
  if (!finalReferralCode) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    finalReferralCode = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const codeExists = await prisma.user.findUnique({ where: { referralCode: finalReferralCode } });
      if (!codeExists) break;
      finalReferralCode = generateCode();
      attempts++;
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { referralCode: finalReferralCode }
    });
  }

  // 2. Conta quantos usuários foram indicados por este afiliado
  const referralsCount = await prisma.user.count({
    where: { referredById: session.userId }
  });

  // 3. Busca todas as transações de indicações (comissões recebidas)
  const transactions = await prisma.referralTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Calcula o total acumulado
  const totalGanhos = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 5. Mapeia e mascara os emails dos usuários indicados que geraram comissões por privacidade
  const mappedTransactions = await Promise.all(
    transactions.map(async (t) => {
      const fromUser = await prisma.user.findUnique({
        where: { id: t.fromUserId },
        select: { email: true }
      });
      
      let maskedEmail = 'usuário***@exemplo.com';
      if (fromUser?.email) {
        const parts = fromUser.email.split('@');
        const username = parts[0];
        const domain = parts[1];
        if (username.length > 3) {
          maskedEmail = username.substring(0, 3) + '***@' + domain;
        } else {
          maskedEmail = '***@' + domain;
        }
      }

      return {
        id: t.id,
        fromUserEmail: maskedEmail,
        amount: t.amount,
        createdAt: t.createdAt
      };
    })
  );

  return {
    referralCode: finalReferralCode,
    referralsCount,
    totalGanhos,
    transactions: mappedTransactions
  };
}
