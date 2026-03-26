import { useState } from 'react';
import useConsultationStore from '../stores/useConsultationStore';
import EditableCard from './EditableCard';
import LaudiLogo from './LaudiLogo';
import { FEATURES } from '../config/features';
import { updateConsultation, exportPdf } from '../services/api';

export default function ResultsScreen() {
  const { currentConsultation, currentConsultationId, setScreen, setCurrentConsultation, resetProcessingSteps } =
    useConsultationStore();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const c = currentConsultation;
  if (!c) return null;

  const anamnesis = c.anamnesis || {};
  const hypotheses = c.hypotheses || [];
  const exams = c.exams || [];
  const treatment = typeof c.treatment === 'string' ? { medications: c.treatment } : c.treatment || {};

  const [title, setTitle] = useState(c.session_title || '');
  const [editingTitle, setEditingTitle] = useState(false);

  const saveTitle = async () => {
    await updateConsultation(currentConsultationId, { session_title: title });
    setEditingTitle(false);
  };

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
      console.error('PDF error:', e);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyAll = () => {
    const s = [];
    if (c.patient_summary) s.push(`RESUMO: ${c.patient_summary}`);
    if (anamnesis.chief_complaint) s.push(`\nQP: ${anamnesis.chief_complaint}`);
    if (anamnesis.history_present_illness) s.push(`HDA: ${anamnesis.history_present_illness}`);
    if (anamnesis.past_medical_history) s.push(`AP: ${anamnesis.past_medical_history}`);
    if (anamnesis.family_history) s.push(`AF: ${anamnesis.family_history}`);
    if (anamnesis.lifestyle_habits) s.push(`HÁBITOS: ${anamnesis.lifestyle_habits}`);
    if (anamnesis.review_of_systems) s.push(`RS: ${anamnesis.review_of_systems}`);
    if (anamnesis.physical_exam_mentions) s.push(`EF: ${anamnesis.physical_exam_mentions}`);
    if (hypotheses.length) {
      s.push('\nHIPÓTESES (Sugestão IA):');
      hypotheses.forEach((h) => s.push(`- ${h.diagnosis} (${h.icd10}) — ${h.probability}`));
    }
    if (exams.length) {
      s.push('\nEXAMES (Sugestão IA):');
      exams.forEach((e) => s.push(`- ${e.exam}: ${e.justification}`));
    }
    if (treatment.medications) s.push(`\nMEDICAMENTOS: ${treatment.medications}`);
    if (treatment.non_pharmacological) s.push(`ORIENTAÇÕES: ${treatment.non_pharmacological}`);
    if (treatment.follow_up) s.push(`RETORNO: ${treatment.follow_up}`);
    navigator.clipboard.writeText(s.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setScreen('home')}
            className="text-brand-600 font-medium flex items-center gap-0.5 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Início
          </button>
          <div className="flex items-center gap-1.5">
            {FEATURES.PDF_EXPORT && (
              <button onClick={handleExportPdf} disabled={exporting}
                className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 active:scale-95 transition font-medium disabled:opacity-50">
                {exporting ? '...' : 'PDF'}
              </button>
            )}
            <button onClick={handleCopyAll}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition font-medium">
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button onClick={handleNewConsultation}
              className="px-3 py-1.5 text-xs bg-accent-500 text-white rounded-lg hover:bg-accent-600 active:scale-95 transition font-medium">
              Nova
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-3">
        {/* Session title */}
        <div className="bg-brand-50 rounded-2xl px-4 py-3.5">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                placeholder="Nome do paciente / sessão"
                autoFocus
              />
              <button onClick={saveTitle} className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg">Salvar</button>
              <button onClick={() => setEditingTitle(false)} className="px-2 py-1.5 text-xs text-gray-500">Cancelar</button>
            </div>
          ) : (
            <div onClick={() => setEditingTitle(true)} className="cursor-pointer">
              <p className="text-brand-800 font-semibold text-base">
                {title || c.patient_summary || 'Toque para adicionar título'}
              </p>
              <p className="text-brand-500 text-xs mt-1">
                {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {c.audio_duration_seconds ? ` · ${Math.floor(c.audio_duration_seconds / 60)}:${String(c.audio_duration_seconds % 60).padStart(2, '0')}` : ''}
              </p>
            </div>
          )}
        </div>

        {FEATURES.TRANSCRIPTION && c.transcription && (
          <TranscriptionCard transcription={c.transcription} consultationId={currentConsultationId} />
        )}
        {FEATURES.ANAMNESIS && Object.keys(anamnesis).length > 0 && (
          <AnamnesisCard anamnesis={anamnesis} consultationId={currentConsultationId} />
        )}
        {FEATURES.DIAGNOSTIC_HYPOTHESES && hypotheses.length > 0 && (
          <HypothesesCard hypotheses={hypotheses} />
        )}
        {FEATURES.COMPLEMENTARY_EXAMS && exams.length > 0 && (
          <ExamsCard exams={exams} />
        )}
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
  const save = async () => { await updateConsultation(consultationId, { transcription: text }); setEditing(false); };

  return (
    <EditableCard title="Transcrição" icon="💬" defaultExpanded={false}>
      <div className="mt-3">
        {editing ? (
          <>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[140px] p-3 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setText(transcription); setEditing(false); }} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={save} className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg">Salvar</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
            <button onClick={() => setEditing(true)} className="mt-2 text-xs text-brand-600 font-medium">Editar</button>
          </>
        )}
      </div>
    </EditableCard>
  );
}

