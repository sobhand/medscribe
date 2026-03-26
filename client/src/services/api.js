const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return data;
}

export async function createConsultation(doctorName, doctorCrm) {
  return request(`${BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_name: doctorName, doctor_crm: doctorCrm }),
  });
}

export async function transcribe(consultationId, audioBlob, duration) {
  // Convert blob to base64
  const buffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);

  return request(`${BASE}/consultations/${consultationId}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, mimeType: audioBlob.type, duration }),
  });
}

export async function analyze(consultationId) {
  return request(`${BASE}/consultations/${consultationId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getConsultations() {
  return request(`${BASE}/consultations`);
}

export async function getConsultation(id) {
  return request(`${BASE}/consultations/${id}`);
}

export async function updateConsultation(id, data) {
  return request(`${BASE}/consultations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function exportPdf(id) {
  const res = await fetch(`${BASE}/consultations/${id}/export-pdf`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Falha ao gerar PDF');
  }
  return res.blob();
}
