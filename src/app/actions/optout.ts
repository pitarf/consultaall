'use server';

import { prisma } from '@/lib/prisma';
import { validarChave } from '@/lib/validators';

interface OptOutInput {
  name: string;
  cpf: string;
  email: string;
  reason: string;
}

/**
 * Server Action para registrar a solicitação de Opt-out (LGPD) no banco de dados.
 * Valida os dados de entrada e grava um log estruturado na tabela SystemLog.
 */
export async function registrarOptOut(data: OptOutInput) {
  const { name, cpf, email, reason } = data;

  if (!name.trim() || !cpf.trim() || !email.trim()) {
    return { error: 'Por favor, preencha todos os campos obrigatórios.' };
  }

  // Validação simplificada de CPF usando o validador interno
  const cleanCpf = cpf.replace(/\D/g, '');
  const validation = validarChave('cpf', cleanCpf);
  if (!validation.valid) {
    return { error: 'O CPF informado é inválido.' };
  }

  try {
    // Gravamos a solicitação de forma funcional na tabela SystemLog.
    // Assim, o administrador visualiza as solicitações de exclusão diretamente na área de Logs do Painel Admin.
    await prisma.systemLog.create({
      data: {
        level: 'WARNING',
        message: `Solicitação de Opt-out LGPD: Bloqueio do CPF ${cpf} solicitado por ${name}`,
        context: {
          solicitante: name,
          cpf_solicitado: cpf,
          email_contato: email,
          motivo_exclusao: reason || 'Não informado',
          data_solicitacao: new Date().toISOString()
        }
      }
    });

    return { success: true, message: 'Sua solicitação de bloqueio foi registrada com sucesso e será processada em até 48 horas.' };
  } catch (error: any) {
    console.error('Erro ao registrar opt-out:', error);
    return { error: 'Houve uma instabilidade no servidor. Tente novamente mais tarde.' };
  }
}
