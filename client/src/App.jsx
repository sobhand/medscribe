import useConsultationStore from './stores/useConsultationStore';
import DoctorSetup from './components/DoctorSetup';
import ConsultationList from './components/ConsultationList';
import RecordingScreen from './components/RecordingScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const { screen, doctorName, doctorCrm, setScreen, error, setError } = useConsultationStore();

  if (screen === 'setup') return <DoctorSetup />;
  if (screen === 'recording') return <RecordingScreen />;
  if (screen === 'processing') return <ProcessingScreen />;
  if (screen === 'results') return <ResultsScreen />;

  // Home screen
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center px-5 pt-safe">
      {/* Header */}
      <div className="text-center pt-10 mb-12">
        <p className="text-sm font-medium text-primary-600 tracking-wide uppercase mb-1">MedScribe</p>
        <h1 className="text-2xl font-bold text-gray-800">Dr(a). {doctorName}</h1>
        <p className="text-gray-400 mt-1 text-sm">CRM: {doctorCrm}</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full max-w-md mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Big record button */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <button
          onClick={() => setScreen('recording')}
          className="w-40 h-40 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all shadow-2xl shadow-primary-300/50 flex flex-col items-center justify-center group"
        >
          <svg className="w-16 h-16 text-white mb-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
          <span className="text-white text-sm font-semibold">Nova Consulta</span>
        </button>
      </div>

      {/* Consultation list */}
      <div className="w-full max-w-md pb-8">
        <ConsultationList />
      </div>
    </div>
  );
}
