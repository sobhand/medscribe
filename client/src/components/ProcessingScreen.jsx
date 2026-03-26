import useConsultationStore from '../stores/useConsultationStore';
import { analyze, getConsultation } from '../services/api';

export default function ProcessingScreen() {
  const {
    processingSteps, currentConsultationId,
    setScreen, setCurrentConsultation, markProcessingStep, setError,
  } = useConsultationStore();

  const failedStep = processingSteps.find((s) => s.error);
  const allDone = processingSteps.every((s) => s.done);

  const handleRetry = async () => {
    if (!failedStep || !currentConsultationId) return;

    // Clear the error on the failed step
    useConsultationStore.getState().failProcessingStep(failedStep.key, null);

    try {
      if (failedStep.key === 'analyze') {
        await analyze(currentConsultationId);
        markProcessingStep('analyze');

        const consultation = await getConsultation(currentConsultationId);
        setCurrentConsultation(consultation);
        markProcessingStep('complete');

        setTimeout(() => setScreen('results'), 500);
      } else {
        // For transcription errors, need to re-record
        setError('Esta etapa requer nova gravação.');
        setScreen('home');
      }
    } catch (err) {
      setError(err.message || 'Falha ao tentar novamente.');
      setScreen('home');
    }
  };

  const handleGoHome = () => {
    setScreen('home');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="w-full max-w-xs">
        {/* Spinner or error icon */}
        <div className="flex justify-center mb-8">
          {failedStep ? (
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
          {failedStep ? 'Erro no processamento' : 'Processando'}
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          {failedStep ? 'Uma etapa falhou' : 'Até 1 minuto'}
        </p>

        <div className="space-y-3.5">
          {processingSteps.map((step, i) => {
            const isActive = !step.done && !step.error && (i === 0 || processingSteps[i - 1]?.done);
            const hasError = !!step.error;

            return (
              <div key={step.key} className="flex items-center gap-3">
                {step.done ? (
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : hasError ? (
                  <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full border-2 border-brand-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${
                  step.done ? 'text-brand-700 font-medium' :
                  hasError ? 'text-red-600' :
                  isActive ? 'text-gray-800 font-medium' :
                  'text-gray-300'
                }`}>
                  {hasError ? step.error : step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Retry / Go home buttons on error */}
        {failedStep && (
          <div className="flex gap-3 mt-8">
            <button onClick={handleGoHome}
              className="flex-1 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              Voltar
            </button>
            {failedStep.key === 'analyze' && (
              <button onClick={handleRetry}
                className="flex-1 py-3 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 active:scale-[0.98] transition">
                Tentar novamente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
