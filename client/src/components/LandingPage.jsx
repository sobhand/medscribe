import LaudiLogo from './LaudiLogo';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <LaudiLogo size="sm" />
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('signin')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition">
            Entrar
          </button>
          <button onClick={() => onNavigate('signup')}
            className="px-5 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-95 transition shadow-sm">
            Começar grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Beta gratuito para médicos
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Grave a consulta.<br />
            <span className="text-brand-600">A documentação é por nossa conta.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
            Laudi transcreve e estrutura suas consultas automaticamente.
            Anamnese, hipóteses diagnósticas, exames e conduta — prontos para revisar em segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => onNavigate('signup')}
              className="px-8 py-4 text-base font-semibold bg-brand-600 text-white rounded-2xl hover:bg-brand-700 active:scale-[0.98] transition shadow-lg shadow-brand-300/30">
              Testar agora — é grátis
            </button>
            <a href="#como-funciona"
              className="px-8 py-4 text-base font-medium text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition text-center">
              Como funciona
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">30s</p>
            <p className="text-xs text-gray-400 mt-0.5">para gerar documentação</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">100%</p>
            <p className="text-xs text-gray-400 mt-0.5">controle do médico</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">CID-10</p>
            <p className="text-xs text-gray-400 mt-0.5">hipóteses com código</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">PDF</p>
            <p className="text-xs text-gray-400 mt-0.5">exportação instantânea</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="max-w-5xl mx-auto px-5 py-20 md:py-28">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
          3 toques. Documentação completa.
        </h2>
        <p className="text-gray-400 text-center mb-14 max-w-md mx-auto">
          Foque no paciente. O Laudi cuida do resto.
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <Step
            number="1"
            title="Grave a consulta"
            desc="Toque em gravar e converse normalmente com o paciente. Sem formulários, sem digitação."
            icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>}
          />
          <Step
            number="2"
            title="IA estrutura tudo"
            desc="Transcrição automática + anamnese, hipóteses diagnósticas com CID-10, exames e conduta sugerida."
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>}
          />
          <Step
            number="3"
            title="Revise e exporte"
            desc="Edite qualquer campo, aceite ou rejeite sugestões. Exporte PDF profissional com um toque."
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>}
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50/80 border-y border-gray-100 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-14">
            Tudo que um prontuário inteligente precisa
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <Feature title="Transcrição em português" desc="Modelo Whisper otimizado para consultas médicas em português brasileiro." />
            <Feature title="Anamnese estruturada" desc="QP, HDA, antecedentes, hábitos, revisão de sistemas — tudo extraído automaticamente." />
            <Feature title="Hipóteses com CID-10" desc="Sugestões diagnósticas com código CID-10 e justificativa clínica baseada nos achados." />
            <Feature title="Exames sugeridos" desc="Lista de exames complementares vinculados a cada hipótese diagnóstica." />
            <Feature title="Conduta e prescrição" desc="Medicamentos, orientações e retorno sugeridos — sempre marcados como sugestão IA." />
            <Feature title="PDF profissional" desc="Exporte relatório formatado com cabeçalho, seções e rodapé institucional." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Menos papelada. Mais paciente.
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Crie sua conta em 10 segundos e faça sua primeira consulta documentada por IA.
        </p>
        <button onClick={() => onNavigate('signup')}
          className="px-10 py-4 text-lg font-semibold bg-brand-600 text-white rounded-2xl hover:bg-brand-700 active:scale-[0.98] transition shadow-lg shadow-brand-300/30">
          Criar conta grátis
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <LaudiLogo size="sm" />
          <p className="text-xs text-gray-400">
            Laudi — Documentação clínica inteligente. Sugestões de IA devem ser revisadas pelo médico.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, desc, icon }) {
  return (
    <div className="text-center md:text-left">
      <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
        {icon}
      </div>
      <div className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">Passo {number}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
