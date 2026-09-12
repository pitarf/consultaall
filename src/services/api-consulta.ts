import sampleResponse from './api-sample-response.json';
import { prisma } from '@/lib/prisma';

export interface ConsultaParams {
  target: string;
  pacote: string;
  query: string;
  isTest?: boolean;
}

export async function fazerConsultaAPI(params: ConsultaParams) {
  const settings = await prisma.systemSetting.findFirst();
  const token = settings?.apiConsultaToken || process.env.API_CONSULTA_TOKEN;

  if (!token) {
    throw new Error('Token da API não configurado.');
  }

  // Se NÃO for teste, chama a API Real
  if (!params.isTest) {
    try {
      const apiUrl = settings?.apiConsultaUrl || process.env.API_CONSULTA_URL || 'https://services.apiconsultabrasil.com/';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(6000), // Timeout seguro de 6s
        body: JSON.stringify({
          token: token,
          target: params.target, // Ex: 'cpf-detalhada-pessoa-fisica'
          pacote: params.pacote || 'teste',
          query: params.query,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Erro de comunicação com o servidor de consultas.',
          data: data
        };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.name === 'TimeoutError' || err.message?.includes('timeout') 
          ? 'O servidor de consultas demorou para responder. Tente novamente em instantes.' 
          : (err.message || 'Falha de comunicação com o provedor de dados.')
      };
    }
  }

  // MOCK (Se for teste ou se forçado pelo admin):
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return {
    ...sampleResponse,
    success: true,
    metadata: {
      ...sampleResponse.metadata,
      query: params.query 
    }
  };
}
