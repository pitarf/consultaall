/**
 * SERVIÇO DE INTEGRAÇÃO - DIRECT DATA
 * Implementa V2 (Advanced Search) e V3 (Pessoa Física Plus)
 */

import axios from 'axios';
import https from 'https';
import { prisma } from '@/lib/prisma';

// Helper para buscar as configurações da Direct Data dinamicamente do banco
async function getDirectDataConfig() {
  let token = process.env.DIRECT_DATA_TOKEN;
  let baseUrl = process.env.DIRECT_DATA_BASE_URL || 'https://api.directd.com.br';
  let v3Url = process.env.DIRECT_DATA_V3_URL || 'https://apiv3.directd.com.br';

  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings) {
      if (settings.directDataToken?.trim()) token = settings.directDataToken.trim();
      if (settings.directDataBaseUrl?.trim()) {
        baseUrl = settings.directDataBaseUrl.trim();
        // Corrige typos comuns que podem ter sido salvos no painel
        if (baseUrl.includes('apiv.directd')) baseUrl = baseUrl.replace('apiv.directd', 'api.directd');
        if (baseUrl.includes('apiv3.directd')) baseUrl = baseUrl.replace('apiv3.directd', 'api.directd');
      }
      if (settings.directDataV3Url?.trim()) {
        v3Url = settings.directDataV3Url.trim();
        // Corrige typo comum (apiv ao invés de apiv3)
        if (v3Url.includes('apiv.directd')) v3Url = v3Url.replace('apiv.directd', 'apiv3.directd');
      }
    }
  } catch (err) {
    console.error('Erro ao ler configuracoes do DirectData no banco:', err);
  }

  return { token, baseUrl, v3Url };
}

// Agente para ignorar erros de SSL na V3 (para compatibilidade completa de certificados em containers)
const axiosV3 = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// Helper para sanitizar mensagens de erro da API evitando expor termos técnicos ou JSONs brutos
function sanitizeApiErrorMessage(rawMsg: any): string {
  if (!rawMsg) return 'Nenhum registro foi encontrado com os critérios informados.';
  const str = typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg);
  
  if (str.includes('ECONNRESET') || str.includes('connreset') || str.includes('reset') || str.includes('socket hang up')) {
    return 'A busca por Nome está temporariamente indisponível. Por favor, tente realizar a busca utilizando o CPF.';
  }
  
  if (str.includes('Not Found') || str.includes('404') || str.includes('retornaram nenhum resultado') || str.includes('Nenhum registro') || str.includes('nenhum resultado') || str.includes('não retornaram')) {
    return 'Nenhum registro foi encontrado com os dados informados. Verifique se o nome/chave está correto ou selecione a UF (Estado) para refinar a busca.';
  }

  if (str.includes('DirectData') || str.includes('API Error') || str.includes('listFilters') || str.includes('elapsedTimeMs')) {
    return 'Nenhum registro foi localizado para os critérios informados. Tente refinar a busca.';
  }

  return str;
}

// -----------------------------------------------------------------------------
// SEÇÃO: CONSULTA VEICULAR (V3)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SEÇÃO: CONSULTA VEICULAR (V3 - CONSULTA ESTADUAL COMPLETA E ECONÔMICA)
// -----------------------------------------------------------------------------

