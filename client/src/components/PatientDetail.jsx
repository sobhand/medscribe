import { useEffect, useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import { getPatient, getPatientConsultations, getConsultation, updatePatient } from '../services/api';

export default function PatientDetail() {
  const {
    currentPatientId, currentPatient, setCurrentPatient,
    setScreen, setCurrentConsultationId, setCurrentConsultation,
    resetProcessingSteps,
  } = useConsultationStore();

  const [consultations, setConsultations] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentPatientId) return;
    Promise.all([
      getPatient(currentPatientId).then(setCurrentPatient),
      getPatientConsultations(currentPatientId).then(setConsultations),
    ]).finally(() => setLoading(false));
  }, [currentPatientId]);

  const p = currentPatient;

  const handleNewConsultation = () => {
    resetProcessingSteps();
    setScreen('recording');
  };

  const handleClickConsultation = async (c) => {
    if (c.status !== 'completed') return;
    const data = await getConsultation(c.id);
    setCurrentConsultationId(c.id);
    setCurrentConsultation(data);
    setScreen('results');
  };

  const startEdit = () => {
    setForm({
      name: p?.name || '',
      date_of_birth: p?.date_of_birth || '',
      sex: p?.sex || '',
      phone: p?.phone || '',
      blood_type: p?.blood_type || '',
      allergies: (p?.allergies || []).join(', '),
      chronic_conditions_text: (p?.chronic_conditions || []).map((c) => c.condition).join(', '),
      medications_text: (p?.current_medications || []).map((m) => `${m.name} ${m.dose || ''} ${m.frequency || ''}`).join(', '),
      notes: p?.notes || '',
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    const allergies = form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const chronic_conditions = form.chronic_conditions_text
      ? form.chronic_conditions_text.split(',').map((s) => ({ condition: s.trim() })).filter((c) => c.condition)
      : [];
    const current_medications = form.medications_text
      ? form.medications_text.split(',').map((s) => ({ name: s.trim() })).filter((m) => m.name)
      : [];

    await updatePatient(currentPatientId, {
      name: form.name,
      date_of_birth: form.date_of_birth || null,
      sex: form.sex || null,
      phone: form.phone || null,
      blood_type: form.blood_type || null,
      allergies,
      chronic_conditions,
      current_medications,
      notes: form.notes || null,
    });

    const updated = await getPatient(currentPatientId);
    setCurrentPatient(updated);
    setEditing(false);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  const age = calculateAge(p?.date_of_birth);
  const allergies = p?.allergies || [];
  const conditions = p?.chronic_conditions || [];
  const medications = p?.current_medications || [];

  return (
    <div className="min-h-[100dvh] bg-surface">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <button onClick={() => setScreen('home')} className="text-brand-600 font-medium flex items-center gap-0.5 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Pacientes
          </button>
          <button onClick={editing ? saveEdit : startEdit}
            className="text-sm font-medium text-brand-600">
            {editing ? 'Salvar' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Patient info */}
        {editing ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-base font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" placeholder="Nome" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none" />
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none">
                <option value="">Sexo</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none" placeholder="Telefone" />
              <select value={form.blood_type || ''} onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none">
                <option value="">Tipo sang.</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none" placeholder="Alergias (separadas por vírgula)" />
            <input value={form.chronic_conditions_text} onChange={(e) => setForm({ ...form, chronic_conditions_text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none" placeholder="Condições crônicas (separadas por vírgula)" />
            <input value={form.medications_text} onChange={(e) => setForm({ ...form, medications_text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none" placeholder="Medicamentos em uso (separados por vírgula)" />
            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none resize-none" placeholder="Observações" />
            <button onClick={() => setEditing(false)} className="text-xs text-gray-400">Cancelar</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800">{p?.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {age !== null && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{age} anos</span>}
              {p?.sex && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.sex}</span>}
              {p?.blood_type && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{p.blood_type}</span>}
            </div>
            {allergies.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Alergias</span>
                <p className="text-sm text-red-700 mt-0.5">{allergies.join(', ')}</p>
              </div>
            )}
            {conditions.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Condições crônicas</span>
                <p className="text-sm text-gray-700 mt-0.5">{conditions.map((c) => c.condition).join(', ')}</p>
              </div>
            )}
            {medications.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Medicamentos em uso</span>
                <p className="text-sm text-gray-700 mt-0.5">{medications.map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''}`).join(', ')}</p>
              </div>
            )}
            {p?.notes && (
              <div className="mt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Observações</span>
                <p className="text-sm text-gray-600 mt-0.5">{p.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* New consultation button */}
        <button onClick={handleNewConsultation}
          className="w-full py-3.5 mb-6 bg-brand-600 text-white text-sm font-semibold rounded-2xl hover:bg-brand-700 active:scale-[0.98] transition shadow-sm flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
          Nova Consulta
        </button>

        {/* Consultation history */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Consultas ({consultations.length})
        </h3>

        {consultations.length === 0 ? (
          <p className="text-sm text-gray-300 text-center py-6">Nenhuma consulta registrada</p>
        ) : (
          <div className="space-y-2">
            {consultations.map((c) => (
              <div key={c.id} onClick={() => handleClickConsultation(c)}
                className={`bg-white rounded-xl border border-gray-100 p-3.5 transition ${c.status === 'completed' ? 'cursor-pointer hover:border-brand-200 active:scale-[0.99]' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'completed' ? 'bg-brand-100 text-brand-700' :
                    c.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {c.status === 'completed' ? 'Concluída' : c.status === 'error' ? 'Erro' : c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-800 font-medium line-clamp-1">
                  {c.patient_summary || 'Consulta sem resumo'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
