import useConsultationStore from '../stores/useConsultationStore';
import LaudiLogo from './LaudiLogo';

export default function ProcessingScreen() {
  const processingSteps = useConsultationStore((s) => s.processingSteps);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="w-full max-w-xs">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
          Processando
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Até 1 minuto</p>

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
                <span className={`text-sm ${
                  step.done ? 'text-brand-700 font-medium' :
                  hasError ? 'text-red-600 font-medium' :
                  isActive ? 'text-gray-800 font-medium' :
                  'text-gray-300'
                }`}>
                  {hasError ? step.error : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