export async function consultaVeicular(placa: string, selectedModules: string[] = []) {
  const { token, v3Url } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Helper interno para consultar micro-endpoints com timeout seguro de 8 segundos
  const fetchEndpoint = async (endpointName: string) => {
    try {
      const url = `${v3Url}/api/${endpointName}?TOKEN=${token}&PLACA=${cleanPlaca}`;
      const response = await axiosV3.get(url, { timeout: 8000 });
      return response.data?.retorno || null;
    } catch {
      return null;
    }
  };

  try {
    // 1. Busca primeiro ConsultaVeicularEstadual (R$ 1,90) que traz Dados do Veículo, Proprietário, Débitos e Restrições
    let estadual = await fetchEndpoint('ConsultaVeicularEstadual');
    let gravame: any = null;

    // Se o estadual não retornou (ex: veículo de outro estado sem convênio ou indisponível), faz fallback para Gravame (R$ 1,80)
    if (!estadual) {
      gravame = await fetchEndpoint('ConsultaVeicularGravame');
    }

    // Se nenhum dos endpoints retornou dados válidos
    if (!estadual && !gravame) {
      return { 
        success: false, 
        message: 'Veículo não localizado para a placa informada ou indisponibilidade temporária na base veicular.' 
      };
    }

    const vEstadual = estadual?.veiculo || {};
    const vGravame = gravame?.veiculo || {};
    const gData = gravame?.gravame || {};
    const deb = estadual?.debitos || {};
    const rest = estadual?.restricoes || {};
    const cv = estadual?.comunicacaoVenda || {};

    const data: Record<string, any> = {};

    // Módulo: Dados do Veículo & Detalhes Técnicos
    if (selectedModules.includes('veiculo_basico')) {
      data['Dados_do_Veiculo'] = {
        placa: estadual?.placa || gravame?.placa || cleanPlaca,
        renavam: estadual?.renavam || gravame?.renavam || null,
        chassi: estadual?.chassi || gravame?.chassi || null,
        marca_modelo: vEstadual.marcaModelo || vGravame.marcaModelo || 'N/I',
        ano_fabricacao: vEstadual.anoFabricacao || vGravame.anoFabricacao || null,
        ano_modelo: vEstadual.anoModelo || vGravame.anoModelo || null,
        cor: vEstadual.cor || vGravame.cor || 'N/I',
        combustivel: vEstadual.combustivel && !vEstadual.combustivel.includes('NAO ENCONTRADO') ? vEstadual.combustivel : (vGravame.combustivel && vGravame.combustivel !== '0' ? vGravame.combustivel : 'Não informado'),
        categoria: vEstadual.categoria || vGravame.categoria || 'N/I',
        procedencia: vEstadual.procedencia || vGravame.procedencia || 'NACIONAL'
      };

      data['Detalhes_Tecnicos'] = {
        tipo_veiculo: vEstadual.tipo || vGravame.tipo || 'N/I',
        especie: vEstadual.especie || vGravame.especie || 'N/I',
        tipo_carroceria: vEstadual.carroceria || vGravame.tipoCarroceria || 'N/I',
        capacidade_carga: vEstadual.capacidadeCarga ? `${vEstadual.capacidadeCarga} kg` : (vGravame.capacidadeCarga ? `${vGravame.capacidadeCarga} kg` : null),
        peso_bruto_total: vEstadual.pbt ? `${vEstadual.pbt} kg` : (vGravame.pbt ? `${vGravame.pbt} kg` : null),
        quantidade_eixos: vEstadual.eixos || vGravame.eixoQuantidade || null,
        potencia: vEstadual.potencia ? `${vEstadual.potencia} cv` : null,
        cilindrada: vEstadual.cilindrada && vEstadual.cilindrada !== '0' ? vEstadual.cilindrada : null
      };
    }

    // Módulo: Proprietário Atual & Faturamento
    if (selectedModules.includes('veiculo_proprietario')) {
      const nomeProp = estadual?.nomeRazaoSocial || gData.nomeFinanciado || 'N/I';
      const docProp = estadual?.documento || gData.documentoProprietarioAtual || 'N/I';
      const tipoDoc = estadual?.tipoDocumento ? (estadual.tipoDocumento === 'JURIDICA' ? 'Pessoa Jurídica (CNPJ)' : 'Pessoa Física (CPF)') : (docProp.length > 11 ? 'Pessoa Jurídica (CNPJ)' : docProp.length > 0 ? 'Pessoa Física (CPF)' : 'Não informado');

      data['Proprietário_Atual'] = {
        nome_ou_razao_social: nomeProp,
        documento: docProp,
        tipo_documento: tipoDoc,
        municipio_emplacamento: estadual?.municipio || 'N/I',
        uf: estadual?.uf || gravame?.ufPlaca || 'N/I'
      };

      if (cv.proprietarioAnterior || cv.numeroIdentificacaoFaturado) {
        data['Historico_e_Faturamento'] = {
          proprietario_anterior: cv.proprietarioAnterior || 'Não consta',
          faturado_para: cv.numeroIdentificacaoFaturado ? `${cv.numeroIdentificacaoFaturado} (${cv.tipoDocumentoFaturado || 'CNPJ/CPF'})` : 'Não informado',
          uf_faturamento: cv.ufDestinoFaturamento || 'N/I',
          comunicacao_venda: cv.situacao || 'Nada consta'
        };
      }
    }

    // Módulo: Situação e Documentação
    if (selectedModules.includes('veiculo_documentacao')) {
      data['Documentacao_e_Situacao'] = {
        municipio_uf: `${estadual?.municipio || 'N/I'} - ${estadual?.uf || gravame?.ufPlaca || ''}`.trim(),
        situacao_veiculo: estadual?.situacao || gravame?.statusDoVeiculo || 'CIRCULAÇÃO',
        data_licenciamento: estadual?.licenciamentoData || 'N/I',
        data_emissao_crv: estadual?.dataEmissaoCrv || 'N/I',
        descricao_status: gravame?.descricaoStatus || (estadual?.situacao ? `Veículo em situação: ${estadual.situacao}` : 'Veículo regular')
      };
    }

    // Módulo: Débitos, Multas e IPVA
    if (selectedModules.includes('veiculo_debitos')) {
      data['Debitos_e_Encargos'] = {
        ipva: deb.valorIpva ? `${deb.situacaoIpva || 'Situação'} (${deb.valorIpva})` : deb.situacaoIpva || 'Nada consta',
        multas: deb.valorMulta ? `${deb.situacaoMulta || 'Situação'} (${deb.valorMulta})` : deb.situacaoMulta || 'Nada consta',
        licenciamento: deb.valorLicenciamento ? `${deb.situacaoLicenciamento || 'Situação'} (${deb.valorLicenciamento})` : deb.situacaoLicenciamento || 'Nada consta',
        dpvat: deb.valorDpvat ? `${deb.situacaoDpvat || 'Situação'} (${deb.valorDpvat})` : deb.situacaoDpvat || 'Nada consta',
        multa_renainf: deb.valorRenainf || 'R$ 0,00',
        multa_prf: deb.valorPoliciaRodoviariaFederal || 'R$ 0,00',
        multa_der_dersa: (deb.valorDer && deb.valorDer !== 'R$ 0,00') ? deb.valorDer : (deb.valorDersa || 'R$ 0,00'),
        multa_detran_municipais: (deb.valorDetran && deb.valorDetran !== 'R$ 0,00') ? deb.valorDetran : (deb.valorMunicipais || 'R$ 0,00')
      };
    }

    // Módulo: Restrições e Alertas
    if (selectedModules.includes('veiculo_restricoes')) {
      data['Restricoes_e_Alertas'] = {
        restricao_financeira: rest.financeira || gravame?.statusDoVeiculo || 'NADA CONSTA',
        ocorrencia_furto: rest.furto || 'NADA CONSTA',
        bloqueio_guincho: rest.guincho || 'NADA CONSTA',
        restricao_administrativa: rest.administrativa || 'NADA CONSTA',
        restricao_judicial: rest.judicial || 'NADA CONSTA',
        bloqueio_renajud: rest.renajud || 'NADA CONSTA',
        restricao_tributaria: rest.tributaria || 'NADA CONSTA',
        inspecao_ambiental: rest.ambiental || 'NADA CONSTA'
      };
    }

    // Fallback se nenhum módulo tiver sido selecionado
    if (Object.keys(data).length === 0) {
      data['Aviso'] = 'Nenhum dado selecionado para exibição.';
    }

    return { success: true, data };
  } catch (error: any) {
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: sanitizeApiErrorMessage(apiMessage) };
  }
}
// SEÇÃO: PESQUISA AVANÇADA (V3) - NOME, TELEFONE, EMAIL (SÍNCRONO)
// -----------------------------------------------------------------------------

