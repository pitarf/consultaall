/**
 * SERVIÇO DE INTEGRAÇÃO - DIRECT DATA (PESQUISA AVANÇADA)
 * Implementa o fluxo de duas etapas: Filtro (Gratuito) e Processamento (Pago).
 * Manual Versão 2.0
 */

const BASE_URL = process.env.DIRECT_DATA_BASE_URL || 'https://api.directd.com.br';
const TOKEN = process.env.DIRECT_DATA_TOKEN;

interface DirectDataResponse<T> {
  success: boolean;
  status: string;
  elapsedTimeMs: number;
  dateTimeExecution: string;
  error: { fieldName: string | null; message: string } | null;
  data?: T; // Payload específico
}

/**
 * Endpoint: /api/AdvancedSearch/FilterNaturalPerson
 * Realiza a busca filtrada de Pessoas Físicas (Gratuito).
 */
export async function filterNaturalPerson(filters: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
}) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');

  const response = await fetch(`${BASE_URL}/api/AdvancedSearch/FilterNaturalPerson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': TOKEN,
    },
    body: JSON.stringify(filters),
  });

  const data = await response.json();
  return data;
}

/**
 * Endpoint: /api/AdvancedSearch/ProcessingIds
 * Dispara o processamento (enriquecimento) dos IDs selecionados (Consome Saldo).
 */
export async function processingIds(listIds: string[], searchName: string = 'Consulta ALL') {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');

  const response = await fetch(`${BASE_URL}/api/AdvancedSearch/ProcessingIds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': TOKEN,
    },
    body: JSON.stringify({ listIds, searchName }),
  });

  const data = await response.json();
  return data;
}

/**
 * Endpoint: /api/AdvancedSearch/ViewSearch
 * Consulta o resultado do processamento.
 */
export async function viewSearch(searchUid: string) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');

  const response = await fetch(`${BASE_URL}/api/AdvancedSearch/ViewSearch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': TOKEN,
    },
    body: JSON.stringify({ searchUid }),
  });

  const data = await response.json();
  return data;
}

/**
 * Lógica de Smart Selection (Heurística)
 * Escolhe o melhor candidato da lista de filtros.
 */
function pickBestCandidate(candidates: any[]) {
  if (!candidates || candidates.length === 0) return null;
  
  // 1. Tenta encontrar um com nome da mãe e data de nascimento (mais completo)
  const complete = candidates.find(c => c.motherName && c.dateOfBirth);
  if (complete) return complete;

  // 2. Fallback: Primeiro da lista (relevância da API)
  return candidates[0];
}

/**
 * Tradutor de Dados: Mapeia o JSON da DirectData para os blocos da UI
 */
function transformDirectData(raw: any, selectedModules: string[]) {
  const result: any = {};

  if (selectedModules.includes('dados_basicos') || selectedModules.includes('documentos')) {
    result['Dados_Pessoais'] = {
      nome: raw.nome,
      cpf: raw.cpf,
      rg: raw.rg,
      data_nascimento: raw.nascimento,
      sexo: raw.sexo,
      nome_mae: raw.mae,
      nome_pai: raw.pai,
      estado_civil: raw.estado_civil,
      signo: raw.signo
    };
  }

  if (selectedModules.includes('telefones')) {
    result['Telefones'] = {
      lista: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => `${t.ddd}${t.numero} (${t.tipo || 'N/I'})`) : []
    };
  }

  if (selectedModules.includes('emails')) {
    result['Emails'] = {
      lista: Array.isArray(raw.emails) ? raw.emails.map((e: any) => e.email || e) : []
    };
  }

  if (selectedModules.includes('enderecos')) {
    result['Localizacao'] = {
      enderecos: Array.isArray(raw.enderecos) ? raw.enderecos.map((end: any) => ({
        logradouro: end.logradouro,
        numero: end.numero,
        bairro: end.bairro,
        cidade: end.cidade,
        uf: end.uf,
        cep: end.cep
      })) : []
    };
  }

  if (selectedModules.includes('parentes') || selectedModules.includes('vizinhos')) {
    result['Vinculos'] = {
      parentes: Array.isArray(raw.parentes) ? raw.parentes.map((p: any) => `${p.nome} (${p.vinculo})`) : [],
      vizinhos: Array.isArray(raw.vizinhos) ? raw.vizinhos.map((v: any) => v.nome) : []
    };
  }

  if (selectedModules.includes('socio_empresa')) {
    result['Participacoes_Societarias'] = {
      empresas: Array.isArray(raw.sociedades) ? raw.sociedades.map((s: any) => `${s.razao_social} - CNPJ: ${s.cnpj}`) : []
    };
  }

  return result;
}

/**
 * SMART SEARCH - Fluxo Automatizado
 */
export async function performSmartSearch(
  type: 'email' | 'phone' | 'name', 
  query: string, 
  selectedModules: string[] = [],
  state?: string
) {
  try {
    // 1. FILTRAR
    const filterParams: any = {};
    if (type === 'email') filterParams.email = query;
    if (type === 'phone') filterParams.phoneNumber = query.replace(/\D/g, '');
    if (type === 'name') filterParams.fullName = query;
    if (state) filterParams.state = state;

    const filterRes = await filterNaturalPerson(filterParams);
    
    if (!filterRes.success || !filterRes.listFilters || filterRes.listFilters.length === 0) {
      return { success: false, message: 'Nenhum registro encontrado para este critério.' };
    }

    // 2. SELECIONAR
    const bestMatch = pickBestCandidate(filterRes.listFilters);
    if (!bestMatch) return { success: false, message: 'Não foi possível identificar um candidato válido.' };

    // 3. PROCESSAR
    const procRes = await processingIds([bestMatch.id], `Busca por ${type}: ${query}`);
    if (!procRes.success || !procRes.searchUid) {
      return { success: false, message: 'Falha ao iniciar o processamento dos dados.' };
    }

    const searchUid = procRes.searchUid;

    // 4. POLLING
    let attempts = 0;
    const maxAttempts = 15; // Aumentado para 30s aprox.
    
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
      
      const viewRes = await viewSearch(searchUid);
      if (viewRes.success && viewRes.viewSearch) {
        const item = viewRes.viewSearch.searchItems?.[0];
        
        if ([4, 5, 6, 7].includes(item.resultId)) {
          // 5. TRANSFORMAR E FILTRAR
          const transformedData = transformDirectData(item.returnJson || {}, selectedModules);

          return {
            success: item.resultId === 4 || item.resultId === 5,
            data: transformedData,
            message: item.result,
            consumption: viewRes.viewSearch.consumptionTotal
          };
        }
      }
    }

    return { success: false, message: 'O processamento está levando mais tempo que o esperado. Verifique o histórico em instantes.' };

  } catch (error: any) {
    console.error('Error in DirectData SmartSearch:', error);
    return { success: false, message: error.message || 'Erro interno na integração com DirectData.' };
  }
}
