'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const PUSHINPAY_TOKEN = process.env.PUSHINPAY_TOKEN;
const WEBHOOK_TOKEN = process.env.PUSHINPAY_WEBHOOK_TOKEN;
const PAYER_DOCUMENT = process.env.PIX_PAYER_DOCUMENT; // CPF configurado no env

export async function gerarPixRecarga(amount: number) {
  const session = await verifySession();

  if (!session) {
    return { error: 'Usuário não autenticado.' };
  }

  if (amount < 0.50) {
    return { error: 'O valor mínimo para recarga é R$ 0,50.' };
  }

  try {
    // 1. Criar transação PENDING no nosso banco
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        amount: amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: `Recarga de Saldo - Pix`,
      }
    });

    // 2. Chamar API da PushinPay
    // Base URL: https://api.pushinpay.com.br/api
    // Valor deve ser em centavos (integer)
    const amountInCents = Math.round(amount * 100);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/webhooks/pushinpay?token=${WEBHOOK_TOKEN}`;

    console.log('📡 Chamando PushinPay...', { amountInCents, webhookUrl });
    
    const response = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        value: amountInCents,
        webhook_url: webhookUrl,
      }),
    });

    const data = await response.json();
    console.log('📥 Resposta PushinPay:', { status: response.status, data });

    if (!response.ok || !data.id) {
      console.error('❌ Erro API PushinPay:', data);
      return { error: data.message || 'Falha ao gerar Pix. Verifique os logs do servidor.' };
    }

    // 3. Vincular o ID da PushinPay à nossa transação
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { externalId: data.id }
    });

    return {
      success: true,
      pixId: data.id,
      qrCode: data.qr_code,
      qrCodeBase64: data.qr_code_base64,
      amount: amount
    };

  } catch (error: any) {
    console.error('Erro ao gerar Pix:', error);
    return { error: 'Erro interno ao processar pagamento.' };
  }
}

/**
 * Consulta o status de uma transação específica (Polling ou manual)
 */
export async function checkTransactionStatus(externalId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { externalId },
      select: { status: true }
    });
    return { status: transaction?.status || 'NOT_FOUND' };
  } catch (error) {
    return { error: 'Erro ao consultar status.' };
  }
}
