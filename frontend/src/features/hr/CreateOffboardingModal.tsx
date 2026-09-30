import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAllEmployees, type Employee } from '../../api/employeesApi';
import { createHRLead } from './hrApi';

interface CreateOffboardingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOffboardingModal: React.FC<CreateOffboardingModalProps> = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }
    
    const employee = employees.find(e => e.id.toString() === selectedEmployeeId);
    if (!employee) return;

    try {
      setLoading(true);
      setError('');
      await createHRLead({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        departmentId: undefined,
        position: 'Employee', // Defaulting since position isn't strictly tracked in Employee right now
        status: 'OFFBOARDING'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate offboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Initiate Offboarding</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Employee to Offboard</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-white/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              required
            >
              <option value="">-- Choose an employee --</option>
              {employees.filter(e => e.employmentStatus !== 'TERMINATED').map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.email})
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Initiating...' : 'Start Offboarding Process'}
          </button>
        </form>
      </div>
    </div>
  );
};
