import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, XCircle, File as FileIcon, Image as ImageIcon } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, files: File[]) => Promise<void>;
  clients: { id: number; companyName: string }[];
  departments: { id: number; name: string }[];
  employees: { id: number; firstName: string; lastName: string; departmentName: string }[];
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit, clients, departments, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    referenceLinks: '',
    clientName: '',
    startDate: '',
    endDate: '',
    assignedDepartmentId: '',
    assignedEmployeeId: ''
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        name: formData.name,
        title: formData.title,
        description: formData.description,
        referenceLinks: formData.referenceLinks,
        clientName: formData.clientName,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        assignedDepartmentId: formData.assignedDepartmentId ? parseInt(formData.assignedDepartmentId) : undefined,
        assignedEmployeeId: formData.assignedEmployeeId ? parseInt(formData.assignedEmployeeId) : undefined
      }, files);
      
      // Reset form
      setFormData({
        name: '', title: '', description: '', referenceLinks: '', clientName: '', startDate: '', endDate: '', assignedDepartmentId: '', assignedEmployeeId: ''
      });
      setFiles([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-card rounded-3xl p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-light text-white mb-6">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Client Name *</label>
              <input
                type="text"
                name="clientName"
                required
                value={formData.clientName || ''}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                list="client-options"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
              />
              <datalist id="client-options">
                {clients.map(client => (
                  <option key={client.id} value={client.companyName} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Website Redesign"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assign Department</label>
              <select
                name="assignedDepartmentId"
                value={formData.assignedDepartmentId}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20"
              >
                <option value="" className="bg-gray-900">Select Department</option>
                {departments?.map(dept => (
                  <option key={dept.id} value={dept.id} className="bg-gray-900">{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Assign Employee</label>
              <select
                name="assignedEmployeeId"
                value={formData.assignedEmployeeId}
                onChange={handleChange}
                disabled={!formData.assignedDepartmentId}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 disabled:opacity-50"
              >
                <option value="" className="bg-gray-900">
                  {!formData.assignedDepartmentId ? 'Select Department First' : 'Select Employee'}
                </option>
                {formData.assignedDepartmentId && employees
                  ?.filter(emp => emp.departmentName === departments?.find(d => d.id.toString() === formData.assignedDepartmentId)?.name)
                  .map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-gray-900">{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Acme Corp Web Portal v2.0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project scope and objectives..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reference Links</label>
            <textarea
              name="referenceLinks"
              rows={2}
              value={formData.referenceLinks}
              onChange={handleChange}
              placeholder="https://example.com&#10;https://figma.com/file/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
            <p className="text-xs text-gray-500 mt-1">Add URLs (one per line)</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Attachments (Documents, PDFs, Images)</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click or drag files to upload</p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {f.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-purple-400" /> : <FileIcon className="w-4 h-4 text-blue-400" />}
                      <span className="text-sm text-gray-300 truncate max-w-[200px]">{f.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-btn-theme px-8 py-2 rounded-xl font-medium"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
