import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlToken = searchParams.get("token");
    
    // 1. Validar Token de Segurança (Vem do .env)
    const WEBHOOK_TOKEN = process.env.PUSHINPAY_WEBHOOK_TOKEN;
    
    if (!urlToken || urlToken !== WEBHOOK_TOKEN) {
      console.warn(`⚠️ Webhook PushinPay: Tentativa de acesso com token inválido: ${urlToken}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ler Body (PushinPay envia como JSON)
    const body = await req.json();
    console.log("📦 PushinPay Webhook Body:", JSON.stringify(body, null, 2));

    const { id, status, value } = body; // status: "paid", "created", "canceled"
    
    // Só processamos se o status for "paid"
    if (status === "paid") {
      console.log(`🔍 Processando pagamento aprovado: ${id} | Valor: R$ ${value / 100}`);

      // 3. Transação Atômica: Atualiza Transação e Saldo do Usuário
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Busca a transação pendente pelo ID da PushinPay (externalId)
          const transaction = await tx.transaction.findUnique({
            where: { externalId: id },
            include: { user: true }
          });

          if (!transaction) {
            console.error(`❌ Transação ${id} não encontrada no banco.`);
            return { error: "Transaction not found" };
          }

          if (transaction.status === "COMPLETED") {
            console.log(`ℹ️ Transação ${id} já estava processada.`);
            return { alreadyProcessed: true };
          }

          // Atualiza a transação para COMPLETED
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { status: "COMPLETED" }
          });

          // Incrementa o saldo do usuário
          // SEGURANÇA: Validamos se o valor pago é o mesmo que o valor registrado no banco
          const amountInReais = value / 100;
          
          if (Math.abs(amountInReais - transaction.amount) > 0.01) {
            console.error(`🚨 ALERTA DE FRAUDE: Divergência de valores na transação ${id}. Pago: ${amountInReais} | Esperado: ${transaction.amount}`);
            await tx.systemLog.create({
              data: {
                level: "ERROR",
                message: `TENTATIVA DE FRAUDE DETECTADA: Divergência de valores no Webhook. ID: ${id}`,
                context: { paid: amountInReais, expected: transaction.amount, userId: transaction.userId }
              }
            });
            return { error: "Value mismatch" };
          }

          await tx.user.update({
            where: { id: transaction.userId },
            data: { 
              balance: { increment: transaction.amount } // Usamos o valor do BANCO por segurança
            }
          });

          // Registra no Log do Sistema
          await tx.systemLog.create({
            data: {
              level: "INFO",
              message: `Recarga via Pix confirmada: R$ ${amountInReais.toFixed(2)}`,
              context: { 
                userId: transaction.userId, 
                transactionId: transaction.id,
                pushinpayId: id 
              }
            }
          });

          return { success: true };
        });

        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 404 });
        }
      } catch (err: any) {
        console.error("❌ Erro ao processar transação no banco:", err.message);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    } else {
      console.log(`ℹ️ PushinPay Webhook: Ignorando status ${status} para a transação ${id}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("🚨 CRITICAL PUSHINPAY WEBHOOK ERROR:", error.message || error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
