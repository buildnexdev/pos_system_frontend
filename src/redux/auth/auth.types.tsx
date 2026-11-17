export interface UserRight {
  module_key: string;
  can_view: number | boolean;
  can_create: number | boolean;
  can_edit: number | boolean;
  can_delete: number | boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
  roleID?: number | null;
  companyID?: number | null;
  companyName?: string | null;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  isAdmin?: number | boolean;
  isSuperAdmin?: number | boolean;
  branchID?: number | null;
  is_active?: number | boolean;
  /** True when password older than 10 days (or never changed) */
  mustChangePassword?: boolean;
  passwordAgeDays?: number | null;
  passwordMaxAgeDays?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  rights: UserRight[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
