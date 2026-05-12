import sampleResponse from './api-sample-response.json';

export interface ConsultaParams {
  target: string;
  pacote: string;
  query: string;
  isTest?: boolean;
}

export async function fazerConsultaAPI(params: ConsultaParams) {
  const token = process.env.API_CONSULTA_TOKEN;

  if (!token) {
    throw new Error('Token da API não configurado.');
  }

  // Se NÃO for teste, chama a API Real
  if (!params.isTest) {
    const response = await fetch('https://services.apiconsultabrasil.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
