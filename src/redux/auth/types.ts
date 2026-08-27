export interface User {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
