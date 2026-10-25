import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Pencil, ToggleLeft, ToggleRight, X, Check, Users, MapPin, Tag, Loader2 } from 'lucide-react';
import { getAllBranches, createBranch, updateBranch, toggleBranchStatus, type Branch } from '../../api/branchApi';
import { motion, AnimatePresence } from 'framer-motion';

interface BranchFormData {
  name: string;
  code: string;
  city: string;
}

const BranchFormModal = ({
  isOpen, onClose, onSubmit, initial, title
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => Promise<void>;
  initial?: Partial<BranchFormData>;
  title: string;
}) => {
  const [form, setForm] = useState<BranchFormData>({ name: '', code: '', city: '', ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) setForm({ name: '', code: '', city: '', ...initial });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTop: '1px solid rgba(255,255,255,0.3)',
          borderLeft: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 tracking-wider uppercase pl-1">Branch Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm"
              placeholder="e.g. Hyderabad, Bangalore"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 tracking-wider uppercase pl-1">Branch Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm font-mono"
                placeholder="e.g. HYD"
                maxLength={10}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 tracking-wider uppercase pl-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all text-sm"
                placeholder="e.g. Hyderabad"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name || !form.code}
              className="px-5 py-2.5 text-sm font-semibold bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {title}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const BranchManagementPanel = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await getAllBranches();
      setBranches(data);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleCreate = async (data: BranchFormData) => {
    await createBranch(data);
    await fetchBranches();
  };

  const handleEdit = async (data: BranchFormData) => {
    if (!editingBranch) return;
    await updateBranch(editingBranch.id, data);
    await fetchBranches();
  };

  const handleToggle = async (id: number) => {
    await toggleBranchStatus(id);
    await fetchBranches();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Branch Management</h2>
            <p className="text-sm text-white/40">{branches.length} branch{branches.length !== 1 ? 'es' : ''} configured</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      {/* Branch Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">No branches created yet</p>
          <p className="text-sm mt-1">Create your first branch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl p-5 border transition-all ${
                  branch.isActive
                    ? 'bg-white/[0.04] border-white/10 hover:border-blue-400/30 hover:bg-white/[0.06]'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
                style={{ backdropFilter: 'blur(20px)' }}
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                      branch.isActive ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {branch.code}
                    </span>
                    {!branch.isActive && (
                      <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingBranch(branch)}
                      className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Edit branch"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggle(branch.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        branch.isActive
                          ? 'text-green-400/70 hover:text-green-400 hover:bg-green-400/10'
                          : 'text-white/30 hover:text-white hover:bg-white/10'
                      }`}
                      title={branch.isActive ? 'Deactivate branch' : 'Activate branch'}
                    >
                      {branch.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Branch Name */}
                <h3 className="text-lg font-semibold text-white mb-1">{branch.name}</h3>

                {/* Meta */}
                <div className="space-y-1.5 mt-3">
                  {branch.city && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{branch.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{branch.employeeCount ?? 0} employee{(branch.employeeCount ?? 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Active indicator bar */}
                {branch.isActive && (
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-full" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isCreateOpen && (
          <BranchFormModal
            key="create"
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
            title="Add Branch"
          />
        )}
        {editingBranch && (
          <BranchFormModal
            key="edit"
            isOpen={!!editingBranch}
            onClose={() => setEditingBranch(null)}
            onSubmit={handleEdit}
            initial={{ name: editingBranch.name, code: editingBranch.code, city: editingBranch.city || '' }}
            title="Edit Branch"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
