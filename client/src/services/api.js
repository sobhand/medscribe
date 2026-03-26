const BASE = '/api';

export async function createConsultation(doctorName, doctorCrm) {
  const res = await fetch(`${BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_name: doctorName, doctor_crm: doctorCrm }),
  });
  return res.json();
}

export async function uploadAudio(consultationId, audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const res = await fetch(`${BASE}/consultations/${consultationId}/audio`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function transcribe(consultationId, audioPath) {
  const res = await fetch(`${BASE}/consultations/${consultationId}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioPath }),
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
