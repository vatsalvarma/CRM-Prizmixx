import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Check, Layers, GitBranch } from 'lucide-react';
import { NormalProjectLogo, AdvancedProjectLogo } from './ProjectAnimatedLogos';

interface ProjectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNormal: () => void;
  onSelectAdvanced: () => void;
}

export const ProjectTypeModal: React.FC<ProjectTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectNormal,
  onSelectAdvanced
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Ambient Background Lighting */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Project Architecture Selector</span>
            </motion.div>
            <h2 className="text-3xl font-light text-white tracking-wide">
              Create New Project
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Choose the execution model best suited for your team and deliverables.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OPTION 1: NORMAL PROJECT */}
            <motion.div
              whileHover={{ y: -6, borderColor: 'rgba(56, 189, 248, 0.4)' }}
              transition={{ duration: 0.2 }}
              onClick={onSelectNormal}
              className="group relative cursor-pointer flex flex-col justify-between p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <NormalProjectLogo size={64} />
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] font-semibold tracking-wider text-blue-400">
                    STANDARD
                  </span>
                </div>

                <h3 className="text-xl font-medium text-white group-hover:text-sky-300 transition-colors">
                  Normal Project
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Traditional CRM project workflow with Kanban boards, department delegation, file attachments, and deliverable tracking.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Traditional Kanban Task Board (TODO → Done)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Single Department & Employee Delegation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Client & Document Asset Attachments</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-sm font-medium text-sky-400 group-hover:text-white">
                <span>Select Normal Project</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

            {/* OPTION 2: ADVANCED PROJECT */}
            <motion.div
              whileHover={{ y: -6, borderColor: 'rgba(192, 132, 252, 0.5)' }}
              transition={{ duration: 0.2 }}
              onClick={onSelectAdvanced}
              className="group relative cursor-pointer flex flex-col justify-between p-7 rounded-2xl bg-gradient-to-b from-purple-500/[0.08] via-white/[0.03] to-cyan-500/[0.08] hover:bg-white/[0.06] border border-purple-500/30 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(129,140,248,0.25)]"
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-start justify-between mb-5">
                  <AdvancedProjectLogo size={64} />
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-[11px] font-semibold tracking-wider text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                    ⚡ MULTI-STAGE PIPELINE
                  </span>
                </div>

                <h3 className="text-xl font-medium text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  Advanced Project
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Enterprise 4-stage sequential lifecycle with dedicated Team Leader, multi-department stage assignees, deliverable links, and automated progress stepper.
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-gray-200">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>Dedicated Team Leader</strong> selected by Admin</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>4-Stage Stepper:</strong> Design → Resources → Dev & Test → Deploy</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>Multi-Department:</strong> Assign 1+ employees to each stage</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>Work Submissions:</strong> Google Drive / GitHub link + Mark as Complete</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-sm font-medium text-cyan-300 group-hover:text-white">
                <span>Launch Advanced Pipeline</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