function AnamnesisCard({ anamnesis, consultationId }) {
  const fields = [
    { key: 'chief_complaint', label: 'Queixa Principal' },
    { key: 'history_present_illness', label: 'HDA' },
    { key: 'past_medical_history', label: 'Antecedentes Pessoais' },
    { key: 'family_history', label: 'Antecedentes Familiares' },
    { key: 'lifestyle_habits', label: 'Hábitos de Vida' },
    { key: 'review_of_systems', label: 'Revisão de Sistemas' },
    { key: 'physical_exam_mentions', label: 'Exame Físico' },
  ];
  const [values, setValues] = useState(anamnesis);
  const [editingField, setEditingField] = useState(null);
  const saveField = async () => { await updateConsultation(consultationId, { anamnesis: values }); setEditingField(null); };

  return (
    <EditableCard title="Anamnese" icon="📋" defaultExpanded={true}>
      <div className="mt-3 space-y-3">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value || value === 'Não mencionado na consulta') return null;
          return (
            <div key={key}>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{label}</label>
              {editingField === key ? (
                <>
                  <textarea value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className="w-full min-h-[60px] p-2.5 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => setEditingField(null)} className="px-3 py-1 text-xs text-gray-500">Cancelar</button>
                    <button onClick={saveField} className="px-3 py-1 text-xs bg-brand-600 text-white rounded-lg">Salvar</button>
                  </div>
                </>
              ) : (
                <div onClick={() => setEditingField(key)}
                  className="text-gray-700 text-sm leading-relaxed cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition">
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
      <div className="mt-3 space-y-2">
        {items.map((h, i) => (
          <div key={i} className={`rounded-xl border p-3 transition ${
            h.accepted === true ? 'border-brand-300 bg-brand-50' :
            h.accepted === false ? 'border-red-200 bg-red-50/50 opacity-50' :
            'border-gray-100 bg-gray-50/30'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{h.diagnosis}</span>
                  {h.icd10 && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">{h.icd10}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${probColor[h.probability] || 'bg-gray-100'}`}>
                    {h.probability}
                  </span>
                </div>
                {h.justification && <p className="text-xs text-gray-500 mt-1">{h.justification}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => {
                  const u = [...items]; u[i] = { ...h, accepted: h.accepted === true ? null : true }; setItems(u);
                }} className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  h.accepted === true ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-brand-300'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button onClick={() => {
                  const u = [...items]; u[i] = { ...h, accepted: h.accepted === false ? null : false }; setItems(u);
                }} className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  h.accepted === false ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-red-300'
                }`}>
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
      <div className="mt-3 space-y-2">
        {items.map((e, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-gray-50 transition">
            <input type="checkbox" checked={e.checked} onChange={() => {
              const u = [...items]; u[i] = { ...e, checked: !e.checked }; setItems(u);
            }} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-800 text-sm">{e.exam}</span>
              {e.justification && <p className="text-xs text-gray-500 mt-0.5">{e.justification}</p>}
              {e.related_hypothesis && <p className="text-[11px] text-accent-600 mt-0.5">Hipótese: {e.related_hypothesis}</p>}
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
  const save = async () => { await updateConsultation(consultationId, { treatment: values }); setEditing(false); };
  const fields = [
    { key: 'medications', label: 'Medicamentos' },
    { key: 'non_pharmacological', label: 'Orientações' },
    { key: 'follow_up', label: 'Retorno' },
  ];

  return (
    <EditableCard title="Conduta / Tratamento" icon="💊" defaultExpanded={true} badge="Sugestão IA">
      <div className="mt-3 space-y-3">
        {fields.map(({ key, label }) => {
          const value = values[key];
          if (!value) return null;
          return (
            <div key={key}>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{label}</label>
              {editing ? (
                <textarea value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  className="w-full min-h-[60px] p-2.5 border border-gray-200 rounded-xl text-sm resize-y focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
              )}
            </div>
          );
        })}
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <button onClick={() => { setValues(treatment); setEditing(false); }} className="px-3 py-1 text-xs text-gray-500">Cancelar</button>
              <button onClick={save} className="px-3 py-1 text-xs bg-brand-600 text-white rounded-lg">Salvar</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-brand-600 font-medium">Editar</button>
          )}
        </div>
      </div>
    </EditableCard>
  );
}
