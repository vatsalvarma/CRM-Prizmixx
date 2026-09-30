import React from 'react';
import { markWorkAsComplete } from '../../api/workApi';
import type { Work } from '../../api/workApi';
import { X, CheckCircle, FileText, Link as LinkIcon, Building2, User } from 'lucide-react';

interface WorkDetailsDrawerProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const WorkDetailsDrawer = ({ work, isOpen, onClose, onUpdate }: WorkDetailsDrawerProps) => {
  if (!isOpen) return null;

  const handleMarkComplete = async () => {
    try {
      await markWorkAsComplete(work.id);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to mark work as complete:', err);
      alert('Failed to update work status');
    }
  };

  return (
    <>
      {/* Heavy Blur Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Animated Slide-in Drawer with Premium Glassmorphism */}
      <div className="fixed inset-y-0 right-0 w-[500px] z-50 flex flex-col animate-slide-in-right 
                      bg-[#0a0a0a]/70 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Subtle top/left gradient glow for the glass edge */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

        <div className="relative p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-2xl font-light text-white tracking-wide">{work.name}</h2>
            <p className="text-sm text-gray-400 mt-2 font-light tracking-wide">Assigned on {new Date(work.assignedDate).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full transition-all duration-300 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center tracking-widest uppercase text-xs">
              <FileText className="w-4 h-4 mr-3 opacity-50" /> Description
            </h3>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap shadow-inner backdrop-blur-md">
              {work.description}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center text-xs uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 mr-2 opacity-50" /> Department
              </h3>
              <p className="text-white font-medium">{work.departmentName}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center text-xs uppercase tracking-wider">
                <User className="w-3.5 h-3.5 mr-2 opacity-50" /> Assignee
              </h3>
              <p className="text-white font-medium">{work.assignedEmployeeName}</p>
            </div>
          </div>

          {(work.referenceLinks || work.documentPdf) && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center tracking-widest uppercase text-xs">
                <LinkIcon className="w-4 h-4 mr-3 opacity-50" /> Resources
              </h3>
              <div className="space-y-3">
                {work.referenceLinks && (
                  <a href={work.referenceLinks} target="_blank" rel="noopener noreferrer" className="group flex items-center w-full px-5 py-4 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 border border-blue-500/10 hover:border-blue-500/30 rounded-2xl text-sm transition-all duration-300 backdrop-blur-md">
                    <span className="bg-blue-500/20 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">🔗</span> 
                    Reference Link
                  </a>
                )}
                {work.documentPdf && (
                  <a href={work.documentPdf} target="_blank" rel="noopener noreferrer" className="group flex items-center w-full px-5 py-4 bg-red-500/5 hover:bg-red-500/10 text-red-300 border border-red-500/10 hover:border-red-500/30 rounded-2xl text-sm transition-all duration-300 backdrop-blur-md">
                    <span className="bg-red-500/20 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">📄</span> 
                    Document / PDF
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        <div className="relative p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="flex space-x-4">
            {!work.completed ? (
              <button
                onClick={handleMarkComplete}
                className="flex-1 glass-btn-theme py-4 rounded-2xl flex items-center justify-center space-x-3 group"
              >
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold tracking-wide">Mark as Complete</span>
              </button>
            ) : (
              <div className="flex-1 bg-green-500/10 border border-green-500/20 text-green-400 py-4 rounded-2xl flex items-center justify-center space-x-3 backdrop-blur-md">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
