// Patient types
export interface Patient {
  id: number;
  uhid: string;
  name: string;
  gender: string;
  age: number;
  phone_number: string;
  created_at: string;
  updated_at?: string | null;
}

export interface PatientSearchResult {
  patient: Patient;
  consultation_status: 'Active Consultation' | 'Expired' | 'No Consultation';
  active_consultation_id: number | null;
  valid_until: string | null;
}

export interface PatientSearchResponse {
  phone_number: string;
  patients: PatientSearchResult[];
}

export interface PatientCreate {
  name: string;
  gender: string;
  age: number;
  phone_number: string;
}

// Consultation types
export interface PatientUpdate {
  name?: string;
  gender?: string;
  age?: number;
}
export interface ConsultationCreate {
  patient_id: number;
  doctor_id: number | null;
  custom_doctor_name?: string;
  consultation_date: string;
  visit_type: 'New' | 'Follow-up';
  fee_amount: number;
  payment_mode: 'Cash' | 'UPI';
  notes?: string;
}

export interface ConsultationResponse {
  id: number;
  consultation_number: string;
  patient_id: number;
  doctor_id: number;
  custom_doctor_name?: string | null;
  consultation_date: string;
  visit_type: string;
  fee_amount: number;
  payment_mode: string;
  payment_status: string;
  valid_until: string;
  notes?: string | null;
  created_at: string;
  patient_name?: string | null;
  patient_uhid?: string | null;
  patient_age?: number | null;
  patient_gender?: string | null;
  patient_phone?: string | null;
  doctor_name?: string | null;
  doctor_department?: string | null;
}

// Doctor types
export interface Doctor {
  id: number;
  name: string;
  department: string;
  consultation_fee: number;
  is_active: boolean;
  created_at: string;
}

// Report types
export interface RevenueReportRow {
  visit_type: string;
  cash_amount: number;
  upi_amount: number;
  total: number;
}
// Patient List Report
export interface PatientListRow {
  consultation_number: string;
  consultation_date: string;
  patient_name: string;
  patient_uhid: string;
  patient_phone: string;
  doctor_name: string | null;
  visit_type: string;
  fee_amount: number;
  payment_mode: string;
}

export interface PatientListReport {
  start_date: string;
  end_date: string;
  rows: PatientListRow[];
  total_count: number;
}

export interface RevenueReport {
  start_date: string;
  end_date: string;
  rows: RevenueReportRow[];
  grand_total_cash: number;
  grand_total_upi: number;
  grand_total: number;
}

export interface FootfallReport {
  start_date: string;
  end_date: string;
  total_visits: number;
  unique_patients: number;
  day_wise?: Array<{ date: string; visits: number; unique_patients: number }>;
}

export interface DoctorSummaryRow {
  doctor_id: number;
  doctor_name: string;
  department: string;
  total_consultations: number;
  new_visits: number;
  follow_up_visits: number;
  total_revenue: number;
}

export interface DoctorSummaryReport {
  start_date: string;
  end_date: string;
  rows: DoctorSummaryRow[];
  grand_total: number;
}
// IPD Types
export interface IPDAdmissionSummary {
  id: number;
  admission_number: string;
  patient_id: number;
  patient_name?: string | null;
  patient_uhid?: string | null;
  patient_phone?: string | null;
  admission_datetime: string;
  discharge_datetime?: string | null;
  admitting_doctor_id: number;
  doctor_name?: string | null;
  ward_bed?: string | null;
  status: string;
}

export interface IPDAdmissionListResponse {
  admissions: IPDAdmissionSummary[];
  total: number;
  open_count: number;
  today_admissions: number;
  discharged_today: number;
}

export interface IPDAdmissionCreate {
  patient_id: number;
  admission_datetime: string;
  admission_type: 'Planned' | 'Emergency' | 'Referral';
  admitting_doctor_id: number;
  department?: string;
  reason_for_admission: string;
  initial_diagnosis?: string;
  referral_source?: string;
  referring_provider?: string;
  ward_bed?: string;
  admission_notes?: string;
  attendant_name: string;
  attendant_relationship: string;
  attendant_phone: string;
  attendant_alternate_phone?: string;
  attendant_address?: string;
  attendant_notes?: string;
}

export interface IPDAdmissionResponse {
  id: number;
  admission_number: string;
  patient_id: number;
  admission_datetime: string;
  admission_type: string;
  admitting_doctor_id: number;
  department?: string | null;
  reason_for_admission: string;
  initial_diagnosis?: string | null;
  referral_source?: string | null;
  referring_provider?: string | null;
  ward_bed?: string | null;
  admission_notes?: string | null;
  status: string;
  discharge_datetime?: string | null;
  created_at: string;
  updated_at?: string | null;
  patient_name?: string | null;
  patient_uhid?: string | null;
  patient_age?: number | null;
  patient_gender?: string | null;
  patient_phone?: string | null;
  doctor_name?: string | null;
  doctor_department?: string | null;
}

export interface IPDAttendantResponse {
  id: number;
  admission_id: number;
  name: string;
  relation: string;
  phone_number: string;
  alternate_phone_number?: string | null;
  address?: string | null;
  notes?: string | null;
}
// Daily Summary Report
export interface DailySummaryRow {
  date: string;
  new_visits: number;
  followup_visits: number;
  cash_amount: number;
  upi_amount: number;
  total_amount: number;
  total_visits: number;
  unique_patients: number;
}

export interface DailySummaryReport {
  start_date: string;
  end_date: string;
  rows: DailySummaryRow[];
  grand_total_visits: number;
  grand_total_cash: number;
  grand_total_upi: number;
  grand_total: number;
}

// IPD Reports
export interface IPDAdmissionsRow {
  date: string;
  total_admissions: number;
  open_count: number;
  discharged_count: number;
  planned: number;
  emergency: number;
  referral: number;
}

export interface IPDAdmissionsReport {
  start_date: string;
  end_date: string;
  rows: IPDAdmissionsRow[];
  grand_total: number;
  grand_open: number;
  grand_discharged: number;
}

export interface IPDBillingRow {
  admission_number: string;
  admission_date: string;
  patient_name: string;
  patient_uhid: string;
  ward_bed: string | null;
  total_charges: number;
  total_paid: number;
  outstanding: number;
}

export interface IPDBillingReport {
  start_date: string;
  end_date: string;
  rows: IPDBillingRow[];
  grand_charges: number;
  grand_paid: number;
  grand_outstanding: number;
}

// Auth & Users
export type ModuleKey = 'opd' | 'ipd' | 'reports';

export interface AuthUser {
  id: number;
  username: string;
  role: 'super' | 'normal';
  modules: ModuleKey[];
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface UserCreatePayload {
  username: string;
  password: string;
  role: 'super' | 'normal';
  modules: ModuleKey[];
}

export interface UserUpdatePayload {
  password?: string;
  role?: 'super' | 'normal';
  modules?: ModuleKey[];
  is_active?: boolean;
}