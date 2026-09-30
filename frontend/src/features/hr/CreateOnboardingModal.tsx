import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createHRLead } from './hrApi';
import { axiosClient } from '../../api/axiosClient';

interface Department {
  id: number;
  name: string;
}

interface CreateOnboardingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOnboardingModal: React.FC<CreateOnboardingModalProps> = ({ onClose, onSuccess }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: ''
  });

  useEffect(() => {
    // Fetch departments for the dropdown using public endpoint to bypass ADMIN only restriction
    axiosClient.get('/departments/public').then(res => setDepartments(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await createHRLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        position: formData.position,
        status: 'ONBOARDING'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create onboarding lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Onboarding Lead</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 rounded-xl text-sm shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Department</label>
              <select
                value={formData.departmentId}
                onChange={e => setFormData({...formData, departmentId: e.target.value})}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
                required
              >
                <option value="">-- Select --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Job Title</label>
              <input
                type="text"
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Lead & Start Document Collection'}
          </button>
        </form>
      </div>
    </div>
  );
};
