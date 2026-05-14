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
// SEÇÃO: PESSOA JURÍDICA PLUS (V3) - CNPJ
// -----------------------------------------------------------------------------

export async function consultaCnpjPlus(cnpj: string, selectedModules: string[] = []) {
  if (!TOKEN) throw new Error('DIRECT_DATA_TOKEN não configurado.');
  const cleanCnpj = cnpj.replace(/\D/g, '');
  const url = `${V3_URL}/api/CadastroPessoaJuridicaPlus?TOKEN=${TOKEN}&CNPJ=${cleanCnpj}`;

  try {
    const response = await axios.get(url);
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
