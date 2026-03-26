import { useEffect, useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import { getPatients, deletePatient } from '../services/api';

export default function PatientList() {
  const { patients, setPatients, setScreen, setCurrentPatientId, setCurrentPatient } = useConsultationStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    try {
      const data = await getPatients(q);
      setPatients(data);
    } catch (e) {
      console.error('Failed to load patients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleClick = (p) => {
    setCurrentPatientId(p.id);
    setCurrentPatient(p);
    setScreen('patient-detail');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deletePatient(id);
    setPatients(patients.filter((p) => p.id !== id));
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar paciente..."
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl mb-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
      />

      {/* New patient button */}
      <button
        onClick={() => setScreen('patient-form')}
        className="w-full py-3.5 mb-4 bg-brand-600 text-white text-sm font-semibold rounded-2xl hover:bg-brand-700 active:scale-[0.98] transition shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Novo Paciente
      </button>

      {/* Patient list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-400 text-sm">
            {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => {
            const age = calculateAge(p.date_of_birth);
            const lastDate = p.last_consultation_at
              ? new Date(p.last_consultation_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : null;

            return (
              <div
                key={p.id}
                onClick={() => handleClick(p)}
                className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-brand-200 hover:shadow-sm active:scale-[0.99] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {age !== null && <span className="text-xs text-gray-400">{age} anos</span>}
                      {p.sex && <span className="text-xs text-gray-400">{p.sex === 'masculino' ? 'M' : p.sex === 'feminino' ? 'F' : p.sex}</span>}
                      {lastDate && <span className="text-xs text-gray-300">Última: {lastDate}</span>}
                      <span className="text-xs text-gray-300">{p.consultation_count || 0} consulta{(p.consultation_count || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
