import useConsultationStore from '../stores/useConsultationStore';

export default function ProcessingScreen() {
  const processingSteps = useConsultationStore((s) => s.processingSteps);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Processando consulta
        </h2>
        <p className="text-gray-500 text-center mb-10">Isso pode levar até 1 minuto</p>

        <div className="space-y-5">
          {processingSteps.map((step, i) => {
            const isActive = !step.done && (i === 0 || processingSteps[i - 1]?.done);
            return (
              <div key={step.key} className="flex items-center gap-4">
                {step.done ? (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full border-2 border-primary-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
                <span className={`text-lg ${step.done ? 'text-green-700 font-medium' : isActive ? 'text-primary-700 font-medium' : 'text-gray-400'}`}>
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
