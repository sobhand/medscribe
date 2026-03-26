import { useState, useEffect } from 'react';
import useConsultationStore from './stores/useConsultationStore';
import useMediaPermission from './hooks/useMediaPermission';
import LaudiLogo from './components/LaudiLogo';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import ConsultationList from './components/ConsultationList';
import RecordingScreen from './components/RecordingScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultsScreen from './components/ResultsScreen';

function getStoredUser() {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) return JSON.parse(user);
  } catch {}
  return null;
}

export default function App() {
  const [page, setPage] = useState(() => getStoredUser() ? 'app' : 'landing');
  const [user, setUser] = useState(getStoredUser);

  const handleAuth = (userData) => {
    setUser(userData);
    // Sync to consultation store
    const store = useConsultationStore.getState();
    store.setDoctor(userData.name, userData.crm || '');
    setPage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor_name');
    localStorage.removeItem('doctor_crm');
    setUser(null);
    setPage('landing');
  };

  if (page === 'landing') {
    return <LandingPage onNavigate={setPage} />;
  }

  if (page === 'signup' || page === 'signin') {
    return <AuthScreen mode={page} onAuth={handleAuth} onNavigate={setPage} />;
  }

  // App (authenticated)
  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}

function AuthenticatedApp({ user, onLogout }) {
  const { screen, sessionTitle, setSessionTitle, setScreen, error, setError } =
    useConsultationStore();
  const micPermission = useMediaPermission();

  // Ensure doctor info is set
  useEffect(() => {
    const store = useConsultationStore.getState();
    if (user && !store.doctorName) {
      store.setDoctor(user.name, user.crm || '');
    }
    if (store.screen === 'setup') {
      store.setScreen('home');
    }
  }, [user]);

  if (screen === 'recording') return <RecordingScreen />;
  if (screen === 'processing') return <ProcessingScreen />;
  if (screen === 'results') return <ResultsScreen />;

  // Home screen
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 bg-gradient-to-b from-brand-50/50 to-surface">
      {/* Header */}
      <div className="flex items-center justify-between pt-5 pb-2">
        <LaudiLogo size="sm" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            {user?.crm && <p className="text-xs text-gray-400">CRM: {user.crm}</p>}
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Sair"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4">
        <input
          type="text" value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="Nome do paciente (opcional)"
          className="w-full max-w-xs text-center px-4 py-3 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white mb-6"
        />

        {micPermission === 'denied' ? (
          <div className="w-44 h-44 rounded-full bg-gray-200 flex flex-col items-center justify-center text-center px-4">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l16 16" />
            </svg>
            <span className="text-gray-500 text-xs font-medium">Microfone bloqueado</span>
            <span className="text-gray-400 text-[10px] mt-1">Habilite nas configurações do navegador</span>
          </div>
        ) : (
          <button onClick={() => setScreen('recording')}
            className="w-44 h-44 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-2xl shadow-brand-300/40 flex flex-col items-center justify-center group">
            <svg className="w-16 h-16 text-white mb-1.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
            <span className="text-white/90 text-sm font-medium">Nova Consulta</span>
          </button>
        )}
      </div>

      <div className="w-full max-w-md mx-auto pb-6">
        <ConsultationList />
      </div>
    </div>
  );
}
