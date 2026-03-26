import { useState, useEffect } from 'react';
import useConsultationStore from './stores/useConsultationStore';
import useMediaPermission from './hooks/useMediaPermission';
import LaudiLogo from './components/LaudiLogo';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import PatientDetail from './components/PatientDetail';
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
    const store = useConsultationStore.getState();
    store.setDoctor(userData.name, userData.crm || '');
    setPage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('landing');
  };

  if (page === 'landing') return <LandingPage onNavigate={setPage} />;
  if (page === 'signup' || page === 'signin') return <AuthScreen mode={page} onAuth={handleAuth} onNavigate={setPage} />;

  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}

function AuthenticatedApp({ user, onLogout }) {
  const { screen, setScreen, error, setError } = useConsultationStore();
  const micPermission = useMediaPermission();

  useEffect(() => {
    const store = useConsultationStore.getState();
    if (user && !store.doctorName) {
      store.setDoctor(user.name, user.crm || '');
    }
  }, [user]);

  if (screen === 'patient-form') return <PatientForm />;
  if (screen === 'patient-detail') return <PatientDetail />;
  if (screen === 'recording') return <RecordingScreen />;
  if (screen === 'processing') return <ProcessingScreen />;
  if (screen === 'results') return <ResultsScreen />;

  // Home screen — patient list
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 bg-gradient-to-b from-brand-50/50 to-surface">
      {/* Header */}
      <div className="flex items-center justify-between pt-5 pb-4">
        <LaudiLogo size="sm" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400">
              {user?.specialty || ''}{user?.specialty && user?.crm ? ' · ' : ''}{user?.crm ? `CRM ${user.crm}` : ''}
            </p>
          </div>
          <button onClick={onLogout}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Sair">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3">
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mic blocked warning */}
      {micPermission === 'denied' && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <p className="text-yellow-700 text-xs">Microfone bloqueado. Habilite nas configurações do navegador para gravar consultas.</p>
        </div>
      )}

      {/* Patient list */}
      <div className="flex-1 w-full max-w-md mx-auto pb-6">
        <PatientList />
      </div>
    </div>
  );
}
