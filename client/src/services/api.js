const BASE = '/api';

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error('Sem conexão com o servidor. Verifique sua internet.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Erro do servidor (${res.status}). Tente novamente.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return data;
}

export async function createConsultation(doctorName, doctorCrm, sessionTitle) {
  return request(`${BASE}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctor_name: doctorName,
      doctor_crm: doctorCrm,
      session_title: sessionTitle || null,
    }),
  });
}

export async function transcribe(consultationId, audioBlob, duration) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('duration', String(duration || 0));

  let res;
  try {
    res = await fetch(`${BASE}/consultations/${consultationId}/transcribe`, {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    throw new Error('Falha ao enviar áudio. Verifique sua conexão.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Erro do servidor (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro na transcrição (${res.status})`);
  }
  return data;
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

export async function deleteConsultation(id) {
  return request(`${BASE}/consultations/${id}`, { method: 'DELETE' });
}

export async function exportPdf(id) {
  const res = await fetch(`${BASE}/consultations/${id}/export-pdf`, { method: 'POST' });
  if (!res.ok) throw new Error('Falha ao gerar PDF');
  return res.blob();
}
