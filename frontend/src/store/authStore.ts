import { create } from 'zustand';

interface AuthState {
  token: String | null;
  email: String | null;
  role: String | null;
  departmentName: String | null;
  setAuth: (token: string, email: string, role: string, departmentName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, // Initial state, NO localStorage as per prompt rules
  email: null,
  role: null,
  departmentName: null,
  setAuth: (token, email, role, departmentName) => set({ token, email, role, departmentName }),
  logout: () => set({ token: null, email: null, role: null, departmentName: null }),
}));
