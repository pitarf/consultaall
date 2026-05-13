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
    'Token': TOKEN 
  },
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
    const response = await axios.get(url);
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
    return { success: false, message: error.message };
  }
}
// SEÇÃO: PESQUISA AVANÇADA (V3) - NOME, TELEFONE, EMAIL (SÍNCRONO)
// -----------------------------------------------------------------------------

export async function performSmartSearch(type: 'email' | 'phone' | 'name', query: string, selectedModules: string[] = [], state?: string) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  
  let url = '';
  const cleanQuery = query.trim();

  try {
    if (type === 'email') {
      url = `${V3_URL}/api/EnriquecimentoLead?TOKEN=${TOKEN}&EMAIL=${encodeURIComponent(cleanQuery)}`;
    } else if (type === 'phone' || type === 'telefone' as any) {
      const phone = cleanQuery.replace(/\D/g, '');
      url = `${V3_URL}/api/EnriquecimentoLead?TOKEN=${TOKEN}&CELULAR=${phone}`;
    } else if (type === 'name' || type === 'nome' as any) {
      const parts = cleanQuery.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      url = `${V3_URL}/api/Similarity?TOKEN=${TOKEN}&NAME=${encodeURIComponent(firstName)}&SURNAME=${encodeURIComponent(lastName)}`;
      if (state) url += `&STATE=${state}`;
    }

    const response = await axios.get(url);
    const res = response.data;

    // Na V3, se houver retorno, ele vem direto em res.retorno
    if (!res.retorno || (Array.isArray(res.retorno) && res.retorno.length === 0)) {
      return { success: false, message: res.metaDados?.mensagem || 'Nenhum registro encontrado.' };
    }

    // Se for lista (como em Similarity), pega o primeiro/melhor
    const rawData = Array.isArray(res.retorno) ? res.retorno[0] : res.retorno;
    
    return {
      success: true,
      data: transformDirectDataPlus(rawData, selectedModules),
      message: 'Consulta realizada com sucesso.'
    };

  } catch (error: any) {
    console.error('Erro na SmartSearch V3:', error.message);
    return { success: false, message: error.message || 'Erro na comunicação com a API.' };
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
    const response = await axios.get(url);
    const res = response.data;

    if (res.retorno) {
      return { success: true, data: transformDirectDataPlus(res.retorno, selectedModules) };
    }
    
    return { success: false, message: res.metaDados?.mensagem || 'Erro na consulta.' };
  } catch (error: any) {
    return { success: false, message: error.message };
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
