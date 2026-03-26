import { useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import EditableCard from './EditableCard';
import { FEATURES } from '../config/features';
import { updateConsultation, exportPdf } from '../services/api';

export default function ResultsScreen() {
  const { currentConsultation, currentConsultationId, setScreen, resetProcessingSteps } =
    useConsultationStore();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setExporting(true);
    try {
      const blob = await exportPdf(currentConsultationId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consulta-${currentConsultationId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setExporting(false);
    }
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setScreen('home')}
            className="text-primary-600 font-medium flex items-center gap-0.5 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Início
          </button>

          <div className="flex items-center gap-1.5">
            {FEATURES.PDF_EXPORT && (
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="px-3 py-2 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:scale-95 transition font-medium disabled:opacity-50"
              >
                {exporting ? 'Gerando...' : 'PDF'}
              </button>
            )}
            <button
              onClick={handleCopyAll}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition font-medium"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={handleNewConsultation}
              className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition font-medium"
            >
              Nova
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-3">
        {/* Patient summary */}
        {c.patient_summary && (
          <div className="bg-primary-50 rounded-2xl px-4 py-3.5">
            <p className="text-primary-800 font-medium text-base leading-snug">{c.patient_summary}</p>
            <p className="text-primary-500 text-xs mt-1.5">
              {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {/* Transcription */}
        {FEATURES.TRANSCRIPTION && c.transcription && (
          <TranscriptionCard transcription={c.transcription} consultationId={currentConsultationId} />
        )}

        {/* Anamnesis */}
        {FEATURES.ANAMNESIS && Object.keys(anamnesis).length > 0 && (
          <AnamnesisCard anamnesis={anamnesis} consultationId={currentConsultationId} />
        )}

        {/* Diagnostic Hypotheses */}
        {FEATURES.DIAGNOSTIC_HYPOTHESES && hypotheses.length > 0 && (
          <HypothesesCard hypotheses={hypotheses} />
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
              className="w-full min-h-[160px] p-3 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setText(transcription); setEditing(false); }} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={save} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
            <button onClick={() => setEditing(true)} className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">Editar</button>
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

  const saveField = async () => {
    await updateConsultation(consultationId, { anamnesis: values });
    setEditingField(null);
  };

  return (
    <EditableCard title="Anamnese" icon="📋" defaultExpanded={true}>
      <div className="mt-3 space-y-3.5">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value || value === 'Não mencionado na consulta') return null;

          return (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
              {editingField === key ? (
                <>
                  <textarea
                    value={values[key]}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className="w-full min-h-[70px] p-3 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={saveField} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => setEditingField(key)}
                  className="text-gray-700 text-sm leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 -m-1.5 transition"
                >
                  {value}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </EditableCard>
  );
}

function HypothesesCard({ hypotheses }) {
  const [items, setItems] = useState(hypotheses.map((h) => ({ ...h, accepted: null })));

  const probColor = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    baixa: 'bg-green-100 text-green-700',
  };

  return (
    <EditableCard title="Hipóteses Diagnósticas" icon="🔍" defaultExpanded={true} badge="Sugestão IA">
      <div className="mt-3 space-y-2.5">
        {items.map((h, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3.5 transition ${
              h.accepted === true ? 'border-green-300 bg-green-50' :
              h.accepted === false ? 'border-red-200 bg-red-50/50 opacity-50' :
              'border-gray-100 bg-gray-50/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{h.diagnosis}</span>
                  {h.icd10 && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">{h.icd10}</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${probColor[h.probability] || 'bg-gray-100 text-gray-600'}`}>
                    {h.probability}
                  </span>
                </div>
                {h.justification && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{h.justification}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    const updated = [...items];
                    updated[i] = { ...h, accepted: h.accepted === true ? null : true };
                    setItems(updated);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    h.accepted === true ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const updated = [...items];
                    updated[i] = { ...h, accepted: h.accepted === false ? null : false };
                    setItems(updated);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    h.accepted === false ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
      <div className="mt-3 space-y-2.5">
        {items.map((e, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={e.checked}
              onChange={() => {
                const updated = [...items];
                updated[i] = { ...e, checked: !e.checked };
                setItems(updated);
              }}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 text-sm">{e.exam}</span>
              {e.justification && <p className="text-xs text-gray-500 mt-0.5">{e.justification}</p>}
              {e.related_hypothesis && (
                <p className="text-[11px] text-primary-600 mt-0.5">Hipótese: {e.related_hypothesis}</p>
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
    <EditableCard title="Conduta / Tratamento" icon="💊" defaultExpanded={true} badge="Sugestão IA">
      <div className="mt-3 space-y-3.5">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value) return null;
          return (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
              {editing ? (
                <textarea
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  className="w-full min-h-[70px] p-3 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
              )}
            </div>
          );
        })}
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <button onClick={() => { setValues(treatment); setEditing(false); }} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={save} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Editar</button>
          )}
        </div>
      </div>
    </EditableCard>
  );
}
