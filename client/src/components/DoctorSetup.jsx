import { useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';

export default function DoctorSetup() {
  const [name, setName] = useState('');
  const [crm, setCrm] = useState('');
  const setDoctor = useConsultationStore((s) => s.setDoctor);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && crm.trim()) {
      setDoctor(name.trim(), crm.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">MedScribe</h1>
          <p className="text-gray-500 text-lg">Documentação clínica inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr(a). Maria Silva"
              className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CRM
            </label>
            <input
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="123456/SP"
              className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !crm.trim()}
            className="w-full py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Começar a usar
          </button>
        </form>
      </div>
    </div>
  );
}
