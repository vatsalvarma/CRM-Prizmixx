import React, { useState } from 'react';
import { X, Check, Copy, Key, User, Briefcase, Mail, Trash2 } from 'lucide-react';
import type { Employee } from '../../api/employeesApi';
import { resetEmployeePassword, deleteEmployee } from '../../api/employeesApi';

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onEmployeeDeleted: () => void;
}

export const EmployeeDetailsPopup = ({ employee, onClose, onEmployeeDeleted }: Props) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!employee) return null;

  const copyToClipboard = (text: string, type: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsResetting(true);
      const res = await resetEmployeePassword(employee.id);
      setNewPassword(res.newPassword);
    } catch (err) {
      console.error('Failed to reset password', err);
      alert('Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEmployee(employee.id);
      onEmployeeDeleted();
    } catch (err) {
      console.error('Failed to delete employee', err);
      alert('Failed to delete employee');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center text-2xl font-light text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">{employee.firstName} {employee.lastName}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                <span className={`px-2 py-0.5 rounded-md text-xs border ${employee.employmentStatus === 'ACTIVE' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                  {employee.employmentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                <span className="text-xs text-red-500 font-medium mr-2">Confirm Delete?</span>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Yes'}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs bg-black/50 hover:bg-black text-gray-300 rounded-md transition-colors"
                >
                  No
                </button>
              </div>
            )}
            
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 w-24">Username</span>
            <span className="text-white font-medium break-all">{employee.email}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm p-3 bg-white/5 rounded-xl border border-white/5">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 w-24">Department</span>
            <span className="text-white font-medium">{employee.departmentName || 'N/A'}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm p-3 bg-white/5 rounded-xl border border-white/5 group">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 w-24">Employee ID</span>
            <span className="text-white font-mono flex-1">{employee.employeeId || 'N/A'}</span>
            {employee.employeeId && (
              <button 
                onClick={() => copyToClipboard(employee.employeeId, 'id')}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
              >
                {copiedId ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Key className="w-5 h-5 text-white mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white/90 mb-1">Password Management</h3>
              
              {!newPassword && (
                <div className="bg-black/40 border border-white/30 rounded-xl p-3 flex items-center justify-between group mb-3">
                  <span className="text-white font-mono tracking-wider">{employee.plainPassword || '********'}</span>
                  <button 
                    onClick={() => copyToClipboard(employee.plainPassword || '', 'pass')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}

              {newPassword && (
                <div className="bg-black/40 border border-white/30 rounded-xl p-3 flex items-center justify-between group mb-3">
                  <span className="text-white font-mono tracking-wider">{newPassword}</span>
                  <button 
                    onClick={() => copyToClipboard(newPassword, 'pass')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}

              <button 
                onClick={handleResetPassword}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Generate New Password'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
