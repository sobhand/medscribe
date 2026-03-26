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
    const data = await getConsultation(id);
    setCurrentConsultationId(id);
    setCurrentConsultation(data);
    setScreen('results');
  };

  const statusLabel = {
    recording: 'Gravando',
    processing: 'Processando',
    completed: 'Concluída',
    error: 'Erro',
  };

  const statusColor = {
    recording: 'bg-red-100 text-red-700',
    processing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  };

  const completedConsultations = consultations.filter((c) => c.status === 'completed');

  if (completedConsultations.length === 0) return null;

  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Consultas anteriores</h2>
      <div className="space-y-3">
        {completedConsultations.map((c) => (
          <button
            key={c.id}
            onClick={() => handleClick(c.id)}
            className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-primary-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">
                {new Date(c.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status]}`}>
                {statusLabel[c.status]}
              </span>
            </div>
            <p className="text-base text-gray-800 truncate">
              {c.patient_summary || 'Consulta sem resumo'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