export async function performSmartSearch(
  type: 'email' | 'phone' | 'name', 
  query: string, 
  selectedModules: string[] = [], 
  state?: string,
  candidateId?: string
) {
  const { token, v3Url } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  let url = '';
  const cleanQuery = query.trim();

  try {
    if (type === 'name' || type === 'nome' as any) {
      if (candidateId) {
        // Fluxo de processamento de um candidato selecionado
        const procRes = await processingIds([candidateId], `Busca por Nome: ${cleanQuery}`);
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
              const data = transformDirectDataAdvanced(item.returnJson || {}, selectedModules);
              
              if (selectedModules.includes('processos')) {
                const cpf = item.returnJson?.cpf || item.returnJson?.retorno?.cpf;
                if (cpf) {
                  const procRes = await consultaProcessos(cpf);
                  if (procRes.success) {
                    data['Processos_Judiciais'] = procRes.data;
                  } else {
                    data['Processos_Judiciais'] = { aviso: procRes.message || 'Nenhum processo judicial localizado.' };
                  }
                }
              }

              return {
                success: true,
                data,
                message: item.result || 'Consulta realizada com sucesso.'
              };
            }
          }
        }

        return { success: false, message: 'O processamento levou mais tempo que o esperado. Tente novamente.' };
      } else {
        // Etapa 1: Obter lista de candidatos
        const filterRes = await filterNaturalPerson({ fullName: cleanQuery, state });
        
        if (!filterRes.success || !filterRes.listFilters || filterRes.listFilters.length === 0) {
          if (filterRes.success && filterRes.numberOfPeople > 0) {
            return { 
              success: false, 
              message: `Muitos resultados encontrados (${filterRes.numberOfPeople.toLocaleString('pt-BR')} homônimos). Por favor, refine a sua busca fornecendo o Estado ou nomes adicionais.` 
            };
          }
          const errorMsg = filterRes.error?.message || filterRes.metaDados?.mensagem || 'Nenhum registro encontrado.';
          return { success: false, message: errorMsg };
        }

        return {
          success: true,
          isMultiple: true,
          candidates: filterRes.listFilters.map((c: any) => ({
            id: c.id,
            name: c.fullName || c.name || cleanQuery,
            dateOfBirth: c.dateOfBirth,
            motherName: c.motherName,
            taxIdNumber: c.cpf || c.taxIdNumber, // CPF mascarado
            state: c.state,
            city: c.city
          }))
        };
      }
    }

    // Busca síncrona V3 para celular e e-mail (mais econômica e rápida)
    if (type === 'email') {
      url = `${v3Url}/api/EnriquecimentoLead?TOKEN=${token}&EMAIL=${encodeURIComponent(cleanQuery)}`;
    } else if (type === 'phone' || type === 'telefone' as any) {
      const phone = cleanQuery.replace(/\D/g, '');
      url = `${v3Url}/api/EnriquecimentoLead?TOKEN=${token}&CELULAR=${phone}`;
    }

    const response = await axiosV3.get(url);
    const res = response.data;

    if (!res.retorno || (Array.isArray(res.retorno) && res.retorno.length === 0)) {
      return { success: false, message: res.metaDados?.mensagem || 'Nenhum registro encontrado.' };
    }

    const rawData = Array.isArray(res.retorno) ? res.retorno[0] : res.retorno;
    
    const data = transformDirectDataPlus(rawData, selectedModules);
    
    if (selectedModules.includes('processos')) {
      const cpf = rawData.cpf;
      if (cpf) {
        const procRes = await consultaProcessos(cpf);
        if (procRes.success) {
          data['Processos_Judiciais'] = procRes.data;
        } else {
          data['Processos_Judiciais'] = { aviso: procRes.message || 'Nenhum processo judicial localizado.' };
        }
      }
    }

    return {
      success: true,
      data,
      message: 'Consulta realizada com sucesso.'
    };

  } catch (error: any) {
    console.error('Erro na SmartSearch:', error.response?.data || error.message);
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: sanitizeApiErrorMessage(apiMessage) };
  }
}

