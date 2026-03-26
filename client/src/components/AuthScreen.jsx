import { useState } from 'react';
import LaudiLogo from './LaudiLogo';

export default function AuthScreen({ mode, onAuth, onNavigate }) {
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crm, setCrm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/signin';
      const body = isSignup
        ? { name: name.trim(), email: email.trim(), password, crm: crm.trim() || null }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Algo deu errado');
        setLoading(false);
        return;
      }

      // Save token + user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-brand-50 to-white">
      {/* Back to landing */}
      <div className="px-5 pt-5">
        <button onClick={() => onNavigate('landing')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 -mt-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <LaudiLogo size="md" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {isSignup ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isSignup ? 'Comece a documentar consultas com IA' : 'Entre para continuar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nome completo</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Dr(a). Maria Silva"
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Senha</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Sua senha'}
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
                minLength={isSignup ? 6 : undefined}
                required
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">CRM <span className="text-gray-300">(opcional)</span></label>
                <input
                  type="text" value={crm} onChange={(e) => setCrm(e.target.value)}
                  placeholder="123456/SP"
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-600 text-white text-base font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Aguarde...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            {isSignup ? (
              <>Já tem conta? <button onClick={() => onNavigate('signin')} className="text-brand-600 font-medium hover:underline">Entrar</button></>
            ) : (
              <>Não tem conta? <button onClick={() => onNavigate('signup')} className="text-brand-600 font-medium hover:underline">Criar conta grátis</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
