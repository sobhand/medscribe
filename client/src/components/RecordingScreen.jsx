import { useEffect, useRef } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { createConsultation, transcribe, analyze, getConsultation } from '../services/api';

export default function RecordingScreen() {
  const {
    doctorName, doctorCrm, sessionTitle, setScreen,
    setCurrentConsultationId, setCurrentConsultation,
    markProcessingStep, failProcessingStep, resetProcessingSteps, setError,
  } = useConsultationStore();
  const { isRecording, isPaused, formattedDuration, duration, start, pause, resume, stop, cleanup } = useAudioRecorder();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start().catch(() => {
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      setScreen('home');
    });
    return () => {
      cleanup();
      startedRef.current = false;
    };
  }, [start, cleanup, setError, setScreen]);

  const handleFinish = async () => {
    if (duration < 3) {
      setError('Grave pelo menos 3 segundos antes de finalizar.');
      return;
    }

    const audioBlob = await stop();
    if (!audioBlob || audioBlob.size === 0) {
      setError('Nenhum áudio capturado. Tente novamente.');
      setScreen('home');
      return;
    }

    setScreen('processing');
    resetProcessingSteps();

    try {
      const { id } = await createConsultation(doctorName, doctorCrm, sessionTitle);
      setCurrentConsultationId(id);
      markProcessingStep('create');

      await transcribe(id, audioBlob, duration);
      markProcessingStep('transcribe');

      await analyze(id);
      markProcessingStep('analyze');

      const consultation = await getConsultation(id);
      setCurrentConsultation(consultation);
      markProcessingStep('complete');

      setTimeout(() => setScreen('results'), 500);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Algo deu errado. Tente novamente.');
      setScreen('home');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 bg-gradient-to-b from-brand-50 to-white">
      {/* Recording indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-red-500 rec-pulse" />
        <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
          {isPaused ? 'Pausado' : 'Gravando'}
        </span>
      </div>

      {/* Timer */}
      <div className="text-7xl font-mono font-bold text-gray-900 mb-6 tabular-nums tracking-wider">
        {formattedDuration}
      </div>

      {/* Sound wave */}
      {isRecording && !isPaused && (
        <div className="flex items-end gap-1.5 mb-10 h-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sound-bar" />
          ))}
        </div>
      )}

      {isPaused && <div className="mb-10 h-8" />}

      {/* Min duration hint */}
      {duration < 3 && (
        <p className="text-gray-400 text-xs mb-4">Mínimo 3 segundos</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-5">
        <button
          onClick={isPaused ? resume : pause}
          className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-95 transition"
        >
          {isPaused ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleFinish}
          disabled={duration < 3}
          className="px-8 py-4 bg-brand-600 text-white text-lg font-semibold rounded-2xl hover:bg-brand-700 active:scale-95 transition shadow-lg shadow-brand-300/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
