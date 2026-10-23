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
  IPDAdmissionsReport,
  IPDBillingReport,
  IPDAdmissionListResponse,
  IPDAdmissionResponse,
  IPDAdmissionCreate,
  IPDAttendantResponse,
  LoginResponse,
  AuthUser,
  UserCreatePayload,
  UserUpdatePayload,
  PharmacyVendor,
  PharmacyVendorCreatePayload,
  PharmacyVendorUpdatePayload,
  PharmacyDrug,
  PharmacyPurchaseCreatePayload,
  PharmacySaleCreatePayload,
  PharmacySaleResponse,
} from '../types';

// API base — auto-detects: local frontend talks to local backend (localhost:8000),
// deployed web frontend talks to the Render backend. VITE_API_BASE_URL overrides both.
const isLocalFrontend = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string)
  || (isLocalFrontend ? 'http://localhost:8000/api/v1' : 'https://ayush-hms-1.onrender.com/api/v1');

const TOKEN_KEY = 'hms_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

/** fetch() with the Authorization header attached (for raw server calls). */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 && token) {
    setToken(null);
    window.location.href = '/login';
  }
  return response;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token && !url.startsWith('/auth/login')) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Session expired, please login again');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
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

  ipdAdmissionsSummary: (startDate: string, endDate: string) =>
    request<IPDAdmissionsReport>(`/reports/ipd-admissions-summary?start_date=${startDate}&end_date=${endDate}`),

  ipdBilling: (startDate: string, endDate: string) =>
    request<IPDBillingReport>(`/reports/ipd-billing?start_date=${startDate}&end_date=${endDate}`),
};
// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<AuthUser>('/auth/me'),
  logout: () => request<{ status: string }>('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ status: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
};

// Users API (super users only)
export const usersApi = {
  list: () => request<AuthUser[]>('/users'),
  create: (data: UserCreatePayload) =>
    request<AuthUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UserUpdatePayload) =>
    request<AuthUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// Pharmacy API
export const pharmacyApi = {
  vendors: {
    list: () => request<PharmacyVendor[]>('/pharmacy/vendors'),
    create: (d: PharmacyVendorCreatePayload) => request<PharmacyVendor>('/pharmacy/vendors', { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: PharmacyVendorUpdatePayload) => request<PharmacyVendor>(`/pharmacy/vendors/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    remove: (id: number) => request<void>(`/pharmacy/vendors/${id}`, { method: 'DELETE' }),
  },
  drugs: {
    list: (q: string = '') => request<PharmacyDrug[]>(`/pharmacy/drugs?q=${encodeURIComponent(q)}`),
  },
  purchases: {
    create: (d: PharmacyPurchaseCreatePayload) => request<any>('/pharmacy/purchases', { method: 'POST', body: JSON.stringify(d) }),
  },
  sales: {
    create: (d: PharmacySaleCreatePayload) => request<PharmacySaleResponse>('/pharmacy/sales', { method: 'POST', body: JSON.stringify(d) }),
    get: (id: number) => request<PharmacySaleResponse>(`/pharmacy/sales/${id}`),
    list: () => request<PharmacySaleResponse[]>('/pharmacy/sales'),
  },
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
