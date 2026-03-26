const BASE = '/api';

export async function createConsultation(doctorName, doctorCrm) {
  const res = await fetch(`${BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_name: doctorName, doctor_crm: doctorCrm }),
  });
  return res.json();
}

export async function transcribe(consultationId, audioBlob) {
  // Convert blob to base64 for serverless (no filesystem)
  const buffer = await audioBlob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  const res = await fetch(`${BASE}/consultations/${consultationId}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, mimeType: audioBlob.type }),
  });
  return res.json();
}

export async function analyze(consultationId) {
  const res = await fetch(`${BASE}/consultations/${consultationId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function getConsultations() {
  const res = await fetch(`${BASE}/consultations`);
  return res.json();
}

export async function getConsultation(id) {
  const res = await fetch(`${BASE}/consultations/${id}`);
  return res.json();
}

export async function updateConsultation(id, data) {
  const res = await fetch(`${BASE}/consultations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function exportPdf(id) {
  const res = await fetch(`${BASE}/consultations/${id}/export-pdf`, { method: 'POST' });
  return res.blob();
}
