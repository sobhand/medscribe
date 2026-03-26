import useConsultationStore from '../stores/useConsultationStore';

export default function ProcessingScreen() {
  const processingSteps = useConsultationStore((s) => s.processingSteps);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-xs">
        {/* Animated spinner */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
          Processando consulta
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Isso pode levar até 1 minuto</p>

        <div className="space-y-4">
          {processingSteps.map((step, i) => {
            const isActive = !step.done && (i === 0 || processingSteps[i - 1]?.done);
            return (
              <div key={step.key} className="flex items-center gap-3">
                {step.done ? (
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full border-2 border-primary-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
                <span className={`text-base ${step.done ? 'text-green-700 font-medium' : isActive ? 'text-primary-700 font-medium' : 'text-gray-300'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