// -----------------------------------------------------------------------------
// SEÇÃO: CONSULTA DE PROCESSOS JUDICIAIS
// -----------------------------------------------------------------------------

export async function consultaProcessos(cpfOrCnpj: string) {
  const { token, v3Url } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const cleanDoc = cpfOrCnpj.replace(/\D/g, '');
  if (!cleanDoc) return { success: false, message: 'Documento inválido.' };
  
  const paramName = cleanDoc.length === 11 ? 'CPF' : 'CNPJ';
  const url = `${v3Url}/api/ProcessosJudiciaisCompleta?TOKEN=${token}&${paramName}=${cleanDoc}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    if (res.retorno) {
      return { success: true, data: res.retorno };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Nenhum processo encontrado para este documento.' };
  } catch (error: any) {
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: sanitizeApiErrorMessage(apiMessage) };
  }
}

// -----------------------------------------------------------------------------
// SEÇÃO: PESSOA FÍSICA PLUS (V3) - CPF
// -----------------------------------------------------------------------------

export async function consultaCpfPlus(cpf: string, selectedModules: string[] = []) {
  const { token, v3Url } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCpf = cpf.replace(/\D/g, '');
  const url = `${v3Url}/api/CadastroPessoaFisicaPlus?TOKEN=${token}&CPF=${cleanCpf}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    if (res.retorno) {
      const data = transformDirectDataPlus(res.retorno, selectedModules);
      
      // Se selecionou o módulo de processos judiciais, busca em paralelo
      if (selectedModules.includes('processos')) {
        const procRes = await consultaProcessos(cleanCpf);
        if (procRes.success) {
          data['Processos_Judiciais'] = procRes.data;
        } else {
          data['Processos_Judiciais'] = { aviso: procRes.message || 'Nenhum processo judicial localizado.' };
        }
      }

      return { success: true, data };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
  } catch (error: any) {
    const apiMessage = error.response?.data?.error?.message || error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: sanitizeApiErrorMessage(apiMessage) };
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
  const { token, baseUrl } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const activeBaseUrl = baseUrl === 'https://api.directd.com.br' ? 'https://api.app.directd.com.br' : baseUrl;
  
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

    const response = await axiosV3.post(`${activeBaseUrl}/api/AdvancedSearch/FilterNaturalPerson`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Token': token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errText = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
      throw new Error(sanitizeApiErrorMessage(errText));
    }
    console.error("FilterNaturalPerson falhou:", error);
    throw new Error(sanitizeApiErrorMessage(error.message));
  }
}

