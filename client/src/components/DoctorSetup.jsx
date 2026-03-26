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
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">MedScribe</h1>
          <p className="text-gray-400 text-base">Documentação clínica inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr(a). Maria Silva"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              CRM
            </label>
            <input
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="123456/SP"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !crm.trim()}
            className="w-full py-4 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Começar a usar
          </button>
        </form>
      </div>
    </div>
  );
}
