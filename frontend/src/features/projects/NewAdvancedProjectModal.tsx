import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Calendar, Sparkles, Building, Rocket, Layers } from 'lucide-react';
import { StageLogo } from './ProjectAnimatedLogos';

interface NewAdvancedProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, files: File[]) => Promise<any>;
  clients: { id: number; companyName: string }[];
  employees: { id: number; firstName: string; lastName: string; departmentName?: string; branchName?: string }[];
}

export const NewAdvancedProjectModal: React.FC<NewAdvancedProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
  employees
}) => {
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    title: '',
    description: '',
    teamLeaderId: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.clientName.trim() || !formData.teamLeaderId) {
      alert('Please fill in Project Name, Client, and assign a Team Leader.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: formData.name.trim(),
        clientName: formData.clientName.trim(),
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        projectType: 'ADVANCED',
        teamLeaderId: parseInt(formData.teamLeaderId),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      }, []);

      // Reset
      setFormData({
        name: '',
        clientName: '',
        title: '',
        description: '',
        teamLeaderId: '',
        startDate: '',
        endDate: ''
      });
      onClose();
    } catch (err) {
      console.error('Failed to create advanced project:', err);
      alert('Failed to initialize Advanced Project');
    } finally {
      setLoading(false);
    }
  };

  const selectedLeader = employees.find(e => e.id.toString() === formData.teamLeaderId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)] z-10"
        >
          {/* Header ambient glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs font-semibold text-cyan-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Stage Pipeline</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-wide">
              Initialize Advanced Project
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure project scope, designate team leadership, and activate the 4-stage sequential workflow.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TOP SECTION: ASSIGN TEAM LEADER */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-white/[0.03] to-cyan-500/10 border border-purple-500/30 backdrop-blur-md shadow-inner">
              <label className="block text-xs font-semibold tracking-wider text-purple-300 mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Assign Team Leader *
              </label>
              <select
                name="teamLeaderId"
                value={formData.teamLeaderId}
                onChange={handleChange}
                required
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
              >
                <option value="" className="text-black">Select an employee as Team Leader...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="text-black">
                    {emp.firstName} {emp.lastName} {emp.departmentName ? `• ${emp.departmentName}` : ''} {emp.branchName ? `(${emp.branchName})` : ''}
                  </option>
                ))}
              </select>

              {selectedLeader && (
                <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs shadow-md">
                    {selectedLeader.firstName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedLeader.firstName} {selectedLeader.lastName}</p>
                    <p className="text-gray-400 text-[11px]">{selectedLeader.departmentName || 'General'} • {selectedLeader.branchName || 'Main'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-400/20 text-yellow-300 font-semibold border border-yellow-400/30">
                    Lead
                  </span>
                </div>
              )}
            </div>

            {/* PREVIEW OF 4-STAGE PIPELINE */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Pipeline Sequential Stages Preview
              </p>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-cyan-400/30">
                  <StageLogo stage="DESIGN" status="IN_PROGRESS" size={38} />
                  <span className="text-[11px] text-cyan-300 font-medium mt-1">1. Design</span>
                  <span className="text-[9px] text-gray-400">UI/UX & Wireframes</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 opacity-80">
                  <StageLogo stage="RESOURCES" status="PENDING" size={38} />
                  <span className="text-[11px] text-gray-300 font-medium mt-1">2. Resources</span>
                  <span className="text-[9px] text-gray-500">Assets & Schema</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 opacity-80">
                  <StageLogo stage="DEVELOP_TEST" status="PENDING" size={38} />
                  <span className="text-[11px] text-gray-300 font-medium mt-1">3. Dev & Test</span>
                  <span className="text-[9px] text-gray-500">Build & QA</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 opacity-80">
                  <StageLogo stage="DEPLOY" status="PENDING" size={38} />
                  <span className="text-[11px] text-gray-300 font-medium mt-1">4. Deploy</span>
                  <span className="text-[9px] text-gray-500">Production Launch</span>
                </div>
              </div>
            </div>

            {/* PROJECT NAME & CLIENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. NextGen SaaS Portal"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Client Company *</label>
                <input
                  type="text"
                  name="clientName"
                  list="clients-list"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
                <datalist id="clients-list">
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* HEADLINE TITLE */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Headline / Objective</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. End-to-end customer portal with automated billing"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Target Completion Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Project Scope & Guidelines</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide architectural context, objectives, and deliverable standards..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* ACTIONS */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.clientName || !formData.teamLeaderId}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_28px_rgba(56,189,248,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <span>Initializing...</span>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Launch Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
