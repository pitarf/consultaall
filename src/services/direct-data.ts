/**
 * SERVIÇO DE INTEGRAÇÃO - DIRECT DATA
 * Implementa V2 (Advanced Search) e V3 (Pessoa Física Plus)
 */

const BASE_URL = process.env.DIRECT_DATA_BASE_URL || 'https://api.directd.com.br';
const V3_URL = process.env.DIRECT_DATA_V3_URL || 'https://apiv3.directd.com.br';
const TOKEN = process.env.DIRECT_DATA_TOKEN;

// -----------------------------------------------------------------------------
// SEÇÃO: PESQUISA AVANÇADA (V2) - NOME, TELEFONE, EMAIL
// -----------------------------------------------------------------------------

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
    headers: { 'Content-Type': 'application/json', 'Token': TOKEN },
    body: JSON.stringify(filters),
  });
  return await response.json();
}

export async function processingIds(listIds: string[], searchName: string = 'Consulta ALL') {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const response = await fetch(`${BASE_URL}/api/AdvancedSearch/ProcessingIds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Token': TOKEN },
    body: JSON.stringify({ listIds, searchName }),
  });
  return await response.json();
}

export async function viewSearch(searchUid: string) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const response = await fetch(`${BASE_URL}/api/AdvancedSearch/ViewSearch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Token': TOKEN },
    body: JSON.stringify({ searchUid }),
  });
  return await response.json();
}

function pickBestCandidate(candidates: any[]) {
  if (!candidates || candidates.length === 0) return null;
  const complete = candidates.find(c => c.motherName && c.dateOfBirth);
  return complete || candidates[0];
}

function transformDirectDataAdvanced(raw: any, selectedModules: string[]) {
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

export async function performSmartSearch(type: 'email' | 'phone' | 'name', query: string, selectedModules: string[] = [], state?: string) {
  try {
    const filterParams: any = {};
    if (type === 'email') filterParams.email = query;
    if (type === 'phone') filterParams.phoneNumber = query.replace(/\D/g, '');
    if (type === 'name') filterParams.fullName = query;
    if (state) filterParams.state = state;

    const filterRes = await filterNaturalPerson(filterParams);
    if (!filterRes.success || !filterRes.listFilters || filterRes.listFilters.length === 0) {
      return { success: false, message: 'Nenhum registro encontrado.' };
    }

    const bestMatch = pickBestCandidate(filterRes.listFilters);
    if (!bestMatch) return { success: false, message: 'Candidato inválido.' };

    const procRes = await processingIds([bestMatch.id], `Busca por ${type}: ${query}`);
    if (!procRes.success || !procRes.searchUid) return { success: false, message: 'Falha no processamento.' };

    const searchUid = procRes.searchUid;
    let attempts = 0;
    while (attempts < 15) {
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
      const viewRes = await viewSearch(searchUid);
      if (viewRes.success && viewRes.viewSearch) {
        const item = viewRes.viewSearch.searchItems?.[0];
        if ([4, 5, 6, 7].includes(item.resultId)) {
          return {
            success: item.resultId === 4 || item.resultId === 5,
            data: transformDirectDataAdvanced(item.returnJson || {}, selectedModules),
            message: item.result
          };
        }
      }
    }
    return { success: false, message: 'Tempo esgotado.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// -----------------------------------------------------------------------------
// SEÇÃO: PESSOA FÍSICA PLUS (V3) - CPF
// -----------------------------------------------------------------------------

export async function consultaCpfPlus(cpf: string, selectedModules: string[] = []) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCpf = cpf.replace(/\D/g, '');
  const url = `${V3_URL}/api/CadastroPessoaFisicaPlus?TOKEN=${TOKEN}&CPF=${cleanCpf}`;
  const response = await fetch(url, { method: 'GET' });
  const res = await response.json();

  if (response.status === 201 || response.status === 202) {
    const searchUid = res.metaDados?.consultaUid;
    return searchUid ? await pollV3Result(searchUid, selectedModules) : { success: false, message: 'Falha no UID assíncrono.' };
  }

  if (response.status === 200 && res.retorno) {
    return { success: true, data: transformDirectDataPlus(res.retorno, selectedModules) };
  }
  return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
}

async function pollV3Result(uid: string, selectedModules: string[]) {
  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    await new Promise(r => setTimeout(r, 3000));
    const url = `${V3_URL}/api/CadastroPessoaFisicaPlus?TOKEN=${TOKEN}&UID=${uid}`;
    const response = await fetch(url, { method: 'GET' });
    const res = await response.json();
    if (response.status === 200 && res.retorno) {
      return { success: true, data: transformDirectDataPlus(res.retorno, selectedModules) };
    }
    if (response.status !== 202) break;
  }
  return { success: false, message: 'Tempo esgotado para consulta CPF.' };
}

function transformDirectDataPlus(raw: any, selectedModules: string[]) {
  const result: any = {};
  if (selectedModules.includes('dados_basicos') || selectedModules.includes('documentos')) {
    result['Dados_Pessoais'] = {
      nome: raw.nome,
      cpf: raw.cpf,
      sexo: raw.sexo,
      data_nascimento: raw.dataNascimento,
      idade: raw.idade,
      signo: raw.signo,
      nome_mae: raw.nomeMae,
      nome_pai: raw.nomePai,
      situacao_cadastral: raw.situacaoCadastral,
      data_situacao: raw.dataSituacaoCadastral,
      obito: raw.obito
    };
  }
  if (selectedModules.includes('telefones')) {
    result['Telefones'] = {
      lista: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => `${t.telefoneComDDD} (${t.operadora || ''}${t.whatsApp ? ' - Whats' : ''})`) : []
    };
  }
  if (selectedModules.includes('emails')) {
    result['Emails'] = {
      lista: Array.isArray(raw.emails) ? raw.emails.map((e: any) => e.enderecoEmail) : []
    };
  }
  if (selectedModules.includes('enderecos')) {
    result['Localizacao'] = {
      enderecos: Array.isArray(raw.enderecos) ? raw.enderecos.map((end: any) => ({
        logradouro: end.logradouro,
        numero: end.numero,
        complemento: end.complemento,
        bairro: end.bairro,
        cidade: end.cidade,
        uf: end.uf,
        cep: end.cep
      })) : []
    };
  }
  if (selectedModules.includes('parentes')) {
    result['Vinculos_Familiares'] = {
      lista: Array.isArray(raw.parentescos) ? raw.parentescos.map((p: any) => `${p.nome} (${p.grauParentesco})`) : []
    };
  }
  if (selectedModules.includes('poder_aquisitivo') || selectedModules.includes('dados_trabalhistas')) {
    result['Renda_e_Trabalho'] = {
      renda_estimada: raw.rendaEstimada,
      faixa_salarial: raw.rendaFaixaSalarial,
      classe_social: raw.classeSocial,
      ocupacao_cbo: raw.cbo,
      codigo_cbo: raw.codigoCBO
    };
  }
  return result;
}
