import { useState } from 'react';
import useConsultationStore from './stores/useConsultationStore';
import LaudiLogo from './components/LaudiLogo';
import DoctorSetup from './components/DoctorSetup';
import ConsultationList from './components/ConsultationList';
import RecordingScreen from './components/RecordingScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const { screen, doctorName, doctorCrm, sessionTitle, setSessionTitle, setScreen, error, setError } =
    useConsultationStore();

  if (screen === 'setup') return <DoctorSetup />;
  if (screen === 'recording') return <RecordingScreen />;
  if (screen === 'processing') return <ProcessingScreen />;
  if (screen === 'results') return <ResultsScreen />;

  // Home screen
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 bg-gradient-to-b from-brand-50/50 to-surface">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <LaudiLogo size="sm" />
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{doctorName}</p>
          <p className="text-xs text-gray-400">CRM: {doctorCrm}</p>
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

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-4">
        {/* Session title input */}
        <input
          type="text"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="Nome do paciente (opcional)"
          className="w-full max-w-xs text-center px-4 py-3 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white mb-6"
        />

        {/* Record button */}
        <button
          onClick={() => setScreen('recording')}
          className="w-44 h-44 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-2xl shadow-brand-300/40 flex flex-col items-center justify-center group"
        >
          <svg className="w-16 h-16 text-white mb-1.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
          <span className="text-white/90 text-sm font-medium">Nova Consulta</span>
        </button>
      </div>

      {/* Consultation list */}
      <div className="w-full max-w-md mx-auto pb-6">
        <ConsultationList />
      </div>
    </div>
  );
}
