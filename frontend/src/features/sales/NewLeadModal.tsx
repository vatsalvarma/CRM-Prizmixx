import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createLead } from '../../api/salesApi';
import type { Lead } from '../../api/salesApi';

interface NewLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientCompany: '',
    contactName: '',
    phone: '',
    email: '',
    projectName: '',
    description: '',
    referenceLinks: '',
    documentUrl: '',
    source: 'Website',
    requiredService: '',
    expectedDecision: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createLead(formData as Partial<Lead>);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-medium text-white">New Lead</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client / Company Name *</label>
                <input required type="text" value={formData.clientCompany} onChange={e => setFormData({...formData, clientCompany: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Name *</label>
                <input required type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="e.g. John Doe" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email (Gmail / Work) *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name *</label>
                <input required type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="e.g. E-Commerce Redesign" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Service Required</label>
                <input type="text" value={formData.requiredService} onChange={e => setFormData({...formData, requiredService: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="e.g. Web Development" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description / Notes *</label>
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors custom-scrollbar" placeholder="Details about the project..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reference Links (Optional)</label>
                <input type="text" value={formData.referenceLinks} onChange={e => setFormData({...formData, referenceLinks: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Doc / PDF URL (Optional)</label>
                <input type="url" value={formData.documentUrl} onChange={e => setFormData({...formData, documentUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors" placeholder="Link to brief" />
              </div>
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            form="new-lead-form"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
