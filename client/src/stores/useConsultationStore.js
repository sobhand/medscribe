import { create } from 'zustand';

const PROCESSING_STEPS = [
  { key: 'create', label: 'Criando consulta...', done: false, error: null },
  { key: 'transcribe', label: 'Transcrevendo consulta...', done: false, error: null },
  { key: 'analyze', label: 'Analisando conteúdo clínico...', done: false, error: null },
  { key: 'complete', label: 'Finalizando documentação...', done: false, error: null },
];

const useConsultationStore = create((set) => ({
  // Screen: 'home' | 'patient-detail' | 'patient-form' | 'recording' | 'processing' | 'results'
  screen: 'home',

  doctorName: '',
  doctorCrm: '',

  // Patient
  currentPatientId: null,
  currentPatient: null,
  patients: [],

  // Consultation
  currentConsultationId: null,
  currentConsultation: null,
  processingSteps: PROCESSING_STEPS.map((s) => ({ ...s })),

  error: null,

  setDoctor: (name, crm) => {
    set({ doctorName: name, doctorCrm: crm });
  },

  setScreen: (screen) => set({ screen, error: null }),

  setCurrentPatientId: (id) => set({ currentPatientId: id }),
  setCurrentPatient: (data) => set({ currentPatient: data }),
  setPatients: (list) => set({ patients: list }),

  setCurrentConsultationId: (id) => set({ currentConsultationId: id }),
  setCurrentConsultation: (data) => set({ currentConsultation: data }),

  markProcessingStep: (key) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((s) =>
        s.key === key ? { ...s, done: true, error: null } : s
      ),
    })),

  failProcessingStep: (key, errorMsg) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((s) =>
        s.key === key ? { ...s, error: errorMsg } : s
      ),
    })),

  resetProcessingSteps: () =>
    set({ processingSteps: PROCESSING_STEPS.map((s) => ({ ...s })) }),

  setError: (error) => set({ error }),
}));

export default useConsultationStore;