export async function processingIds(listIds: string[], searchName: string = 'Consulta ALL') {
  const { token, baseUrl } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const activeBaseUrl = baseUrl === 'https://api.directd.com.br' ? 'https://api.app.directd.com.br' : baseUrl;
  
  try {
    const response = await axiosV3.post(`${activeBaseUrl}/api/AdvancedSearch/ProcessingIds`, 
      { listIds, searchName }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Token': token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errText = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
      throw new Error(sanitizeApiErrorMessage(errText));
    }
    throw new Error(sanitizeApiErrorMessage(error.message));
  }
}

export async function viewSearch(searchUid: string) {
  const { token, baseUrl } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  const activeBaseUrl = baseUrl === 'https://api.directd.com.br' ? 'https://api.app.directd.com.br' : baseUrl;
  
  try {
    const response = await axiosV3.post(`${activeBaseUrl}/api/AdvancedSearch/ViewSearch`, 
      { searchUid },
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Token': token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errText = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
      throw new Error(sanitizeApiErrorMessage(errText));
    }
    throw new Error(sanitizeApiErrorMessage(error.message));
  }
}

function pickBestCandidate(candidates: any[]) {
  if (!candidates || candidates.length === 0) return null;
  // Tenta encontrar um com nome da mãe e data de nascimento (mais completo)
  const complete = candidates.find(c => c.motherName && c.dateOfBirth);
  if (complete) return complete;
  return candidates[0];
}

