/**
 * SERVIÇO DE INTEGRAÇÃO - DIRECT DATA
 * Implementa V2 (Advanced Search) e V3 (Pessoa Física Plus)
 */

import axios from 'axios';
import https from 'https';

const BASE_URL = process.env.DIRECT_DATA_BASE_URL || 'https://api.directd.com.br';
const V3_URL = process.env.DIRECT_DATA_V3_URL || 'https://apiv3.directd.com.br';
const TOKEN = process.env.DIRECT_DATA_TOKEN;

// Agente para ignorar erros de SSL na V2 (devido a erro de principal no certificado deles)
const axiosV2 = axios.create({
  baseURL: 'https://api.directd.com.br',
  headers: { 
    'Content-Type': 'application/json',
    'Token': TOKEN,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Agente para ignorar erros de SSL na V3 (para compatibilidade completa de certificados em containers)
const axiosV3 = axios.create({
  baseURL: V3_URL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// -----------------------------------------------------------------------------
// SEÇÃO: CONSULTA VEICULAR (V3)
// -----------------------------------------------------------------------------

export async function consultaVeicular(placa: string, selectedModules: string[] = []) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const url = `${V3_URL}/api/ConsultaVeicular?TOKEN=${TOKEN}&PLACA=${cleanPlaca}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    if (!res.retorno || res.metaDados?.resultadoId !== 1) {
      return { 
        success: false, 
        message: res.metaDados?.mensagem || 'Veículo não encontrado ou erro na consulta.' 
      };
    }

    const v = res.retorno.veiculo;
    const data: Record<string, any> = {};
    
    // Módulo: Proprietário Atual
    if (selectedModules.includes('veiculo_proprietario')) {
      data['Proprietário_Atual'] = {
        nome: res.retorno.proprietario,
        documento: res.retorno.documento,
      };
    }

    // Módulo: Dados Básicos e Técnicos
    if (selectedModules.includes('veiculo_basico')) {
      data['Dados_do_Veiculo'] = {
        placa: v.placa,
        renavam: v.renavam,
        chassi: v.chassi,
        marca_modelo: `${v.marca} / ${v.modelo}`,
        ano_fabricacao: v.anoFabricacao,
        ano_modelo: v.anoModelo,
        cor: v.cor,
        combustivel: v.combustivel,
      };
      data['Detalhes_Tecnicos'] = {
        potencia: `${v.potencia} cv`,
        cilindrada: v.cilindrada,
        capacidade_passageiros: v.capacidadedePassageiros,
        peso_bruto_total: v.pesoBrutoTotal,
        tipo_veiculo: v.tipo,
        especie: v.especie,
        tipo_carroceria: v.tipoCarroceria,
        categoria: v.categoria,
      };
    }

    // Módulo: Situação e Documentação
    if (selectedModules.includes('veiculo_documentacao')) {
      data['Documentacao_e_Situacao'] = {
        municipio: `${v.municipio} - ${v.uf}`,
        situacao: v.situacaoVeiculo,
        procedencia: v.procedenciaVeiculo,
        emissao_crlv: v.dataEmissaoCrlv,
        emissao_crv: v.dataEmissaoCrv,
        ano_exercicio: res.retorno.anoExercicio,
      };
    }

    // Módulo: Restrições, Leilão e Histórico
    if (selectedModules.includes('veiculo_restricoes')) {
      data['Restricoes_e_Alertas'] = {
        lista_restricoes: Array.isArray(v.restricoes) ? v.restricoes : ['Nenhuma restrição encontrada'],
        roubo_furto: v.indicadores?.rouboFurto ? '⚠️ SIM' : 'Nada consta',
        leilao: v.indicadores?.leilao ? '⚠️ SIM' : 'Nada consta',
        comunicado_venda: v.indicadores?.comunicadoVenda ? 'Sim' : 'Não',
        recall: v.indicadores?.recall ? 'Sim' : 'Não',
        renajud: v.indicadores?.renajud ? 'Sim' : 'Não',
      };
    }

    // Fallback: se nenhum módulo for selecionado (teoricamente não deveria acontecer)
    if (Object.keys(data).length === 0) {
      data['Aviso'] = 'Nenhum dado selecionado para exibição.';
    }

    return { success: true, data };
  } catch (error: any) {
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: apiMessage };
  }
}
// SEÇÃO: PESQUISA AVANÇADA (V3) - NOME, TELEFONE, EMAIL (SÍNCRONO)
// -----------------------------------------------------------------------------

export async function performSmartSearch(type: 'email' | 'phone' | 'name', query: string, selectedModules: string[] = [], state?: string) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  let url = '';
  const cleanQuery = query.trim();

  try {
    if (type === 'name' || type === 'nome' as any) {
      // Fluxo V2: Pesquisa Avançada (Filtro -> Processamento -> Polling)
      const filterRes = await filterNaturalPerson({ fullName: cleanQuery, state });
      if (!filterRes.success || !filterRes.listFilters || filterRes.listFilters.length === 0) {
        const errorMsg = filterRes.error?.message || filterRes.metaDados?.mensagem || 'Nenhum registro encontrado.';
        return { success: false, message: errorMsg };
      }

      const bestMatch = pickBestCandidate(filterRes.listFilters);
      if (!bestMatch) {
        return { success: false, message: 'Nenhum candidato válido identificado.' };
      }

      const procRes = await processingIds([bestMatch.id], `Busca por Nome: ${cleanQuery}`);
      if (!procRes.success || !procRes.searchUid) {
        const errorMsg = procRes.error?.message || procRes.metaDados?.mensagem || 'Falha ao iniciar processamento do candidato.';
        return { success: false, message: errorMsg };
      }

      const searchUid = procRes.searchUid;

      // Polling rápido para obter o resultado em estado terminal (10 tentativas, 2s de intervalo)
      let attempts = 0;
      while (attempts < 10) {
        attempts++;
        await new Promise(r => setTimeout(r, 2000));
        
        const viewRes = await viewSearch(searchUid);
        if (viewRes.success && viewRes.viewSearch) {
          const item = viewRes.viewSearch.searchItems?.[0];
          if (item && [4, 5, 6, 7].includes(item.resultId)) {
            if (item.resultId === 6) {
              return { success: false, message: item.result || 'Falha no processamento da consulta de nome.' };
            }
            return {
              success: true,
              data: transformDirectDataAdvanced(item.returnJson || {}, selectedModules),
              message: item.result || 'Consulta realizada com sucesso.'
            };
          }
        }
      }

      return { success: false, message: 'O processamento levou mais tempo que o esperado. Tente novamente.' };
    }

    // Busca síncrona V3 para celular e e-mail (mais econômica e rápida)
    if (type === 'email') {
      url = `${V3_URL}/api/EnriquecimentoLead?TOKEN=${TOKEN}&EMAIL=${encodeURIComponent(cleanQuery)}`;
    } else if (type === 'phone' || type === 'telefone' as any) {
      const phone = cleanQuery.replace(/\D/g, '');
      url = `${V3_URL}/api/EnriquecimentoLead?TOKEN=${TOKEN}&CELULAR=${phone}`;
    }

    const response = await axiosV3.get(url);
    const res = response.data;

    if (!res.retorno || (Array.isArray(res.retorno) && res.retorno.length === 0)) {
      return { success: false, message: res.metaDados?.mensagem || 'Nenhum registro encontrado.' };
    }

    const rawData = Array.isArray(res.retorno) ? res.retorno[0] : res.retorno;
    
    return {
      success: true,
      data: transformDirectDataPlus(rawData, selectedModules),
      message: 'Consulta realizada com sucesso.'
    };

  } catch (error: any) {
    console.error('Erro na SmartSearch:', error.response?.data || error.message);
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    
    if (apiMessage && (apiMessage.includes('ECONNRESET') || apiMessage.includes('connreset') || apiMessage.includes('reset') || apiMessage.includes('socket hang up'))) {
      return {
        success: false,
        message: 'A API de busca por Nome (DirectData V2) está temporariamente indisponível ou recusou a conexão (ECONNRESET). Por favor, tente realizar a busca utilizando diretamente o CPF.'
      };
    }
    
    return { success: false, message: apiMessage || 'Erro na comunicação com a API.' };
  }
}

// -----------------------------------------------------------------------------
// SEÇÃO: PESSOA FÍSICA PLUS (V3) - CPF
// -----------------------------------------------------------------------------

export async function consultaCpfPlus(cpf: string, selectedModules: string[] = []) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCpf = cpf.replace(/\D/g, '');
  const url = `${V3_URL}/api/CadastroPessoaFisicaPlus?TOKEN=${TOKEN}&CPF=${cleanCpf}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    if (res.retorno) {
      return { success: true, data: transformDirectDataPlus(res.retorno, selectedModules) };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
  } catch (error: any) {
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: apiMessage };
  }
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
      lista: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => {
        const info = [
          t.operadora,
          t.whatsApp ? 'WhatsApp' : null,
          t.tipoTelefone,
          t.telemarketingBloqueado ? 'Telemarketing Bloqueado' : null
        ].filter(Boolean).join(' - ');
        return `${t.telefoneComDDD} (${info})`;
      }) : []
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

// -----------------------------------------------------------------------------
// SEÇÃO: PESQUISA AVANÇADA (V2) - AUXILIARES E PARSER
// -----------------------------------------------------------------------------

export async function filterNaturalPerson(filters: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
}) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  try {
    const payload = {
      fullName: filters.fullName || "",
      motherName: "",
      postalCode: "",
      street: "",
      city: filters.city || "",
      state: filters.state || "",
      number: "",
      neighborhood: "",
      email: filters.email || "",
      phoneNumber: filters.phoneNumber || "",
      dateOfBirthStart: "",
      dateOfBirthEnd: "",
      receiveAuxilioEmergencial: null,
      receiveAuxilioReconstrucao: null,
      receiveBolsaFamilia: null,
      receiveBPC: null,
      receiveGarantiaSafra: null,
      receiveSeguroDefeso: null
    };

    const response = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Token': TOKEN,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DirectData API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("FilterNaturalPerson falhou:", error);
    // Preserva a mensagem de ECONNRESET ou repassa o erro da API
    throw new Error(error.message || 'Erro desconhecido ao conectar com DirectData');
  }
}

export async function processingIds(listIds: string[], searchName: string = 'Consulta ALL') {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  try {
    const response = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/ProcessingIds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Token': TOKEN,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ listIds, searchName })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DirectData API Error ${response.status}: ${errText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Erro desconhecido em ProcessingIds');
  }
}

