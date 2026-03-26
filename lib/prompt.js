export const CLINICAL_PROMPT = `Você é um assistente médico especializado em documentação clínica. Recebeu a transcrição de uma consulta médica. Sua tarefa é extrair e estruturar as informações clínicas.

IMPORTANTE:
- Extraia SOMENTE informações presentes na transcrição
- NÃO invente dados que não foram mencionados
- Se um campo não foi abordado na consulta, marque como "Não mencionado na consulta"
- Hipóteses diagnósticas e tratamento são SUGESTÕES — marque explicitamente como tal
- Use terminologia médica precisa com CID-10 quando aplicável

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem explicações) com esta estrutura:

{
  "patient_summary": "Resumo de 1 linha da consulta (max 100 chars)",
  "transcription_speakers": [
    {"speaker": "medico|paciente|acompanhante", "text": "fala transcrita"}
  ],
  "anamnesis": {
    "chief_complaint": "Queixa principal",
    "history_present_illness": "HDA detalhada",
    "past_medical_history": "Antecedentes pessoais",
    "family_history": "Antecedentes familiares",
    "lifestyle_habits": "Hábitos de vida",
    "review_of_systems": "Revisão de sistemas",
    "physical_exam_mentions": "Achados de exame físico mencionados verbalmente"
  },
  "diagnostic_hypotheses": [
    {
      "diagnosis": "Nome do diagnóstico",
      "icd10": "Código CID-10",
      "probability": "alta|media|baixa",
      "justification": "Justificativa baseada nos achados"
    }
  ],
  "complementary_exams": [
    {
      "exam": "Nome do exame",
      "tuss_code": "Código TUSS do exame (tabela TUSS da ANS, ex: 40301630 para hemograma)",
      "justification": "Por que solicitar",
      "related_hypothesis": "Hipótese que justifica"
    }
  ],
  "treatment": {
    "medications": "Medicamentos sugeridos com posologia",
    "non_pharmacological": "Orientações não farmacológicas",
    "follow_up": "Recomendação de retorno/acompanhamento"
  },
  "patient_record_updates": {
    "new_conditions": [{"condition": "nome", "icd10": "código"}],
    "new_allergies": ["alergia identificada na consulta"],
    "medication_changes": [{"action": "add|remove|modify", "name": "medicamento", "dose": "dose", "frequency": "frequência"}]
  }
}`;

function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}

export function buildContextualPrompt(patient, previousConsultations, specialty) {
  let prompt = CLINICAL_PROMPT;

  if (specialty) {
    prompt += `\n\nESPECIALIDADE DO MÉDICO: ${specialty}
Considere esta especialidade ao formular hipóteses diagnósticas e sugestões de exames. Priorize diagnósticos e condutas relevantes para esta área.`;
  }

  if (patient) {
    prompt += `\n\nDADOS DO PACIENTE (prontuário):`;
    prompt += `\n- Nome: ${patient.name}`;
    if (patient.date_of_birth) {
      prompt += `\n- Idade: ${calculateAge(patient.date_of_birth)} anos`;
    }
    if (patient.sex) prompt += `\n- Sexo: ${patient.sex}`;
    if (patient.blood_type) prompt += `\n- Tipo sanguíneo: ${patient.blood_type}`;

    const allergies = patient.allergies || [];
    if (allergies.length > 0) {
      prompt += `\n- ⚠️ ALERGIAS: ${allergies.join(', ')}`;
      prompt += `\n  IMPORTANTE: Considere estas alergias ao sugerir medicamentos!`;
    }

    const conditions = patient.chronic_conditions || [];
    if (conditions.length > 0) {
      prompt += `\n- Condições crônicas: ${conditions.map((c) => c.condition + (c.icd10 ? ` (${c.icd10})` : '')).join(', ')}`;
    }

    const meds = patient.current_medications || [];
    if (meds.length > 0) {
      prompt += `\n- Medicamentos em uso: ${meds.map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` ${m.frequency}` : ''}`).join('; ')}`;
      prompt += `\n  Considere interações medicamentosas ao sugerir novos medicamentos.`;
    }
  }

  if (previousConsultations && previousConsultations.length > 0) {
    prompt += `\n\nHISTÓRICO DE CONSULTAS ANTERIORES (${previousConsultations.length} mais recentes):`;

    previousConsultations.forEach((pc, i) => {
      const date = new Date(pc.created_at).toLocaleDateString('pt-BR');
      prompt += `\n\n--- Consulta ${i + 1} (${date}) ---`;
      prompt += `\nResumo: ${pc.patient_summary || 'Sem resumo'}`;

      const anamnesis = pc.anamnesis || {};
      if (anamnesis.chief_complaint) prompt += `\nQP: ${anamnesis.chief_complaint}`;

      const hypotheses = pc.hypotheses || [];
      if (hypotheses.length > 0) {
        prompt += `\nHipóteses: ${hypotheses.map((h) => h.diagnosis).join(', ')}`;
      }

      const treatment = pc.treatment || {};
      if (treatment.medications) prompt += `\nConduta: ${treatment.medications}`;
      if (treatment.follow_up) prompt += `\nRetorno: ${treatment.follow_up}`;
    });

    prompt += `\n\nUse este histórico para contextualizar a consulta atual. Identifique se é um retorno/seguimento ou queixa nova. Compare evolução de sintomas quando relevante.`;
  }

  return prompt;
}