function transformDirectDataAdvanced(rawResponse: any, selectedModules: string[]) {
  const result: any = {};
  const raw = rawResponse.retorno || rawResponse;

  if (selectedModules.includes('dados_basicos') || selectedModules.includes('documentos')) {
    result['Dados_Pessoais'] = {
      nome: raw.nome || raw.nome_completo,
      cpf: raw.cpf,
      rg: raw.rg,
      data_nascimento: raw.dataNascimento || raw.nascimento,
      sexo: raw.sexo,
      nome_mae: raw.nomeMae || raw.mae,
      nome_pai: raw.nomePai || raw.pai,
      estado_civil: raw.estadoCivil || raw.estado_civil,
      signo: raw.signo,
      situacao_cadastral: raw.situacaoCadastral,
      renda_estimada: raw.rendaEstimada ? `R$ ${raw.rendaEstimada}` : undefined
    };
  }

  if (selectedModules.includes('telefones')) {
    result['Telefones'] = {
      lista: Array.isArray(raw.telefones) ? raw.telefones.map((t: any) => {
        if (typeof t === 'string') return t;
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
        complemento: end.complemento,
        bairro: end.bairro,
        cidade: end.cidade,
        uf: end.uf,
        cep: end.cep
      })) : []
    };
  }

  if (selectedModules.includes('parentes')) {
    const parentes = raw.parentescos || raw.parentes;
    result['Vinculos_Familiares'] = {
      lista: Array.isArray(parentes) ? parentes.map((p: any) => `${p.nome} (${p.vinculo || 'Parente'})`) : []
    };
  }

  return result;
}

// -----------------------------------------------------------------------------
// SEÇÃO: PESSOA JURÍDICA PLUS (V3) - CNPJ
// -----------------------------------------------------------------------------

export async function consultaCnpjPlus(cnpj: string, selectedModules: string[] = []) {
  const { token, v3Url } = await getDirectDataConfig();
  if (!token) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const url = `${v3Url}/api/CadastroPessoaJuridicaPlus?TOKEN=${token}&CNPJ=${cleanCnpj}`;

  try {
    const response = await axiosV3.get(url);
    const res = response.data;

    // Se a requisição async estiver em processamento
    if (response.status === 201 || response.status === 202) {
      return { success: false, message: 'Consulta iniciada, tente novamente em alguns segundos.' };
    }

    if (res.retorno) {
      const data = transformDirectDataCnpj(res.retorno, selectedModules);
      
      // Se selecionou o módulo de processos judiciais, busca em paralelo
      if (selectedModules.includes('processos')) {
        const procRes = await consultaProcessos(cleanCnpj);
        if (procRes.success) {
          data['Processos_Judiciais'] = procRes.data;
        } else {
          data['Processos_Judiciais'] = { aviso: procRes.message || 'Nenhum processo judicial localizado.' };
        }
      }

      return { success: true, data };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
  } catch (error: any) {
    const apiMessage = error.response?.data?.metaDados?.mensagem || error.message;
    return { success: false, message: sanitizeApiErrorMessage(apiMessage) };
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
