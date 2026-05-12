import Link from "next/link";
import { Search, ShieldCheck, Zap, Database, Car, Building2, User } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navegação */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="container-premium py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="text-primary w-6 h-6" />
            <span className="text-xl font-bold tracking-wider text-white">
              Consulta<span className="text-primary">ALL</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#recursos" className="text-sm text-gray-300 hover:text-white transition-colors">
              Recursos
            </Link>
            <Link href="#planos" className="text-sm text-gray-300 hover:text-white transition-colors">
              Planos
            </Link>
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-premium text-sm">
              Começar Agora
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
        {/* Efeito de brilho de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 max-w-4xl mx-auto leading-tight">
          Dados Estratégicos na Palma da Sua Mão
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Consulte informações precisas sobre Pessoas, Empresas, Veículos e Processos. Tome decisões ágeis com nossa API em tempo real.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/cadastro" className="btn-premium px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Fazer uma Consulta
          </Link>
          <Link href="/planos" className="px-8 py-4 text-lg rounded-md border border-white/20 hover:bg-white/5 transition-all w-full sm:w-auto">
            Ver Pacotes
          </Link>
        </div>
      </section>

      {/* Categorias / Features */}
      <section id="recursos" className="py-20 bg-black/20">
        <div className="container-premium">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Módulos de Consulta</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tudo o que você precisa em um único lugar. Informações estruturadas e organizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <User className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Pessoas</h3>
              <p className="text-gray-400 text-sm">
                Dados cadastrais, e-mails, telefones, endereços e histórico financeiro via CPF.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <Building2 className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Empresas</h3>
              <p className="text-gray-400 text-sm">
                Quadro societário, situação cadastral, contatos e faturamento estimado via CNPJ.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <Car className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Veículos</h3>
              <p className="text-gray-400 text-sm">
                Histórico de roubo/furto, características técnicas, multas e proprietários via Placa.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <ShieldCheck className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Processos</h3>
              <p className="text-gray-400 text-sm">
                Pesquisa avançada de processos judiciais e antecedentes criminais em instantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 border-t border-white/5">
        <div className="container-premium flex flex-col md:flex-row items-center justify-center gap-12 opacity-70">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400 w-8 h-8" />
            <span className="font-semibold text-lg">Respostas em Segundos</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-400 w-8 h-8" />
            <span className="font-semibold text-lg">100% Seguro e Legal</span>
          </div>
          <div className="flex items-center gap-3">
            <Database className="text-blue-400 w-8 h-8" />
            <span className="font-semibold text-lg">API Atualizada Diariamente</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-black/40">
        <div className="container-premium text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ConsultaALL. Todos os direitos reservados. 
          <br />
          Desenvolvido com foco em segurança e desempenho.
        </div>
      </footer>
    </div>
  );
}
