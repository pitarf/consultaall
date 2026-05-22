'use client';

import { useState } from 'react';
import { User, Building2, Phone, MapPin, Car, Check } from 'lucide-react';

type TabId = 'cpf' | 'cnpj' | 'contatos' | 'localizacao' | 'veiculos';

interface TabContent {
  title: string;
  icon: any;
  subtitle: string;
  description: string;
  benefits: string[];
  mockupTitle: string;
  mockupFields: { label: string; value: string; isChecked?: boolean }[];
}

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('cpf');

  const tabs: Record<TabId, TabContent> = {
    cpf: {
      title: 'Pessoa Física',
      icon: User,
      subtitle: 'Validação Cadastral e Background Check',
      description: 'Tenha segurança nas suas relações comerciais. Valide cadastros e investigue a consistência de informações de pessoas físicas em tempo real com fontes integradas e seguras.',
      benefits: [
        'Confirmação de Nome Completo e Data de Nascimento',
        'Situação Cadastral ativa na Receita Federal',
        'Histórico e cruzamento de endereços anteriores',
        'Vínculos familiares e de parentesco para análise de risco',
        'Indicativos de óbito e validações cadastrais proativas'
      ],
      mockupTitle: 'Resultado da Validação Cadastral (CPF)',
      mockupFields: [
        { label: 'Nome Completo', value: 'Nome Completo do Titular', isChecked: true },
        { label: 'CPF', value: '123.456.789-00', isChecked: true },
        { label: 'Data de Nascimento', value: '01/02/1987', isChecked: true },
        { label: 'Situação na Receita', value: 'REGULAR (Valido)', isChecked: true },
        { label: 'Classe Social Estimada', value: 'Classe Estimada', isChecked: true },
        { label: 'Vínculos Mapeados', value: 'Vínculos Familiares', isChecked: true }
      ]
    },
    cnpj: {
      title: 'Pessoa Jurídica',
      icon: Building2,
      subtitle: 'Análise de Empresas e Quadro Societário',
      description: 'Estruture análises corporativas completas antes de assinar contratos. Consulte dezenas de fontes de informações cadastrais e societárias de pessoas jurídicas instantaneamente.',
      benefits: [
        'Razão Social, Nome Fantasia e Data de Abertura',
        'Quadro de Sócios e Administradores (QSA)',
        'CNAE Principal e Secundários atualizados',
        'Porte da empresa e regime de faturamento estimado',
        'Localização fiscal e telefones corporativos confirmados'
      ],
      mockupTitle: 'Relatório Cadastral de Empresa (CNPJ)',
      mockupFields: [
        { label: 'Razão Social', value: 'Razão Social da Empresa Ltda', isChecked: true },
        { label: 'CNPJ', value: '12.345.678/0001-90', isChecked: true },
        { label: 'Natureza Jurídica', value: 'Sociedade Empresária Limitada', isChecked: true },
        { label: 'Situação Cadastral', value: 'ATIVA', isChecked: true },
        { label: 'Faturamento Presumido', value: 'Faixa de Faturamento Presumido', isChecked: true },
        { label: 'Quadro de Sócios', value: 'Sócios e Administradores', isChecked: true }
      ]
    },
    contatos: {
      title: 'Contatos e Leads',
      icon: Phone,
      subtitle: 'Higienização e Enriquecimento de Contatos',
      description: 'Aumente o índice de conversão e contato comercial da sua empresa. Recupere ou confirme números de telefone e endereços de e-mail válidos a partir de chaves de entrada.',
      benefits: [
        'Higienização de carteiras de clientes antigas',
        'Identificação de operadoras de telefonia',
        'Validação de existência de contas de e-mail',
        'Flags de contas ativas no WhatsApp',
        'Bloqueios de telemarketing vigentes identificados'
      ],
      mockupTitle: 'Enriquecimento de Canais de Contato',
      mockupFields: [
        { label: 'E-mail Principal', value: 'exemplo@email.com', isChecked: true },
        { label: 'Telefone com DDD', value: '(11) 99999-9999', isChecked: true },
        { label: 'Operadora', value: 'Operadora de Telefonia', isChecked: true },
        { label: 'Flag WhatsApp', value: 'WhatsApp Ativo', isChecked: true },
        { label: 'Telemarketing', value: 'Situação de Telemarketing', isChecked: true }
      ]
    },
    localizacao: {
      title: 'Endereço e Localização',
      icon: MapPin,
      subtitle: 'Higienização de Logradouros e Geografia',
      description: 'Reduza o custo de envios e correspondências inválidas. Confirme endereços completos (CEP, logradouro, bairro, cidade, UF) vinculados a perfis cadastrais em nosso motor.',
      benefits: [
        'Confirmação exata de CEP e numeração',
        'Histórico de endereços anteriores documentados',
        'Identificação de bairros e microrregiões comerciais',
        'Localizações complementares (apartamento, bloco)',
        'Validação de dados geográficos em fontes públicas'
      ],
      mockupTitle: 'Validação de Endereço Cadastral',
      mockupFields: [
        { label: 'CEP', value: '00000-000', isChecked: true },
        { label: 'Logradouro', value: 'Nome do Logradouro / Rua', isChecked: true },
        { label: 'Número/Comp.', value: 'Número, Complemento', isChecked: true },
        { label: 'Bairro', value: 'Nome do Bairro', isChecked: true },
        { label: 'Cidade / UF', value: 'Cidade - UF', isChecked: true }
      ]
    },
    veiculos: {
      title: 'Veículos e Frotas',
      icon: Car,
      subtitle: 'Histórico Técnico e Análise Veicular',
      description: 'Avalie a consistência e a regularidade de frotas e veículos antes de transacionar. Acesso direto a dados de chassi, renavam, cor, marca, modelo e restrições legais.',
      benefits: [
        'Dados técnicos completos (motorização, combustível, cor)',
        'Verificação de gravames e restrições de venda',
        'Identificação de restrição Renajud e alertas ativos',
        'Indicativos de histórico de sinistro ou leilão',
        'Validação de ano de fabricação e ano modelo'
      ],
      mockupTitle: 'Validação da Ficha Técnica Veicular',
      mockupFields: [
        { label: 'Placa', value: 'ABC1D23', isChecked: true },
        { label: 'Marca / Modelo', value: 'Marca / Modelo do Veículo', isChecked: true },
        { label: 'Chassi / Renavam', value: 'Chassi / Renavam do Veículo', isChecked: true },
        { label: 'Ano Modelo/Fab.', value: '0000 / 0000', isChecked: true },
        { label: 'Alerta Leilão / Roubo', value: 'Sem restrições', isChecked: true }
      ]
    }
  };

  return (
    <div className="w-full">
      {/* Abas Menu */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {(Object.keys(tabs) as TabId[]).map((tabKey) => {
          const tab = tabs[tabKey];
          const Icon = tab.icon;
          const isActive = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all border duration-200 ${
                isActive
                  ? 'bg-[#2872fa] border-[#2872fa] text-white shadow-lg shadow-[#2872fa]/20'
                  : 'bg-white border-[#e2e8f0] text-[#243b56] hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2872fa]'}`} />
              {tab.title}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm">
        {/* Descrição */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-[#2872fa]/10 px-3 py-1.5 rounded-full">
            {tabs[activeTab].subtitle}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#243b56]">
            Inteligência cadastral de ponta para sua empresa
          </h3>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {tabs[activeTab].description}
          </p>

          <div className="space-y-3">
            {tabs[activeTab].benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-slate-700 text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mockup Card Visual */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-left font-mono">
            {/* Header do Mockup */}
            <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-500 font-medium">detetive_buscas_api_v3.json</span>
            </div>

            {/* Conteúdo do Mockup */}
            <div className="p-6 space-y-4">
              <div className="text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2">
                // {tabs[activeTab].mockupTitle}
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                {tabs[activeTab].mockupFields.map((field, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 font-semibold mb-0.5 sm:mb-0">
                      &quot;{field.label.toLowerCase().replace(/\s/g, '_')}&quot;:
                    </span>
                    <span className="text-slate-200">
                      &quot;{field.value}&quot;
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>STATUS: 200 OK</span>
                <span>CACHE: ACTIVE (48H)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
