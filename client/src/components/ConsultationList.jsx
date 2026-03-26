import { useEffect, useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import { getConsultations, getConsultation, deleteConsultation } from '../services/api';

export default function ConsultationList() {
  const { consultations, setConsultations, setScreen, setCurrentConsultationId, setCurrentConsultation } =
    useConsultationStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    getConsultations().then(setConsultations).catch(console.error);
  }, [setConsultations]);

  const handleClick = async (c) => {
    if (c.status !== 'completed') return;
    try {
      const data = await getConsultation(c.id);
      setCurrentConsultationId(c.id);
      setCurrentConsultation(data);
      setScreen('results');
    } catch (e) {
      console.error('Failed to load consultation:', e);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteConsultation(id);
      setConsultations(consultations.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = consultations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.session_title || '').toLowerCase().includes(q) ||
      (c.patient_summary || '').toLowerCase().includes(q)
    );
  });

  const statusConfig = {
    recording: { label: 'Gravando', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: 'Processando', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Concluída', color: 'bg-brand-100 text-brand-700' },
    error: { label: 'Erro', color: 'bg-red-100 text-red-700' },
  };

  const formatDuration = (secs) => {
    if (!secs) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Consultas</h2>
        <span className="text-xs text-gray-300">{filtered.length}</span>
      </div>

      {consultations.length > 3 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
        />
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 text-sm">
            {consultations.length === 0 ? 'Nenhuma consulta ainda' : 'Nenhum resultado'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const status = statusConfig[c.status] || statusConfig.error;
            const title = c.session_title || c.patient_summary || 'Consulta sem título';
            const dur = formatDuration(c.audio_duration_seconds);

            return (
              <div
                key={c.id}
                onClick={() => handleClick(c)}
                className={`w-full text-left bg-white rounded-xl border border-gray-100 p-3.5 transition ${
                  c.status === 'completed' ? 'cursor-pointer hover:border-brand-200 hover:shadow-sm active:scale-[0.99]' : 'opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {dur && <span className="text-xs text-gray-300">{dur}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, c.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-800 line-clamp-1 font-medium">{title}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
