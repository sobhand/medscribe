import { create } from 'zustand';

const useConsultationStore = create((set) => ({
  // Current screen: 'setup' | 'home' | 'recording' | 'processing' | 'results'
  screen: localStorage.getItem('doctor_name') ? 'home' : 'setup',

  // Doctor info
  doctorName: localStorage.getItem('doctor_name') || '',
  doctorCrm: localStorage.getItem('doctor_crm') || '',

  // Current consultation
  currentConsultationId: null,
  currentConsultation: null,

  // Processing steps
  processingSteps: [
    { key: 'upload', label: 'Enviando áudio...', done: false },
    { key: 'transcribe', label: 'Transcrevendo consulta...', done: false },
    { key: 'analyze', label: 'Analisando conteúdo clínico...', done: false },
    { key: 'complete', label: 'Gerando documentação...', done: false },
  ],

  // Consultations list
  consultations: [],

  // Error state
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
      processingSteps: [
        { key: 'upload', label: 'Enviando áudio...', done: false },
        { key: 'transcribe', label: 'Transcrevendo consulta...', done: false },
        { key: 'analyze', label: 'Analisando conteúdo clínico...', done: false },
        { key: 'complete', label: 'Gerando documentação...', done: false },
      ],
    }),

  setError: (error) => set({ error }),
}));

export default useConsultationStore;
