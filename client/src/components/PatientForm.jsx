import { useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import { createPatient } from '../services/api';

export default function PatientForm() {
  const { setScreen, setCurrentPatientId, setCurrentPatient } = useConsultationStore();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    try {
      const patient = await createPatient({
        name: name.trim(),
        date_of_birth: dob || null,
        sex: sex || null,
      });
      setCurrentPatientId(patient.id);
      setCurrentPatient({ ...patient, name: name.trim(), date_of_birth: dob || null, sex: sex || null, allergies: [], chronic_conditions: [], current_medications: [] });
      setScreen('patient-detail');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-surface px-5 pt-5">
      <button onClick={() => setScreen('home')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-6">Novo Paciente</h1>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Nome completo *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
            placeholder="Maria da Silva" autoFocus required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Data de nascimento</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Sexo</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white">
            <option value="">Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button type="submit" disabled={!name.trim() || loading}
          className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 transition">
          {loading ? 'Criando...' : 'Criar paciente'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Você pode adicionar alergias, condições e medicamentos depois.
        </p>
      </form>
    </div>
  );
}
