import { useState, useCallback } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import EditableCard from './EditableCard';
import { FEATURES } from '../config/features';
import { updateConsultation, exportPdf } from '../services/api';

export default function ResultsScreen() {
  const { currentConsultation, currentConsultationId, setScreen, setCurrentConsultation, resetProcessingSteps } =
    useConsultationStore();

  const c = currentConsultation;
  if (!c) return null;

  const anamnesis = c.anamnesis || {};
  const hypotheses = c.hypotheses || [];
  const exams = c.exams || [];
  const treatment = typeof c.treatment === 'string' ? { medications: c.treatment } : c.treatment || {};

  const handleNewConsultation = () => {
    resetProcessingSteps();
    setScreen('recording');
  };

  const handleExportPdf = async () => {
    const blob = await exportPdf(currentConsultationId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta-${currentConsultationId.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    const sections = [];
    if (c.patient_summary) sections.push(`RESUMO: ${c.patient_summary}`);
    if (anamnesis.chief_complaint) sections.push(`\nQUEIXA PRINCIPAL: ${anamnesis.chief_complaint}`);
    if (anamnesis.history_present_illness) sections.push(`HDA: ${anamnesis.history_present_illness}`);
    if (anamnesis.past_medical_history) sections.push(`ANTECEDENTES PESSOAIS: ${anamnesis.past_medical_history}`);
    if (anamnesis.family_history) sections.push(`ANTECEDENTES FAMILIARES: ${anamnesis.family_history}`);
    if (anamnesis.lifestyle_habits) sections.push(`HÁBITOS DE VIDA: ${anamnesis.lifestyle_habits}`);
    if (anamnesis.review_of_systems) sections.push(`REVISÃO DE SISTEMAS: ${anamnesis.review_of_systems}`);
    if (anamnesis.physical_exam_mentions) sections.push(`EXAME FÍSICO: ${anamnesis.physical_exam_mentions}`);
    if (hypotheses.length) {
      sections.push('\nHIPÓTESES DIAGNÓSTICAS (Sugestão IA):');
      hypotheses.forEach((h) => sections.push(`- ${h.diagnosis} (${h.icd10}) — ${h.probability} — ${h.justification}`));
    }
    if (exams.length) {
      sections.push('\nEXAMES SUGERIDOS (Sugestão IA):');
      exams.forEach((e) => sections.push(`- ${e.exam}: ${e.justification}`));
    }
    if (treatment.medications) sections.push(`\nMEDICAMENTOS (Sugestão IA): ${treatment.medications}`);
    if (treatment.non_pharmacological) sections.push(`ORIENTAÇÕES: ${treatment.non_pharmacological}`);
    if (treatment.follow_up) sections.push(`RETORNO: ${treatment.follow_up}`);

    navigator.clipboard.writeText(sections.join('\n'));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setScreen('home')}
            className="text-primary-600 font-medium flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Início
          </button>

          <div className="flex items-center gap-2">
            {FEATURES.PDF_EXPORT && (
              <button
                onClick={handleExportPdf}
                className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Exportar PDF
              </button>
            )}
            <button
              onClick={handleCopyAll}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Copiar Tudo
            </button>
            <button
              onClick={handleNewConsultation}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Nova Consulta
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {/* Patient summary */}
        {c.patient_summary && (
          <div className="bg-primary-50 rounded-2xl px-5 py-4">
            <p className="text-primary-800 font-medium text-lg">{c.patient_summary}</p>
            <p className="text-primary-600 text-sm mt-1">
              {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {/* Transcription */}
        {FEATURES.TRANSCRIPTION && c.transcription && (
          <TranscriptionCard transcription={c.transcription} consultationId={currentConsultationId} />
        )}

        {/* Anamnesis */}
        {FEATURES.ANAMNESIS && (
          <AnamnesisCard anamnesis={anamnesis} consultationId={currentConsultationId} />
        )}

        {/* Diagnostic Hypotheses */}
        {FEATURES.DIAGNOSTIC_HYPOTHESES && hypotheses.length > 0 && (
          <HypothesesCard hypotheses={hypotheses} consultationId={currentConsultationId} />
        )}

        {/* Complementary Exams */}
        {FEATURES.COMPLEMENTARY_EXAMS && exams.length > 0 && (
          <ExamsCard exams={exams} />
        )}

        {/* Treatment */}
        {FEATURES.TREATMENT_SUGGESTION && (treatment.medications || treatment.non_pharmacological || treatment.follow_up) && (
          <TreatmentCard treatment={treatment} consultationId={currentConsultationId} />
        )}
      </div>
    </div>
  );
}

function TranscriptionCard({ transcription, consultationId }) {
  const [text, setText] = useState(transcription);
  const [editing, setEditing] = useState(false);

  const save = async () => {
    await updateConsultation(consultationId, { transcription: text });
    setEditing(false);
  };

  return (
    <EditableCard title="Transcrição" icon="💬" defaultExpanded={false}>
      <div className="mt-3">
        {editing ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-200 rounded-xl text-base resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={save} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed">{text}</p>
            <button onClick={() => setEditing(true)} className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">Editar</button>
          </>
        )}
      </div>
    </EditableCard>
  );
}

function AnamnesisCard({ anamnesis, consultationId }) {
  const fields = [
    { key: 'chief_complaint', label: 'Queixa Principal (QP)' },
    { key: 'history_present_illness', label: 'História da Doença Atual (HDA)' },
    { key: 'past_medical_history', label: 'Antecedentes Pessoais' },
    { key: 'family_history', label: 'Antecedentes Familiares' },
    { key: 'lifestyle_habits', label: 'Hábitos de Vida' },
    { key: 'review_of_systems', label: 'Revisão de Sistemas' },
    { key: 'physical_exam_mentions', label: 'Exame Físico (mencionado)' },
  ];

  const [values, setValues] = useState(anamnesis);
  const [editingField, setEditingField] = useState(null);

  const saveField = async (key) => {
    await updateConsultation(consultationId, { anamnesis: values });
    setEditingField(null);
  };

  return (
    <EditableCard title="Anamnese" icon="📋" defaultExpanded={true}>
      <div className="mt-3 space-y-4">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value || value === 'Não mencionado na consulta') return null;

          return (
            <div key={key}>
              <label className="text-sm font-semibold text-gray-600 block mb-1">{label}</label>
              {editingField === key ? (
                <>
                  <textarea
                    value={values[key]}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className="w-full min-h-[80px] p-3 border border-gray-200 rounded-xl text-base resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={() => saveField(key)} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
                  </div>
                </>
              ) : (
                <div className="flex items-start justify-between group">
                  <p className="text-gray-700 text-base leading-relaxed flex-1">{value}</p>
                  <button
                    onClick={() => setEditingField(key)}
                    className="ml-2 text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition font-medium flex-shrink-0"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </EditableCard>
  );
}

function HypothesesCard({ hypotheses, consultationId }) {
  const [items, setItems] = useState(hypotheses.map((h) => ({ ...h, accepted: null })));

  const probColor = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    baixa: 'bg-green-100 text-green-700',
  };

  return (
    <EditableCard title="Hipóteses Diagnósticas" icon="🔍" defaultExpanded={true} badge="Sugestão IA">
      <div className="mt-3 space-y-3">
        {items.map((h, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 transition ${
              h.accepted === true ? 'border-green-300 bg-green-50' :
              h.accepted === false ? 'border-red-200 bg-red-50 opacity-60' :
              'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{h.diagnosis}</span>
                  {h.icd10 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{h.icd10}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${probColor[h.probability] || 'bg-gray-100 text-gray-600'}`}>
                    {h.probability}
                  </span>
                </div>
                {h.justification && (
                  <p className="text-sm text-gray-600 mt-1">{h.justification}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <button
                  onClick={() => {
                    const updated = [...items];
                    updated[i] = { ...h, accepted: h.accepted === true ? null : true };
                    setItems(updated);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    h.accepted === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const updated = [...items];
                    updated[i] = { ...h, accepted: h.accepted === false ? null : false };
                    setItems(updated);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    h.accepted === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EditableCard>
  );
}

function ExamsCard({ exams }) {
  const [items, setItems] = useState(exams.map((e) => ({ ...e, checked: false })));

  return (
    <EditableCard title="Exames Complementares" icon="🧪" defaultExpanded={true} badge="Sugestão IA">
      <div className="mt-3 space-y-3">
        {items.map((e, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={e.checked}
              onChange={() => {
                const updated = [...items];
                updated[i] = { ...e, checked: !e.checked };
                setItems(updated);
              }}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-800">{e.exam}</span>
              {e.justification && <p className="text-sm text-gray-500 mt-0.5">{e.justification}</p>}
              {e.related_hypothesis && (
                <p className="text-xs text-primary-600 mt-0.5">Hipótese: {e.related_hypothesis}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </EditableCard>
  );
}

function TreatmentCard({ treatment, consultationId }) {
  const [values, setValues] = useState(treatment);
  const [editing, setEditing] = useState(false);

  const save = async () => {
    await updateConsultation(consultationId, { treatment: values });
    setEditing(false);
  };

  const fields = [
    { key: 'medications', label: 'Medicamentos' },
    { key: 'non_pharmacological', label: 'Orientações' },
    { key: 'follow_up', label: 'Retorno / Acompanhamento' },
  ];

  return (
    <EditableCard title="Conduta / Tratamento" icon="💊" defaultExpanded={true} badge="Sugestão IA — revise antes de adotar">
      <div className="mt-3 space-y-4">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value) return null;
          return (
            <div key={key}>
              <label className="text-sm font-semibold text-gray-600 block mb-1">{label}</label>
              {editing ? (
                <textarea
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  className="w-full min-h-[80px] p-3 border border-gray-200 rounded-xl text-base resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-700 text-base leading-relaxed">{value}</p>
              )}
            </div>
          );
        })}
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={save} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Editar</button>
          )}
        </div>
      </div>
    </EditableCard>
  );
}
