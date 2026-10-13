import type {
  PatientSearchResponse,
  Patient,
  PatientCreate,
  PatientUpdate,
  ConsultationResponse,
  ConsultationCreate,
  Doctor,
  DailySummaryReport,
  DoctorSummaryReport,
  PatientListReport,
  IPDAdmissionListResponse,
  IPDAdmissionResponse,
  IPDAdmissionCreate,
  IPDAttendantResponse,
} from '../types';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Patients API
export const patientsApi = {
  search: (phone: string) =>
    request<PatientSearchResponse>(`/patients/search?phone=${encodeURIComponent(phone)}`),

  get: (id: number) =>
    request<Patient>(`/patients/${id}`),

  create: (data: PatientCreate) =>
    request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getConsultations: (patientId: number) =>
    request<ConsultationResponse[]>(`/patients/${patientId}/consultations`),

  update: (id: number, data: PatientUpdate) =>
    request<Patient>(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  searchByUhid: (uhid: string) =>
    request<PatientSearchResponse>(`/patients/by-uhid?uhid=${encodeURIComponent(uhid)}`),

  searchByDateRange: (start: string, end: string) =>
    request<PatientSearchResponse>(`/patients/by-date-range?start=${start}&end=${end}`),
};

// Consultations API
export const consultationsApi = {
  create: (data: ConsultationCreate) =>
    request<ConsultationResponse>('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    request<ConsultationResponse>(`/consultations/${id}`),

  getStatus: (id: number) =>
    request<{ consultation_id: number; valid_until: string; is_active: boolean; payment_status: string }>(
      `/consultations/${id}/status`
    ),
};

// Doctors API
export const doctorsApi = {
  list: () =>
    request<Doctor[]>('/doctors'),

  create: (data: { name: string; department: string; consultation_fee: number }) =>
    request<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Reports API
export const reportsApi = {
  dailySummary: (startDate: string, endDate: string) =>
    request<DailySummaryReport>(`/reports/daily-summary?start_date=${startDate}&end_date=${endDate}`),

  doctorSummary: (startDate: string, endDate: string) =>
    request<DoctorSummaryReport>(`/reports/doctor-summary?start_date=${startDate}&end_date=${endDate}`),

  patientList: (startDate: string, endDate: string) =>
    request<PatientListReport>(`/reports/patient-list?start_date=${startDate}&end_date=${endDate}`),
};
// IPD API
export const ipdApi = {
  list: (params?: { status?: string; search?: string; start_date?: string; end_date?: string; discharged_start?: string; discharged_end?: string; view?: string; recent_days?: number; limit?: number }) => {
    const qs: string[] = [];
    if (params) {
      if (params.limit) qs.push(`limit=${params.limit}`); else qs.push('limit=100');
      if (params.status) qs.push(`status=${params.status}`);
      if (params.view) qs.push(`view=${params.view}`);
      if (params.recent_days) qs.push(`recent_days=${params.recent_days}`);
      if (params.search) qs.push(`search=${encodeURIComponent(params.search)}`);
      if (params.start_date) qs.push(`start_date=${params.start_date}`);
      if (params.end_date) qs.push(`end_date=${params.end_date}`);
      if (params.discharged_start) qs.push(`discharged_start=${params.discharged_start}`);
      if (params.discharged_end) qs.push(`discharged_end=${params.discharged_end}`);
    } else {
      qs.push('limit=100');
    }
    return request<IPDAdmissionListResponse>(`/ipd/admissions?${qs.join('&')}`);
  },

  get: (id: number) =>
    request<IPDAdmissionResponse>(`/ipd/admissions/${id}`),

  update: (id: number, data: any) =>
    request<IPDAdmissionResponse>(`/ipd/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  create: (data: IPDAdmissionCreate) =>
    request<IPDAdmissionResponse>('/ipd/admissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAttendant: (admissionId: number) =>
    request<IPDAttendantResponse>(`/ipd/admissions/${admissionId}/attendant`),

  updateAttendant: (admissionId: number, data: { name: string; relation: string; phone_number: string; alternate_phone_number?: string; address?: string; notes?: string }) =>
    request<IPDAttendantResponse>(`/ipd/admissions/${admissionId}/attendant`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
