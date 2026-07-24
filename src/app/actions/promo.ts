'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Salva o WhatsApp do usuário (Lead) e marca que ele viu o popup de promoção.
 */
export async function savePromoWhatsapp(whatsapp: string) {
  const session = await verifySession();
  if (!session) return { error: 'Sessão expirada.' };

  const cleanedWhatsapp = whatsapp.replace(/\D/g, '');
  if (cleanedWhatsapp.length < 10 || cleanedWhatsapp.length > 11) {
    return { error: 'Número de WhatsApp inválido.' };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        whatsapp: cleanedWhatsapp,
        hasSeenPromoPopup: true,
      },
    });

    // Registra no Log do Sistema para fins de auditoria
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: `Lead de WhatsApp captado: ${cleanedWhatsapp}`,
        context: { userId: session.userId }
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar whatsapp:', error);
    return { error: 'Erro interno ao salvar dados. Tente novamente.' };
  }
}

/**
 * Apenas marca que o usuário viu o popup para que ele não apareça novamente (fechou sem preencher).
 */
export async function dismissPromoPopup() {
  const session = await verifySession();
  if (!session) return { error: 'Sessão expirada.' };

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        hasSeenPromoPopup: true,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao fechar popup:', error);
    return { error: 'Erro ao registrar ação.' };
  }
}
