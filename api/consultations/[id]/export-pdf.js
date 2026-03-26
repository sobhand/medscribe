import { getDb } from '../../lib/db.js';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { id } = req.query;
  const sql = getDb();

  const rows = await sql`SELECT * FROM consultations WHERE id = ${id}`;
  if (rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });

  const row = rows[0];
  const anamnesis = row.anamnesis || null;
  const hypotheses = row.hypotheses || [];
  const exams = row.exams || [];
  const treatment = row.treatment || null;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=consulta-${row.id.slice(0, 8)}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('Laudi — Relatório de Consulta', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica')
    .text(`Médico: Dr(a). ${row.doctor_name} — CRM: ${row.doctor_crm}`, { align: 'center' });
  doc.text(`Data: ${new Date(row.created_at).toLocaleDateString('pt-BR')}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
  doc.moveDown(1);

  if (row.patient_summary) {
    doc.fontSize(11).font('Helvetica-Bold').text('Resumo: ', { continued: true });
    doc.font('Helvetica').text(row.patient_summary);
    doc.moveDown(1);
  }

  if (anamnesis) {
    doc.fontSize(14).font('Helvetica-Bold').text('Anamnese');
    doc.moveDown(0.5);
    const fields = [
      ['Queixa Principal', anamnesis.chief_complaint],
      ['História da Doença Atual', anamnesis.history_present_illness],
      ['Antecedentes Pessoais', anamnesis.past_medical_history],
      ['Antecedentes Familiares', anamnesis.family_history],
      ['Hábitos de Vida', anamnesis.lifestyle_habits],
      ['Revisão de Sistemas', anamnesis.review_of_systems],
      ['Exame Físico (mencionado)', anamnesis.physical_exam_mentions],
    ];
    for (const [label, value] of fields) {
      if (value && value !== 'Não mencionado na consulta') {
        doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
        doc.moveDown(0.3);
      }
    }
    doc.moveDown(0.5);
  }

  if (hypotheses.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Hipóteses Diagnósticas (Sugestão IA)');
    doc.moveDown(0.5);
    for (const h of hypotheses) {
      doc.fontSize(11).font('Helvetica-Bold').text(`• ${h.diagnosis}`, { continued: true });
      if (h.icd10) doc.font('Helvetica').text(` (${h.icd10})`, { continued: true });
      doc.text(` — Probabilidade: ${h.probability}`);
      if (h.justification) doc.font('Helvetica').text(`  ${h.justification}`);
      doc.moveDown(0.3);
    }
    doc.moveDown(0.5);
  }

  if (exams.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Exames Complementares Sugeridos (Sugestão IA)');
    doc.moveDown(0.5);
    for (const e of exams) {
      doc.fontSize(11).font('Helvetica-Bold').text(`• ${e.exam}`);
      if (e.justification) doc.font('Helvetica').text(`  Justificativa: ${e.justification}`);
      doc.moveDown(0.3);
    }
    doc.moveDown(0.5);
  }

  if (treatment) {
    doc.fontSize(14).font('Helvetica-Bold').text('Conduta / Tratamento (Sugestão IA)');
    doc.moveDown(0.5);
    if (treatment.medications) {
      doc.fontSize(11).font('Helvetica-Bold').text('Medicamentos: ', { continued: true });
      doc.font('Helvetica').text(treatment.medications);
      doc.moveDown(0.3);
    }
    if (treatment.non_pharmacological) {
      doc.fontSize(11).font('Helvetica-Bold').text('Orientações: ', { continued: true });
      doc.font('Helvetica').text(treatment.non_pharmacological);
      doc.moveDown(0.3);
    }
    if (treatment.follow_up) {
      doc.fontSize(11).font('Helvetica-Bold').text('Retorno: ', { continued: true });
      doc.font('Helvetica').text(treatment.follow_up);
      doc.moveDown(0.3);
    }
    doc.moveDown(0.5);
  }

  if (row.transcription) {
    doc.fontSize(14).font('Helvetica-Bold').text('Transcrição da Consulta');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(row.transcription, { lineGap: 2 });
  }

  doc.moveDown(2);
  doc.fontSize(8).font('Helvetica').fillColor('#999999')
    .text('Documento gerado por Laudi. Hipóteses diagnósticas, exames e conduta são sugestões de IA e devem ser revisadas pelo médico responsável.', { align: 'center' });

  doc.end();
}
