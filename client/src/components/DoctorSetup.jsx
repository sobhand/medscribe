import { useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import LaudiLogo from './LaudiLogo';

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
    <div className="min-h-[100dvh] flex items-center justify-center px-5 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <LaudiLogo size="lg" />
          <p className="text-gray-400 text-sm mt-3">Documentação clínica inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr(a). Maria Silva"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">CRM</label>
            <input
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="123456/SP"
              className="w-full px-4 py-3.5 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-surface focus:bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !crm.trim()}
            className="w-full py-4 bg-brand-600 text-white text-base font-semibold rounded-2xl hover:bg-brand-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            Começar a usar
          </button>
        </form>
      </div>
    </div>
  );
}
