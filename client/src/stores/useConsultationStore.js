import { create } from 'zustand';

const PROCESSING_STEPS = [
  { key: 'create', label: 'Criando consulta...', done: false },
  { key: 'transcribe', label: 'Transcrevendo consulta...', done: false },
  { key: 'analyze', label: 'Analisando conteúdo clínico...', done: false },
  { key: 'complete', label: 'Gerando documentação...', done: false },
];

const useConsultationStore = create((set) => ({
  screen: localStorage.getItem('doctor_name') ? 'home' : 'setup',

  doctorName: localStorage.getItem('doctor_name') || '',
  doctorCrm: localStorage.getItem('doctor_crm') || '',

  currentConsultationId: null,
  currentConsultation: null,

  processingSteps: PROCESSING_STEPS.map((s) => ({ ...s })),

  consultations: [],

  error: null,

  setDoctor: (name, crm) => {
    localStorage.setItem('doctor_name', name);
    localStorage.setItem('doctor_crm', crm);
    set({ doctorName: name, doctorCrm: crm, screen: 'home' });
  },

  setScreen: (screen) => set({ screen, error: null }),

  setCurrentConsultationId: (id) => set({ currentConsultationId: id }),

  setCurrentConsultation: (data) => set({ currentConsultation: data }),

  setConsultations: (list) => set({ consultations: list }),

  markProcessingStep: (key) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((s) =>
        s.key === key ? { ...s, done: true } : s
      ),
    })),

  resetProcessingSteps: () =>
    set({
      processingSteps: PROCESSING_STEPS.map((s) => ({ ...s })),
    }),

  setError: (error) => set({ error }),
}));

export default useConsultationStore;
