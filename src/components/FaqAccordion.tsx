'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: 'O que é o Detetive Buscas?',
      answer: 'O Detetive Buscas é uma plataforma corporativa B2B de enriquecimento cadastral, validação de leads e inteligência de dados. Auxiliamos empresas no processo de Background Check (checagem de histórico), mitigação de fraudes, validação de CPFs/CNPJs e localização de informações cadastrais atualizadas para contatos ou análises de risco.'
    },
    {
      question: 'De onde vêm os dados exibidos na plataforma?',
      answer: 'Nosso motor de buscas consolida e cruza informações provenientes de dezenas de fontes de dados públicas, registros oficiais, juntas comerciais e provedores cadastrais consolidados. Todo o processo de consulta é rigorosamente em conformidade com as bases legais vigentes.'
    },
    {
      question: 'Como funciona a precificação das consultas? Existe mensalidade?',
      answer: 'Não cobramos mensalidades, assinaturas ou taxas de adesão. O Detetive Buscas opera no modelo Pay-per-use (carteira de saldo pré-pago). Você realiza uma recarga via Pix e o saldo é consumido dinamicamente apenas quando você faz buscas. Além disso, a cobrança é modular: você seleciona exatamente quais blocos de informação deseja consultar e só paga por eles.'
    },
    {
      question: 'O sistema possui mecanismo de prevenção contra gastos duplicados?',
      answer: 'Sim! Possuímos um sistema inovador de Cache Inteligente de 48 horas. Se você realizar a mesma consulta com os mesmos módulos dentro de um período de 48 horas, o sistema consome os dados salvos em nossa base interna, evitando novas requisições desnecessárias aos provedores externos e economizando seu saldo.'
    },
    {
      question: 'Como a plataforma trata o sigilo e a privacidade das consultas?',
      answer: 'A segurança e a privacidade são nossos pilares. Todas as consultas realizadas são confidenciais e protegidas por criptografia ponta a ponta (SSL/TLS de 256 bits). Os dados consultados não são compartilhados com terceiros e as buscas ficam registradas exclusivamente no painel privado de quem as realizou.'
    },
    {
      question: 'Em conformidade com a LGPD, os titulares podem solicitar a exclusão de seus dados?',
      answer: 'Sim! Nós respeitamos integralmente a Lei Geral de Proteção de Dados (LGPD). Qualquer cidadão (titular dos dados) pode fazer uma solicitação formal de exclusão ou bloqueio de visualização de seu CPF nas consultas da nossa plataforma através do canal público de Proteção de Dados (Opt-out) localizado no rodapé da página. O bloqueio é processado e respeitado em nossa base.'
    },
    {
      question: 'Como posso começar a utilizar a plataforma?',
      answer: 'O processo é imediato: basta criar uma conta gratuita clicando no botão "Acessar Plataforma". Ao entrar, você poderá recarregar qualquer saldo em sua carteira digital via Pix corporativo e já realizar as primeiras consultas em segundos, com liberação automática de relatórios.'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 text-left">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-[#243b56] hover:text-[#2872fa] transition-colors focus:outline-none"
            >
              <span className="pr-4 text-sm md:text-base">{faq.question}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-[#2872fa] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'
              }`}
            >
              <div className="px-6 py-5 text-slate-600 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
