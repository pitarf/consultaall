/**
 * Utilitários de Validação de Dados
 */

/**
 * Valida CPF (Algoritmo de dígitos verificadores)
 */
export function validarCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Impede CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let rest;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * Valida Telefone (Formatos brasileiros: 10 ou 11 dígitos)
 */
export function validarTelefone(telefone: string): boolean {
  const cleanTelefone = telefone.replace(/\D/g, '');
  // Aceita (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
}

/**
 * Valida E-mail (Regex padrão)
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validador genérico baseado no tipo de chave
 */
export function validarChave(tipo: string, valor: string): { valid: boolean; message: string } {
  if (!valor) return { valid: false, message: 'O campo não pode estar vazio.' };

  switch (tipo) {
    case 'cpf':
      return validarCPF(valor) 
        ? { valid: true, message: '' } 
        : { valid: false, message: 'CPF inválido. Verifique os números.' };
    
    case 'telefone':
      return validarTelefone(valor)
        ? { valid: true, message: '' }
        : { valid: false, message: 'Telefone inválido. Use DDD + Número.' };

    case 'email':
      return validarEmail(valor)
        ? { valid: true, message: '' }
        : { valid: false, message: 'E-mail inválido. Verifique o formato.' };

    case 'nome':
      return valor.trim().split(' ').length >= 2
        ? { valid: true, message: '' }
        : { valid: false, message: 'Informe o nome completo para uma busca precisa.' };

    default:
      return { valid: true, message: '' };
  }
}
