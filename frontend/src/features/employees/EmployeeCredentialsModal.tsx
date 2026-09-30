import React, { useState } from 'react';
import { X, Check, Copy, AlertTriangle } from 'lucide-react';
import type { CreateEmployeeResponse } from '../../api/employeesApi';

interface Props {
  credentials: CreateEmployeeResponse | null;
  onClose: () => void;
}

export const EmployeeCredentialsModal = ({ credentials, onClose }: Props) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!credentials) return null;

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.1)] p-8 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-2">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-light text-white">Employee Created</h2>
          <p className="text-gray-400 text-sm">
            Please copy these credentials now. For security reasons, the password will not be shown again.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Employee ID</p>
              <p className="text-lg font-mono text-white">{credentials.employeeId}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(credentials.employeeId, 'id')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              {copiedId ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          <div className="bg-white/5 border border-white/20 rounded-2xl p-4 flex items-center justify-between group">
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Temporary Password
              </p>
              <p className="text-lg font-mono text-white">{credentials.password}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(credentials.password, 'pass')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              {copiedPass ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 text-sm font-medium glass-btn-theme rounded-2xl transition-all"
        >
          I have copied the credentials
        </button>
      </div>
    </div>
  );
};
