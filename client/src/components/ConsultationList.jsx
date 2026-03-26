import { useEffect } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import { getConsultations, getConsultation } from '../services/api';

export default function ConsultationList() {
  const { consultations, setConsultations, setScreen, setCurrentConsultationId, setCurrentConsultation } =
    useConsultationStore();

  useEffect(() => {
    getConsultations().then(setConsultations).catch(console.error);
  }, [setConsultations]);

  const handleClick = async (id) => {
    try {
      const data = await getConsultation(id);
      setCurrentConsultationId(id);
      setCurrentConsultation(data);
      setScreen('results');
    } catch (e) {
      console.error('Failed to load consultation:', e);
    }
  };

  const completedConsultations = consultations.filter((c) => c.status === 'completed');

  if (completedConsultations.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Consultas anteriores</h2>
      <div className="space-y-2.5">
        {completedConsultations.map((c) => (
          <button
            key={c.id}
            onClick={() => handleClick(c.id)}
            className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                Concluída
              </span>
            </div>
            <p className="text-base text-gray-800 line-clamp-1">
              {c.patient_summary || 'Consulta sem resumo'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
