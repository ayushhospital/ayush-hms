import type {
  PatientSearchResponse,
  Patient,
  PatientCreate,
  ConsultationResponse,
  ConsultationCreate,
  Doctor,
  RevenueReport,
  FootfallReport,
  DoctorSummaryReport,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  revenue: (startDate: string, endDate: string) =>
    request<RevenueReport>(`/reports/revenue?start_date=${startDate}&end_date=${endDate}`),

  footfall: (startDate: string, endDate: string) =>
    request<FootfallReport>(`/reports/footfall?start_date=${startDate}&end_date=${endDate}`),

  doctorSummary: (startDate: string, endDate: string) =>
    request<DoctorSummaryReport>(`/reports/doctor-summary?start_date=${startDate}&end_date=${endDate}`),
};