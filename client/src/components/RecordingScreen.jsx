import { useEffect, useRef } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { createConsultation, transcribe, analyze, getConsultation } from '../services/api';

export default function RecordingScreen() {
  const { doctorName, doctorCrm, setScreen, setCurrentConsultationId, setCurrentConsultation, markProcessingStep, resetProcessingSteps, setError } =
    useConsultationStore();
  const { isRecording, isPaused, formattedDuration, duration, start, pause, resume, stop } = useAudioRecorder();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start().catch(() => {
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      setScreen('home');
    });
  }, [start, setError, setScreen]);

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
      // 1. Create consultation
      const { id } = await createConsultation(doctorName, doctorCrm);
      setCurrentConsultationId(id);
      markProcessingStep('create');

      // 2. Transcribe (sends audio as base64)
      await transcribe(id, audioBlob, duration);
      markProcessingStep('transcribe');

      // 3. Analyze with GPT-4o
      await analyze(id);
      markProcessingStep('analyze');

      // 4. Get full consultation
      const consultation = await getConsultation(id);
      setCurrentConsultation(consultation);
      markProcessingStep('complete');

      setTimeout(() => setScreen('results'), 600);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Algo deu errado durante o processamento. Tente novamente.');
      setScreen('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      {/* Timer */}
      <div className="text-7xl font-mono font-bold text-primary-800 mb-6 tracking-wider tabular-nums">
        {formattedDuration}
      </div>

      {/* Sound wave indicator */}
      {isRecording && !isPaused && (
        <div className="flex items-end gap-1.5 mb-10 h-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="sound-bar w-1.5 bg-primary-500 rounded-full"
            />
          ))}
        </div>
      )}

      {isPaused && (
        <p className="text-primary-600 font-medium mb-10 text-lg animate-pulse">Pausado</p>
      )}

      {/* Min duration hint */}
      {duration < 3 && (
        <p className="text-gray-400 text-sm mb-6">Mínimo 3 segundos</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={isPaused ? resume : pause}
          className="w-16 h-16 rounded-full border-2 border-primary-300 flex items-center justify-center text-primary-600 hover:bg-primary-100 active:scale-95 transition"
        >
          {isPaused ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleFinish}
          disabled={duration < 3}
          className="px-8 py-4 bg-red-500 text-white text-lg font-semibold rounded-2xl hover:bg-red-600 active:scale-95 transition shadow-lg shadow-red-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Finalizar Consulta
        </button>
      </div>
    </div>
  );
}
