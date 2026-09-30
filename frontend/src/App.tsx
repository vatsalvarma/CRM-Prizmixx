import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LoginForm } from './features/auth/LoginForm';
import { ClientPortal } from './pages/ClientPortal';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useAuthStore } from './store/authStore';
import { AttendanceDashboard } from './features/attendance/AttendanceDashboard';
import { LeaveDashboard } from './features/leave/LeaveDashboard';
import { LeadDashboard } from './features/sales/LeadDashboard';
import { ClientDashboard } from './features/clients/ClientDashboard';
import { ProjectsDashboard } from './features/projects/ProjectsDashboard';
import { FinanceDashboard } from './features/finance/FinanceDashboard';
import { SupportDashboard } from './features/support/SupportDashboard';
import { InboxDashboard } from './features/inbox/InboxDashboard';
import { AdminEmployeeDashboard } from './features/employees/AdminEmployeeDashboard';
import { HRDashboard } from './features/hr/HRDashboard';
import { 
  Inbox, 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  HelpCircle, 
  LogOut,
  Bell,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- RBAC Configuration ---
// Define all system roles for type safety
type Role = 'SYSTEM_MASTER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

interface NavConfig {
  path: string;
  label: string;
  icon: any;
  allowedRoles: Role[];
  element: React.ReactNode;
}

const ALL_ROLES: Role[] = ['SYSTEM_MASTER', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
const MANAGEMENT_ROLES: Role[] = ['SYSTEM_MASTER', 'ADMIN', 'MANAGER'];

export const NAVIGATION_CONFIG: NavConfig[] = [
  { path: 'inbox', label: 'Work Inbox', icon: Inbox, allowedRoles: ALL_ROLES, element: <InboxDashboard /> },
  { path: 'attendance', label: 'Attendance', icon: Clock, allowedRoles: ALL_ROLES, element: <AttendanceDashboard /> },
  { path: 'leave', label: 'Leave Management', icon: Calendar, allowedRoles: ALL_ROLES, element: <LeaveDashboard /> },
  { path: 'projects', label: 'Projects', icon: Briefcase, allowedRoles: ALL_ROLES, element: <ProjectsDashboard /> },
  { path: 'support', label: 'Support Tickets', icon: HelpCircle, allowedRoles: ALL_ROLES, element: <SupportDashboard /> },
  { path: 'clients', label: 'Clients', icon: Users, allowedRoles: MANAGEMENT_ROLES, element: <ClientDashboard /> },
  { path: 'sales', label: 'Sales Pipeline', icon: TrendingUp, allowedRoles: MANAGEMENT_ROLES, element: <LeadDashboard /> },
  { path: 'finance', label: 'Finance & Invoices', icon: DollarSign, allowedRoles: MANAGEMENT_ROLES, element: <FinanceDashboard /> },
  { path: 'hr', label: 'HR Operations', icon: FileText, allowedRoles: ['SYSTEM_MASTER', 'ADMIN'], element: <HRDashboard /> },
  { path: 'employees', label: 'Employee Management', icon: Users, allowedRoles: ['SYSTEM_MASTER', 'ADMIN'], element: <AdminEmployeeDashboard /> },
];

// Helper to check if a user has access
const hasAccess = (userRole: string | null, departmentName: string | null, allowedRoles: Role[], itemPath: string) => {
  if (!userRole) return false;
  if (itemPath === 'hr' && departmentName?.toLowerCase() === 'hr') return true;
  if (itemPath === 'sales' && departmentName?.toLowerCase() === 'sales') return true;
  if (itemPath === 'finance' && departmentName?.toLowerCase() === 'finance') return true;
  return allowedRoles.includes(userRole as Role);
};


// Simple PrivateRoute wrapper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" />;
};

const navContainerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const navItemVariants: any = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const NavItem = ({ to, icon: Icon, label, isHR = false }: { to: string, icon: any, label: string, isHR?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <motion.div variants={navItemVariants}>
      <Link 
        to={to} 
        className="relative group flex items-center px-4 py-2 rounded-xl overflow-hidden outline-none"
      >
        {/* Magic sliding active background */}
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute inset-0 bg-gradient-to-r from-[var(--theme-glow-strong)] to-transparent border-l-[3px] border-[var(--theme-accent)] rounded-xl shadow-[inset_10px_0_20px_var(--theme-glow-weak)] z-0 overflow-hidden"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} // Flawless Vercel-style spring
          >
            {/* Continuous horizontal sweeping laser */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--theme-glow-strong)] to-transparent -skew-x-12"
            />
          </motion.div>
        )}
        
        {/* Hover background for non-active items */}
        {!isActive && (
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-0" />
        )}

        {/* Content (z-10 to stay above the background). Shifts right when active. */}
        <motion.div 
          className="relative z-10 flex items-center w-full"
          animate={isActive ? { x: 8 } : { x: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        >
          <motion.div 
            className={`mr-3 p-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-[var(--theme-accent)] shadow-[0_0_20px_var(--theme-glow-max)]' : `bg-transparent ${isHR ? 'text-gray-600 group-hover:text-gray-900' : 'text-white/60 group-hover:text-white'}`}`}
            style={{ color: isActive ? 'var(--theme-accent-contrast)' : undefined }}
            whileHover={{ scale: 1.1, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          
          <span className={`font-medium tracking-wide text-sm transition-colors duration-300 ${isActive ? 'text-[var(--theme-accent)] drop-shadow-[0_0_8px_var(--theme-glow-max)]' : `${isHR ? 'text-gray-700 group-hover:text-gray-900' : 'text-white/60 group-hover:text-white'} group-hover:translate-x-1 transform`}`}>
            {label}
          </span>
          
          {isActive && (
            <motion.div 
              layoutId="activeDotLayout"
              className={`ml-auto w-2 h-2 rounded-full shadow-[0_0_15px_currentColor] mr-2 ${isHR ? 'bg-gray-800' : 'bg-white text-white'}`}
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, role, departmentName } = useAuthStore();
  
  const { permission, requestPermission } = usePushNotifications();

  // Filter navigation items based on user role
  const allowedNavItems = NAVIGATION_CONFIG.filter(item => hasAccess(role as string, departmentName as string | null, item.allowedRoles, item.path));
  
  const isAdmin = role === 'ADMIN' || role === 'SYSTEM_MASTER';
  const dept = departmentName?.toLowerCase() || '';
  const isLightTheme = ['hr', 'sales', 'finance', 'marketing', 'digital marketing'].includes(dept);
  const isHR = dept === 'hr';
  
  const themeClass = isAdmin || isLightTheme ? 'theme-admin' : 'theme-employee';

  return (
    <div 
      className={`h-screen text-[#F5F5F5] flex relative bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden ${themeClass}`}
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}${isLightTheme ? 'hr-bg.png' : isAdmin ? 'ad-bg.png' : 'emp-bg.png'}')` }}
    >
      <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* Sidebar - Glassmorphism */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`relative z-20 w-72 border-r border-white/10 ${isLightTheme ? 'bg-white/20' : 'bg-black/40'} backdrop-blur-3xl flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.5)]`}
      >
        <div className="p-4 border-b border-white/10 relative overflow-hidden flex justify-center items-center h-16">
          {/* Deep Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-glow-weak)] to-transparent z-0" />
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[var(--theme-accent)] blur-[60px] rounded-full pointer-events-none z-0 opacity-50" 
          />
          
          {/* Elegant Floating Embers */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute w-1 h-1 bg-[var(--theme-accent)] rounded-full blur-[1px] shadow-[0_0_5px_var(--theme-accent)]"
              initial={{ 
                x: Math.random() * 200 - 100, 
                y: 100, 
                opacity: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: -100, 
                x: (Math.random() - 0.5) * 150, 
                opacity: [0, 0.8, 0] 
              }}
              transition={{ 
                duration: Math.random() * 4 + 4, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}

          {/* Sleek, Premium Text */}
          <motion.h1 
            className={`text-xl font-light tracking-[0.2em] relative z-10 ${isLightTheme ? 'text-gray-900' : 'text-white'}`}
            animate={{ textShadow: ["0 0 10px var(--theme-glow-weak)", "0 0 25px var(--theme-glow-strong)", "0 0 10px var(--theme-glow-weak)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            PRIZMA<span className="font-bold text-[var(--theme-accent)]">BRIXX</span>
          </motion.h1>
        </div>

        <motion.nav 
          variants={navContainerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 px-3 py-1 space-y-0.5 overflow-hidden relative"
        >
          {allowedNavItems.map((item) => (
            <NavItem 
              key={item.path} 
              to={`/dashboard/${item.path}`} 
              icon={item.icon} 
              label={item.label} 
              isHR={isLightTheme}
            />
          ))}
        </motion.nav>

        <div className="p-2 border-t border-white/10 space-y-1">
          {permission !== 'granted' && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestPermission}
              className={`group w-full flex items-center px-4 py-1.5 ${isLightTheme ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-600/10' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'} rounded-xl transition-colors duration-300 border border-transparent ${isLightTheme ? 'hover:border-blue-600/20' : 'hover:border-blue-500/20'}`}
            >
              <div className={`mr-3 p-1.5 rounded-lg bg-transparent ${isLightTheme ? 'group-hover:bg-blue-600/10' : 'group-hover:bg-blue-500/10'} transition-colors`}>
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-medium tracking-wide text-sm">Enable Alerts</span>
            </motion.button>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className={`group w-full flex items-center px-4 py-1.5 ${isLightTheme ? 'text-red-600 hover:text-red-700 hover:bg-red-600/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'} rounded-xl transition-colors duration-300 border border-transparent ${isLightTheme ? 'hover:border-red-600/20' : 'hover:border-red-500/20'}`}
          >
            <div className={`mr-3 p-1.5 rounded-lg bg-transparent ${isLightTheme ? 'group-hover:bg-red-600/10' : 'group-hover:bg-red-500/10'} transition-colors`}>
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium tracking-wide text-sm">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-hidden bg-transparent">
        {children}
      </main>
    </div>
  );
};

const AnimatedDashboardRoutes = () => {
  const location = useLocation();
  const { role } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ 
          opacity: 0, 
          clipPath: "circle(0% at 50% 50%)",
          scale: 0.8,
          filter: 'blur(15px)'
        }}
        animate={{ 
          opacity: 1, 
          clipPath: "circle(150% at 50% 50%)",
          scale: 1,
          filter: 'blur(0px)'
        }}
        exit={{ 
          opacity: 0, 
          clipPath: "circle(0% at 50% 50%)",
          scale: 1.2,
          filter: 'blur(15px)'
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1]
        }}
        className="h-full w-full absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="inbox" replace />} />
          
          {NAVIGATION_CONFIG.map((config) => (
            hasAccess(role as string, useAuthStore.getState().departmentName as string | null, config.allowedRoles, config.path) && (
              <Route key={config.path} path={config.path} element={config.element} />
            )
          ))}

          {/* Catch-all redirect for unauthorized or non-existent routes within dashboard */}
          <Route path="*" element={<Navigate to="inbox" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientPortal />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AnimatedDashboardRoutes />
              </DashboardLayout>
            </PrivateRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
