import { create } from 'zustand';

interface AuthState {
  token: String | null;
  email: String | null;
  role: String | null;
  departmentName: String | null;
  branchName: String | null;
  branchId: number | null;
  setAuth: (token: string, email: string, role: string, departmentName?: string, branchName?: string, branchId?: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, // Initial state, NO localStorage as per prompt rules
  email: null,
  role: null,
  departmentName: null,
  branchName: null,
  branchId: null,
  setAuth: (token, email, role, departmentName, branchName, branchId) => set({ token, email, role, departmentName, branchName, branchId }),
  logout: () => set({ token: null, email: null, role: null, departmentName: null, branchName: null, branchId: null }),
}));