export async function viewSearch(searchUid: string) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  try {
    const response = await fetch('https://api.app.directd.com.br/api/AdvancedSearch/ViewSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Token': TOKEN,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ searchUid })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DirectData API Error ${response.status}: ${errText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Erro desconhecido em ViewSearch');
  }
}

function pickBestCandidate(candidates: any[]) {
  if (!candidates || candidates.length === 0) return null;
  // Tenta encontrar um com nome da mãe e data de nascimento (mais completo)
  const complete = candidates.find(c => c.motherName && c.dateOfBirth);
  if (complete) return complete;
  return candidates[0];
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
      lista: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => {
        return `${t.ddd || ''}${t.numero || ''} (${t.tipo || 'N/I'})`;
      }) : []
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

  if (selectedModules.includes('parentes')) {
    result['Vinculos_Familiares'] = {
      lista: Array.isArray(raw.parentes) ? raw.parentes.map((p: any) => `${p.nome} (${p.vinculo || 'Parente'})`) : []
    };
  }

  return result;
}

// -----------------------------------------------------------------------------
// SEÇÃO: PESSOA JURÍDICA PLUS (V3) - CNPJ
// -----------------------------------------------------------------------------

export async function consultaCnpjPlus(cnpj: string, selectedModules: string[] = []) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const url = `${V3_URL}/api/CadastroPessoaJuridicaPlus?TOKEN=${TOKEN}&CNPJ=${cleanCnpj}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    // Se a requisição async estiver em processamento
    if (response.status === 201 || response.status === 202) {
      return { success: false, message: 'Consulta iniciada, tente novamente em alguns segundos.' };
    }

    if (res.retorno) {
      return { success: true, data: transformDirectDataCnpj(res.retorno, selectedModules) };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.metaDados?.mensagem || error.message };
  }
}

function transformDirectDataCnpj(raw: any, selectedModules: string[]) {
  const result: any = {};
  
  if (selectedModules.includes('cnpj_basico')) {
    result['Dados_Basicos'] = {
      cnpj: raw.cnpj,
      razao_social: raw.razaoSocial,
      nome_fantasia: raw.nomeFantasia,
      data_fundacao: raw.dataFundacao,
      matriz: raw.matriz ? 'Sim' : 'Não',
      porte: raw.porte,
      situacao_cadastral: raw.situacaoCadastral,
      situacao_especial: raw.situacaoEspecial,
      orgao_publico: raw.orgaoPublico || 'Não',
      ultima_atualizacao: raw.ultimaAtualizacaoPJ
    };
    result['Natureza_e_Atividades'] = {
      natureza_juridica: `${raw.naturezaJuridicaCodigo || ''} - ${raw.naturezaJuridicaDescricao || ''}`,
      tipo_natureza_juridica: raw.naturezaJuridicaTipo,
      tipo_empresa: raw.tipoEmpresa,
      ramo: raw.ramo,
      cnae_principal: `${raw.cnaeCodigo || ''} - ${raw.cnaeDescricao || ''}`,
      cnaes_secundarios: Array.isArray(raw.cnaEsSecundarios) ? raw.cnaEsSecundarios.map((c: any) => `${c.cnaeCodigoSecundario} - ${c.cnaeDescricaoSecundario}`) : []
    };
  }

  if (selectedModules.includes('cnpj_contato')) {
    result['Contato_e_Localizacao'] = {
      enderecos: Array.isArray(raw.enderecos) ? raw.enderecos.map((end: any) => ({
        logradouro: end.logradouro,
        numero: end.numero,
        complemento: end.complemento,
        bairro: end.bairro,
        cidade: end.cidade,
        uf: end.uf,
        cep: end.cep
      })) : [],
      telefones: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => `${t.telefoneComDDD} (${t.operadora || ''}${t.whatsApp ? ' - Whats' : ''}${t.tipoTelefone ? ` - ${t.tipoTelefone}` : ''})`) : [],
      emails: Array.isArray(raw.emails) ? raw.emails.map((e: any) => e.enderecoEmail) : []
    };
  }
    
  if (selectedModules.includes('cnpj_filiais')) {
    if (raw.quantidadeFiliais && parseInt(raw.quantidadeFiliais) > 0) {
      result['Filiais'] = {
        quantidade: raw.quantidadeFiliais,
        lista_filiais: Array.isArray(raw.filiais) ? raw.filiais.map((f: any) => ({
          cnpj: f.cnpj,
          razao_social: f.razaoSocial,
          uf: f.uf
        })) : []
      };
    } else {
      result['Filiais'] = {
        quantidade: 0,
        aviso: "Não possui filiais."
      };
    }
  }
    
  if (selectedModules.includes('cnpj_socios')) {
    result['Socios'] = {
      lista: Array.isArray(raw.socios) ? raw.socios.map((s: any) => ({
        nome: s.nome,
        documento: s.documento,
        cargo: s.cargo,
        participacao: s.percentualParticipacao,
        data_entrada: s.dataEntrada
      })) : []
    };
  }
    
  if (selectedModules.includes('cnpj_faturamento')) {
    result['Faturamento'] = {
      faixa_faturamento: raw.faixaFaturamento,
      faturamento_medio_cnae: raw.faturamentoMedioCNAE,
      faturamento_presumido: raw.faturamentoPresumido,
      tributacao: raw.tributacao,
      opcao_simples: raw.opcaoSimples,
      opcao_mei: raw.opcaoMEI
    };
    
    result['Funcionarios'] = {
      quantidade: raw.quantidadeFuncionarios,
      faixa: raw.faixaFuncionarios
    };
  }

  return result;
}
