import React, { useState, useEffect } from 'react';
import { createWork } from '../../api/workApi';
import { axiosClient as api } from '../../api/axiosClient';
import { X, Loader } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  departmentName: string;
}

interface NewWorkModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewWorkModal = ({ onClose, onSuccess }: NewWorkModalProps) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referenceLinks: '',
    documentPdf: '',
    departmentId: '',
    assignedEmployeeId: ''
  });

  useEffect(() => {
    // Fetch departments and all employees
    api.get('/departments').then(res => setDepartments(res.data)).catch(console.error);
    api.get('/employees').then(res => setAllEmployees(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      const selectedDept = departments.find(d => d.id.toString() === formData.departmentId);
      if (selectedDept) {
        setEmployees(allEmployees.filter(emp => emp.departmentName === selectedDept.name));
      } else {
        setEmployees([]);
      }
    } else {
      setEmployees([]);
    }
  }, [formData.departmentId, departments, allEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createWork({
        name: formData.name,
        description: formData.description,
        referenceLinks: formData.referenceLinks,
        documentPdf: formData.documentPdf,
        departmentId: parseInt(formData.departmentId),
        assignedEmployeeId: parseInt(formData.assignedEmployeeId)
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating work:', err);
      alert('Failed to assign work');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card bg-[#0A0A0A] border border-white/10 rounded-[24px] p-8 max-w-lg w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-light text-white mb-6">Assign New Work</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Work Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
              placeholder="e.g. Q3 Marketing Campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 custom-scrollbar"
              placeholder="Detailed description of the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reference Links (Optional)</label>
              <input 
                type="text" 
                value={formData.referenceLinks}
                onChange={e => setFormData({...formData, referenceLinks: e.target.value})}
                className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Document URL (Optional)</label>
              <input 
                type="text" 
                value={formData.documentPdf}
                onChange={e => setFormData({...formData, documentPdf: e.target.value})}
                className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
                placeholder="Google Drive link etc"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
              <select 
                required
                value={formData.departmentId}
                onChange={e => setFormData({...formData, departmentId: e.target.value, assignedEmployeeId: ''})}
                className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Employee</label>
              <select 
                required
                disabled={!formData.departmentId}
                value={formData.assignedEmployeeId}
                onChange={e => setFormData({...formData, assignedEmployeeId: e.target.value})}
                className="w-full bg-[#1A1A1A] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 disabled:opacity-50"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Assign Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
