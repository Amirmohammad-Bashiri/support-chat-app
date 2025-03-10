export interface LoginResponse {
  mobileNumber: string;
  timeout: number;
  userExist: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  time_zone: string;
  is_active: boolean;
  created_at: string;
  mobile_number: string;
  email: string;
  is_email_verified: boolean;
  identity_number: string | null;
  birth_date: string | null;
  is_verified: boolean;
  modified_at: string | null;
  is_online: boolean;
  business_unit: number;
  country: number;
  created_by: number | null;
  role: number;
  modified_by: number | null;
}
