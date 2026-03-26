const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(url, options = {}) {
  // Inject auth header
  options.headers = { ...authHeaders(), ...options.headers };

  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error('Sem conexão com o servidor. Verifique sua internet.');
  }

  if (res.status === 401) {
    // Token expired — force re-login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Sessão expirada. Faça login novamente.');
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

export async function createConsultation(doctorName, doctorCrm, patientId) {
  return request(`${BASE}/consultations`, {
    method: 'POST',
    body: JSON.stringify({
      doctor_name: doctorName,
      doctor_crm: doctorCrm,
      patient_id: patientId || null,
    }),
  });
}

// Patient API
export async function getPatients(search) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`${BASE}/patients${q}`);
}

export async function getPatient(id) {
  return request(`${BASE}/patients/${id}`);
}

export async function createPatient(data) {
  return request(`${BASE}/patients`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePatient(id, data) {
  return request(`${BASE}/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePatient(id) {
  return request(`${BASE}/patients/${id}`, { method: 'DELETE' });
}

export async function getPatientConsultations(patientId) {
  return request(`${BASE}/patients/${patientId}/consultations`);
}

export async function transcribe(consultationId, audioBlob, duration) {
  const buffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const audioBase64 = btoa(binary);

  return request(`${BASE}/consultations/${consultationId}/transcribe`, {
    method: 'POST',
    body: JSON.stringify({
      audioBase64,
      mimeType: audioBlob.type,
      duration: duration || 0,
    }),
  });
}

export async function analyze(consultationId) {
  return request(`${BASE}/consultations/${consultationId}/analyze`, {
    method: 'POST',
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
    body: JSON.stringify(data),
  });
}

export async function deleteConsultation(id) {
  return request(`${BASE}/consultations/${id}`, { method: 'DELETE' });
}

export async function exportPdf(id) {
  const token = getToken();
  const res = await fetch(`${BASE}/consultations/${id}/export-pdf`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Falha ao gerar PDF');
  return res.blob();
}
