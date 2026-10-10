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