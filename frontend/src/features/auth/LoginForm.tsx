import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginApi, getPublicDepartments } from './authApi';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Users, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  type: z.enum(['ADMIN', 'EMPLOYEE']),
  departmentId: z.number().optional()
}).refine(data => {
  if (data.type === 'EMPLOYEE' && !data.departmentId) {
    return false;
  }
  return true;
}, {
  message: 'Department is required for employee login',
  path: ['departmentId']
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [departments, setDepartments] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { type: 'ADMIN' }
  });

  useEffect(() => {
    getPublicDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleTypeChange = (type: 'ADMIN' | 'EMPLOYEE') => {
    setLoginType(type);
    setValue('type', type);
    setValue('departmentId', undefined);
  };

  const selectedDeptId = watch('departmentId');
  const selectedDeptName = departments.find(d => d.id === selectedDeptId)?.name;

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setError('');
      await loginApi(data);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid credentials or incorrect department.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center lg:justify-end lg:pr-[15%] bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url('/login-bg.png')` }}
    >
      {/* Portal Button Top Left */}
      <motion.button
        initial="initial"
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:border-white/20 group overflow-hidden"
      >
        <LayoutDashboard className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
        <span className="font-medium text-sm tracking-widest flex items-center">
          {"PORTAL".split("").map((char, index) => (
            <motion.span
              key={index}
              variants={{
                initial: { opacity: 0.7, y: 0 },
                hover: { 
                  opacity: 1, 
                  y: [0, -4, 0],
                  color: ["#ffffff", "#93c5fd", "#ffffff"]
                }
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </motion.button>

      {/* Container to hold card and absolute decorative elements */}
      <div className="relative w-full max-w-[440px] px-4 lg:px-0">
        
        <div 
          className={`relative z-10 w-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 border-t-white/40 border-l-white/40 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_0_30px_rgba(255,255,255,0.1)] hover:bg-white/[0.04] ${loginType === 'EMPLOYEE' ? 'p-8' : 'p-10'}`}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 60px) 0, 100% 60px, 100% 100%, 60px 100%, 0 calc(100% - 60px))',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"), linear-gradient(125deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.01) 30%, transparent 100%)`
          }}
        >
          {/* Logo */}
          <div className={`group ${loginType === 'EMPLOYEE' ? 'mb-6' : 'mb-10'}`}>
            <h1 
              className="text-2xl font-black tracking-[0.3em] bg-gradient-to-r from-white via-blue-100 to-white/60 text-transparent bg-clip-text transition-all duration-500 group-hover:tracking-[0.4em]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              PRIZMABRIXX
            </h1>
          </div>

          <div className={loginType === 'EMPLOYEE' ? 'mb-6' : 'mb-8'}>
            <h2 className="text-3xl font-bold text-white mb-3">Login with</h2>
            <p className="text-[10px] text-white/50 leading-relaxed max-w-[90%]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            </p>
          </div>

          {/* Option Buttons */}
          <div className={`flex gap-4 ${loginType === 'EMPLOYEE' ? 'mb-6' : 'mb-8'}`}>
            <button 
              type="button" 
              onClick={() => handleTypeChange('ADMIN')}
              className={`flex-1 flex items-center justify-center gap-2 border rounded-full py-2.5 text-xs font-medium transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] ${
                loginType === 'ADMIN' 
                  ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:-translate-y-1 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
            <button 
              type="button" 
              onClick={() => handleTypeChange('EMPLOYEE')}
              className={`flex-1 flex items-center justify-center gap-2 border rounded-full py-2.5 text-xs font-medium transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] ${
                loginType === 'EMPLOYEE' 
                  ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:-translate-y-1 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Employee
            </button>
          </div>

          {/* Divider */}
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent ${loginType === 'EMPLOYEE' ? 'mb-6' : 'mb-8'}`}></div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-500/40 text-red-100 text-sm backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {loginType === 'EMPLOYEE' && (
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-white mb-2 pl-2">Select Department</label>
                <select
                  {...register('departmentId', { valueAsNumber: true })}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 transition-all duration-300 text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                >
                  <option value="" className="text-black">Choose...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id} className="text-black">{dept.name}</option>
                  ))}
                </select>
                {errors.departmentId && <p className="mt-1 ml-2 text-red-400 text-xs">{errors.departmentId.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-white mb-2 pl-2">Email</label>
              <input
                {...register('email')}
                className={`w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 transition-all duration-300 text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] ${loginType === 'EMPLOYEE' ? 'py-3' : 'py-3.5'}`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 ml-2 text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-white mb-2 pl-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className={`w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 transition-all duration-300 text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] ${loginType === 'EMPLOYEE' ? 'py-3' : 'py-3.5'}`}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 ml-2 text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-white hover:bg-white hover:-translate-y-1 text-[#000000] font-bold tracking-wide rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] ${loginType === 'EMPLOYEE' ? 'mt-4 py-3' : 'mt-6 py-3.5'}`}
            >
              {isSubmitting ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Decorative elements - Left side */}
        <div className="absolute -left-6 top-32 flex flex-col gap-2 z-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-10 h-12 border border-white/20 border-t-white/40 bg-white/10 backdrop-blur-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform hover:scale-110 hover:-translate-x-2 cursor-pointer ${i === 2 ? 'animate-pulse' : ''}`} style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 75%, 0 25%)', animationDelay: `${i * 300}ms` }}></div>
          ))}
        </div>

        {/* Decorative elements - Right side */}
        <div className="absolute -right-6 bottom-24 flex flex-col gap-2 z-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-10 h-12 border border-white/20 border-t-white/40 bg-white/10 backdrop-blur-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform hover:scale-110 hover:translate-x-2 cursor-pointer ${i === 2 ? 'animate-pulse' : ''}`} style={{ clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)', animationDelay: `${i * 300}ms` }}></div>
          ))}
        </div>

      </div>
    </div>
  );
};
