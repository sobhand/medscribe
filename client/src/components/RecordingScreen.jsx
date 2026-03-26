import { useEffect } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { createConsultation, uploadAudio, transcribe, analyze, getConsultation } from '../services/api';

export default function RecordingScreen() {
  const { doctorName, doctorCrm, setScreen, setCurrentConsultationId, setCurrentConsultation, markProcessingStep, resetProcessingSteps, setError } =
    useConsultationStore();
  const { isRecording, isPaused, formattedDuration, duration, start, pause, resume, stop } = useAudioRecorder();

  useEffect(() => {
    start().catch((err) => {
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
      setScreen('home');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async () => {
    const audioBlob = await stop();
    if (!audioBlob) return;

    setScreen('processing');
    resetProcessingSteps();

    try {
      // 1. Create consultation
      const { id } = await createConsultation(doctorName, doctorCrm);
      setCurrentConsultationId(id);

      // 2. Upload audio
      const { audioPath } = await uploadAudio(id, audioBlob);
      markProcessingStep('upload');

      // 3. Transcribe
      await transcribe(id, audioPath);
      markProcessingStep('transcribe');

      // 4. Analyze
      const analysis = await analyze(id);
      markProcessingStep('analyze');

      // 5. Get full consultation
      const consultation = await getConsultation(id);
      setCurrentConsultation(consultation);
      markProcessingStep('complete');

      // Brief delay so user sees completion
      setTimeout(() => setScreen('results'), 800);
    } catch (err) {
      console.error('Processing error:', err);
      setError('Algo deu errado durante o processamento. Tente novamente.');
      setScreen('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-primary-50/30">
      {/* Timer */}
      <div className="text-6xl font-mono font-bold text-primary-800 mb-8 tracking-wider">
        {formattedDuration}
      </div>

      {/* Sound wave indicator */}
      {isRecording && !isPaused && (
        <div className="flex items-center gap-1 mb-12 h-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="sound-bar w-1.5 bg-primary-500 rounded-full"
              style={{ height: '8px' }}
            />
          ))}
        </div>
      )}

      {isPaused && (
        <p className="text-primary-600 font-medium mb-12 text-lg">Pausado</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={isPaused ? resume : pause}
          className="w-16 h-16 rounded-full border-2 border-primary-300 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition"
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
          className="px-8 py-4 bg-red-500 text-white text-lg font-semibold rounded-2xl hover:bg-red-600 transition shadow-lg shadow-red-200"
        >
          Finalizar Consulta
        </button>
      </div>
    </div>
  );
}
