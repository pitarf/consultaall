import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint de Webhook para processamento de notificações de pagamento da PushinPay (Pix).
 * Este endpoint recebe requisições POST contendo o status do Pix e atualiza o saldo do usuário de forma atômica.
 * 
 * @param req Objeto de requisição HTTP do Next.js
 * @returns Resposta JSON com status da operação
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlToken = searchParams.get("token");
    const txId = searchParams.get("txId");
    const headerToken = req.headers.get("x-pushinpay-token") || req.headers.get("x-pushin-pay-token");
    
    // Suporta tanto o token via query parameter (?token=...) quanto via header de segurança
    const token = urlToken || headerToken;
    
    // 1. Validar Token de Segurança (Configurado no Banco ou .env com fallback)
    const settings = await prisma.systemSetting.findFirst();
    const WEBHOOK_TOKEN = settings?.pushinpayWebhookToken?.trim() || process.env.PUSHINPAY_WEBHOOK_TOKEN;
    
    if (!token || token !== WEBHOOK_TOKEN) {
      console.warn(`⚠️ Webhook PushinPay: Tentativa de acesso não autorizada. Token URL: ${urlToken} | Token Header: ${headerToken}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parser de Body Flexível (Lida de forma resiliente com JSON e URL-Encoded)
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    try {
      const rawBody = await req.text();
      console.log("📦 PushinPay Webhook Raw Body:", rawBody);
      
      if (contentType.includes("application/json")) {
        body = JSON.parse(rawBody);
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const params = new URLSearchParams(rawBody);
        body = Object.fromEntries(params.entries());
      } else {
        // Tenta parsear como JSON por padrão caso o content-type esteja ausente ou genérico
        try {
          body = JSON.parse(rawBody);
        } catch {
          console.warn("⚠️ Webhook PushinPay: Formato de payload desconhecido e não-JSON.");
        }
      }
    } catch (parseError: any) {
      console.error("❌ Webhook PushinPay: Falha crítica ao processar body da requisição:", parseError.message);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 3. Extração Inteligente dos Dados da Transação
    // O ID da transação Pix retornado na criação (CashIn) vem na chave "id",
    // mas no webhook o ID real do Pix vem na chave "transaction_id" enquanto o "id" é o ID da tentativa do webhook.
    const transactionId = body.transaction_id || body.id;
    const status = body.status;
    const value = body.value ? Number(body.value) : undefined; // valor em centavos

    console.log(`📡 Dados extraídos: Transação ID (externalId): ${transactionId} | txId URL: ${txId} | Status: ${status} | Valor: ${value}`);

    // Evita exceção do Prisma validando a ausência do ID antes da busca
    if (!transactionId && !txId) {
      console.warn("⚠️ Webhook PushinPay: transaction_id/id e txId ausentes no payload e URL.");
      return NextResponse.json({ error: "Transaction ID is missing" }, { status: 400 });
    }

    // Só processamos se o status for "paid" ou "approved"
    if (status === "paid" || status === "approved") {
      if (value === undefined) {
        console.error(`❌ Webhook PushinPay: Valor de pagamento ausente para transação ${transactionId || txId}`);
        return NextResponse.json({ error: "Payment value is missing" }, { status: 400 });
      }

      const amountInReais = value / 100;
      console.log(`🔍 Processando Pix confirmado: ${transactionId || txId} | Valor Convertido: R$ ${amountInReais.toFixed(2)}`);

      // 4. Execução da Transação Atômica no Banco de Dados
      try {
        const result = await prisma.$transaction(async (tx) => {
          let transaction = null;

          // 4.1 Busca prioritariamente pelo ID interno (txId) enviado na URL do webhook
          if (txId) {
            transaction = await tx.transaction.findUnique({
              where: { id: txId },
              include: { user: true }
            });
          }

          // 4.2 Fallback: Busca pela transação pendente pelo ID da PushinPay (externalId)
          if (!transaction && transactionId) {
            transaction = await tx.transaction.findUnique({
              where: { externalId: transactionId },
              include: { user: true }
            });
          }

          if (!transaction) {
            console.error(`❌ Webhook PushinPay: Transação (txId: ${txId} / externalId: ${transactionId}) não encontrada no banco.`);
            return { error: "Transaction not found" };
          }

          if (transaction.status === "COMPLETED") {
            console.log(`ℹ️ Webhook PushinPay: Transação ${transaction.id} já estava processada.`);
            return { alreadyProcessed: true };
          }

          // Segurança: Validamos se o valor pago é compatível com o registrado
          if (Math.abs(amountInReais - transaction.amount) > 0.01) {
            console.error(`🚨 Webhook PushinPay: Divergência de valores na transação ${transaction.id}. Pago: ${amountInReais} | Esperado: ${transaction.amount}`);
            
            // Grava log de erro de auditoria financeira no banco
            await tx.systemLog.create({
              data: {
                level: "ERROR",
                message: `Divergência de valores detectada no Webhook: ID Interno ${transaction.id}`,
                context: {
                  paid: amountInReais,
                  expected: transaction.amount,
                  userId: transaction.userId
                }
              }
            });
            
            return { error: "Value mismatch" };
          }

          // Atualiza o status da transação interna para COMPLETED e vincula o externalId da PushinPay se necessário
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { 
              status: "COMPLETED",
              externalId: transaction.externalId || transactionId
            }
          });

          // Incrementa o saldo do usuário (usamos o valor do banco de dados por integridade financeira)
          await tx.user.update({
            where: { id: transaction.userId },
            data: { 
              balance: { increment: transaction.amount }
            }
          });

          // Registra o log de sucesso atômico da recarga
          await tx.systemLog.create({
            data: {
              level: "INFO",
              message: `Recarga Pix automática confirmada: R$ ${transaction.amount.toFixed(2)}`,
              context: { 
                userId: transaction.userId, 
                transactionId: transaction.id,
                pushinpayId: transactionId || "N/A"
              }
            }
          });

          return { success: true };
        });

        if (result.error) {
          // Retornamos 404/400 explícitos se a transação não foi encontrada ou houve divergência
          const errorStatus = result.error === "Transaction not found" ? 404 : 400;
          return NextResponse.json({ error: result.error }, { status: errorStatus });
        }

        // Tenta enviar notificação push de forma assíncrona (não deve bloquear o webhook)
        if (result.success && amountInReais > 0) {
          (async () => {
            try {
              const webpush = require('web-push');
              
              if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
                console.warn('⚠️ Web Push: VAPID keys not configured in environment.');
                return;
              }

              webpush.setVapidDetails(
                process.env.VAPID_SUBJECT || 'mailto:contato@detetivebuscas.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
              );

              const subscriptions = await prisma.adminPushSubscription.findMany();
              
              const payload = JSON.stringify({
                title: 'Venda realizada',
                body: `Você fez uma venda de R$${amountInReais.toFixed(2).replace('.', ',')}`,
                url: '/admin'
              });

              for (const sub of subscriptions) {
                try {
                  await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                  }, payload);
                } catch (subErr: any) {
                  // Se a inscrição expirou (410 Gone), removemos do banco
                  if (subErr.statusCode === 410 || subErr.statusCode === 404) {
                    await prisma.adminPushSubscription.delete({ where: { id: sub.id } });
                  } else {
                    console.error('⚠️ Web Push: Error sending to subscription', sub.id, subErr.message);
                  }
                }
              }
            } catch (pushErr) {
              console.error('🚨 Web Push: Falha geral ao enviar notificação:', pushErr);
            }
          })();
        }

      } catch (dbError: any) {
        console.error("❌ Webhook PushinPay: Falha crítica na transação do banco:", dbError.message);
        return NextResponse.json({ error: "Database transaction failed" }, { status: 500 });
      }
    } else {
      console.log(`ℹ️ Webhook PushinPay: Ignorando evento com status ${status} para transação ${transactionId || txId}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (err: any) {
    console.error("🚨 CRITICAL PUSHINPAY WEBHOOK ERROR:", err.message || err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: err.message }, 
      { status: 500 }
    );
  }
}
