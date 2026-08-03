'use client';

import Link from 'next/link';

interface FooterProps {
  logoUrl?: string | null;
}

/**
 * Componente de Rodapé (Footer) unificado e responsivo para o Detetive Buscas.
 * Exibe logo, links de consultas, informações da empresa, políticas legais e selo de status de sistemas.
 */
export default function Footer({ logoUrl }: FooterProps) {
  const footerLinks = {
    consultas: [
      { label: 'Consulta CPF', href: '/consulta-cpf' },
      { label: 'Consulta Telefone', href: '/consulta-telefone' },
      { label: 'Consulta Placa', href: '/consulta-placa' },
      { label: 'Consulta CNPJ', href: '/consulta-cnpj' },
      { label: 'Consulta por Nome', href: '/consulta-nome' },
    ],
    empresa: [
      { label: 'Sobre o Detetive Buscas', href: '/sobre' },
      { label: 'Contato', href: '/contato' },
      { label: 'Suporte', href: '/suporte' },
      { label: 'Blog', href: '/blog' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Política de Cookies', href: '/politica-de-cookies' },
      { label: 'Proteção de Dados', href: '/protecao-de-dados' },
    ]
  };

  return (
    <footer className="bg-slate-50 dark:bg-[#080b11] border-t border-slate-200 dark:border-white/5 py-12 sm:py-16 text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid de Links e Logo */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-10 border-b border-slate-200 dark:border-white/5">
          
          {/* Coluna da Marca */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo do Detetive Buscas" 
                  className="h-8 w-auto object-contain" 
                />
              ) : (
                <img 
                  src="/logo.webp" 
                  alt="Logo do Detetive Buscas" 
                  className="h-8 w-auto object-contain" 
                />
              )}
              <span className="text-lg font-bold text-[#243b56] dark:text-white tracking-tight">
                Detetive<span className="text-[#2872fa]">Buscas</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Plataforma profissional de consultas cadastrais.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Coluna Consultas */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-xs font-bold text-[#243b56] dark:text-white tracking-wider uppercase">
              Consultas
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.consultas.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#2872fa] dark:hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Empresa */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-xs font-bold text-[#243b56] dark:text-white tracking-wider uppercase">
              Empresa
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#2872fa] dark:hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Legal */}
          <div className="space-y-4 col-span-1">
            <h4 className="text-xs font-bold text-[#243b56] dark:text-white tracking-wider uppercase">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#2872fa] dark:hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Linha Inferior com Direitos e Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 DetetiveBuscas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block animate-pulse"></span>
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>

        {/* Declaração de conformidade de Whitelist (LGPD/B2B obrigatória) */}
        <div className="pt-8 text-center text-[10px] text-slate-400 dark:text-slate-600 max-w-4xl mx-auto leading-relaxed border-t border-slate-100 dark:border-white/5 mt-6 space-y-2">
          <p>
            A Detetive Buscas é uma plataforma tecnológica de enriquecimento cadastral desenvolvida estritamente para uso corporativo (B2B). Nossos relatórios são estruturados a partir do processamento automatizado de bases públicas oficiais e provedores regulamentados sob a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
          </p>
          <p>
            Garantimos o livre exercício dos direitos dos titulares de dados. Caso deseje solicitar o bloqueio ou a restrição da visualização do seu cadastro em nossa ferramenta de busca, utilize o formulário de Opt-out no nosso canal oficial de Proteção de Dados acima.
          </p>
        </div>

      </div>
    </footer>
  );
}
