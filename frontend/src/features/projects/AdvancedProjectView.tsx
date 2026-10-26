import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  Clock,
  Lock,
  Users,
  Link as LinkIcon,
  ExternalLink,
  GitBranch,
  FolderGit2,
  FileText,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Building2,
  UserPlus,
  X
} from 'lucide-react';
import {
  getProject,
  getProjectStages,
  updateProjectStage,
  submitStageWork,
  completeStage,
  reopenStage,
  assignTeamLeader,
  type Project,
  type ProjectStage,
  type StageAssignee
} from '../../api/projectsApi';
import { useAuthStore } from '../../store/authStore';
import { StageLogo } from './ProjectAnimatedLogos';

interface AdvancedProjectViewProps {
  project: Project;
  employees: { id: number; firstName: string; lastName: string; departmentName?: string; branchName?: string; email?: string }[];
  onBack: () => void;
  onRefreshProject?: () => void;
}

const STAGE_KEYS = ['DESIGN', 'RESOURCES', 'DEVELOP_TEST', 'DEPLOY'] as const;

const STAGE_METADATA: Record<string, { label: string; defaultTitle: string; subtitle: string }> = {
  DESIGN: {
    label: 'Design',
    defaultTitle: 'Design & Prototyping',
    subtitle: 'UI/UX mockups, wireframes, style guides, and design tokens'
  },
  RESOURCES: {
    label: 'Resources',
    defaultTitle: 'Resources & Assets',
    subtitle: 'Database schemas, third-party API keys, graphics, and dependencies'
  },
  DEVELOP_TEST: {
    label: 'Develop & Test',
    defaultTitle: 'Develop & Test',
    subtitle: 'Feature coding, backend/frontend integration, unit tests, and QA'
  },
  DEPLOY: {
    label: 'Deploy',
    defaultTitle: 'Deploy & Production',
    subtitle: 'Staging verification, CI/CD pipeline, production rollout, and smoke testing'
  }
};

export const AdvancedProjectView: React.FC<AdvancedProjectViewProps> = ({
  project: initialProject,
  employees,
  onBack,
  onRefreshProject
}) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [activeStageKey, setActiveStageKey] = useState<string>('DESIGN');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for the currently selected stage
  const [stageDescription, setStageDescription] = useState('');
  const [stageReferenceLinks, setStageReferenceLinks] = useState('');
  const [stageAssigneeIds, setStageAssigneeIds] = useState<number[]>([]);

  // Submission state
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Team leader modal/reassign state
  const [isChangingTeamLeader, setIsChangingTeamLeader] = useState(false);
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState<string>('');

  // Selected employee to add
  const [employeeToAdd, setEmployeeToAdd] = useState<string>('');

  const { role, email: userEmail } = useAuthStore();
  const isAdmin = role === 'ADMIN' || role === 'SYSTEM_MASTER';

  const fetchStagesAndProject = async () => {
    try {
      setLoading(true);
      const [updatedProj, stagesData] = await Promise.all([
        getProject(project.id),
        getProjectStages(project.id)
      ]);
      setProject(updatedProj);
      setStages(stagesData);

      // Default active stage: current stage or first in-progress
      const current = stagesData.find(s => s.status === 'IN_PROGRESS') ||
                      stagesData.find(s => s.stageName === updatedProj.currentStage) ||
                      stagesData[0];
      if (current) {
        setActiveStageKey(current.stageName);
      }
    } catch (err) {
      console.error('Failed to fetch stages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStagesAndProject();
  }, [project.id]);

  const activeStage = stages.find(s => s.stageName === activeStageKey) || stages[0];

  // Sync form inputs when active stage changes
  useEffect(() => {
    if (activeStage) {
      setStageDescription(activeStage.description || '');
      setStageReferenceLinks(activeStage.referenceLinks || '');
      setStageAssigneeIds(activeStage.assignees ? activeStage.assignees.map(a => a.id) : []);
      setSubmissionLink(activeStage.submissionLink || '');
      setSubmissionNotes(activeStage.submissionNotes || '');
    }
  }, [activeStageKey, activeStage]);

  // Handle stage config save (Admin / Team Lead)
  const handleSaveStageConfig = async () => {
    if (!activeStage) return;
    try {
      setActionLoading(true);
      const updated = await updateProjectStage(project.id, activeStage.stageName, {
        description: stageDescription,
        referenceLinks: stageReferenceLinks,
        assigneeEmployeeIds: stageAssigneeIds
      });

      // Update in state
      setStages(prev => prev.map(s => s.id === updated.id ? updated : s));
      alert('Stage requirements & assignees updated successfully!');
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('Failed to update stage details');
    } finally {
      setActionLoading(false);
    }
  };

  // Add employee to active stage assignees
  const handleAddAssignee = () => {
    if (!employeeToAdd) return;
    const empId = parseInt(employeeToAdd);
    if (!stageAssigneeIds.includes(empId)) {
      setStageAssigneeIds(prev => [...prev, empId]);
    }
    setEmployeeToAdd('');
  };

  // Remove employee from active stage assignees
  const handleRemoveAssignee = (empId: number) => {
    setStageAssigneeIds(prev => prev.filter(id => id !== empId));
  };

  // Submit work link and notes
  const handleSubmitWork = async () => {
    if (!submissionLink.trim()) {
      alert('Please enter a Google Drive, GitHub, or Figma link');
      return;
    }
    try {
      setActionLoading(true);
      const updated = await submitStageWork(project.id, activeStage.stageName, {
        submissionLink: submissionLink.trim(),
        submissionNotes: submissionNotes.trim()
      });
      setStages(prev => prev.map(s => s.id === updated.id ? updated : s));
      alert('Work deliverable link submitted successfully!');
    } catch (err) {
      console.error('Failed to submit work:', err);
      alert('Failed to submit work');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as Complete
  const handleCompleteStage = async () => {
    if (!activeStage) return;
    try {
      setActionLoading(true);
      // Auto-save submission link if typed
      if (submissionLink.trim() && submissionLink !== activeStage.submissionLink) {
        await submitStageWork(project.id, activeStage.stageName, {
          submissionLink: submissionLink.trim(),
          submissionNotes: submissionNotes.trim()
        });
      }

      await completeStage(project.id, activeStage.stageName);
      await fetchStagesAndProject();
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to complete stage:', err);
      alert('Failed to mark stage as complete');
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen stage
  const handleReopenStage = async () => {
    if (!activeStage) return;
    try {
      setActionLoading(true);
      await reopenStage(project.id, activeStage.stageName);
      await fetchStagesAndProject();
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to reopen stage:', err);
      alert('Failed to reopen stage');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Team Leader change
  const handleReassignTeamLeader = async () => {
    if (!selectedNewLeaderId) return;
    try {
      setActionLoading(true);
      const updatedProj = await assignTeamLeader(project.id, parseInt(selectedNewLeaderId));
      setProject(updatedProj);
      setIsChangingTeamLeader(false);
      setSelectedNewLeaderId('');
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to assign team leader:', err);
      alert('Failed to reassign team leader');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate progress %
  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = (completedCount / 4) * 100;

  // Detect link provider icon
  const getLinkIcon = (url: string) => {
    if (!url) return <LinkIcon className="w-4 h-4 text-gray-400" />;
    const lower = url.toLowerCase();
    if (lower.includes('github.com')) return <GitBranch className="w-4 h-4 text-purple-400" />;
    if (lower.includes('drive.google.com') || lower.includes('docs.google.com'))
      return <FolderGit2 className="w-4 h-4 text-emerald-400" />;
    if (lower.includes('figma.com')) return <Sparkles className="w-4 h-4 text-rose-400" />;
    return <ExternalLink className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & METADATA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Projects</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-light text-white tracking-wide">
              {project.name}
            </h1>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.25)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              ADVANCED PIPELINE
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              project.status === 'COMPLETED'
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
            }`}>
              {project.status}
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span>Client: <strong className="text-gray-200">{project.clientName}</strong></span>
            {project.title && <span>• {project.title}</span>}
          </p>
        </div>

        {/* TEAM LEADER CARD (Top Section) */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-transparent border border-yellow-500/30 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold text-lg shadow-lg">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">Team Leader</span>
              {isAdmin && (
                <button
                  onClick={() => setIsChangingTeamLeader(true)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  Change
                </button>
              )}
            </div>
            <h4 className="text-base font-semibold text-white">
              {project.teamLeaderName || 'Unassigned'}
            </h4>
            <p className="text-xs text-gray-400">Project Execution Authority</p>
          </div>
        </div>
      </div>

      {/* REASSIGN TEAM LEADER MODAL */}
      {isChangingTeamLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 border border-yellow-500/30 shadow-2xl">
            <button
              onClick={() => setIsChangingTeamLeader(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> Assign Team Leader
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Select an employee from any department or branch to lead this project.
            </p>
            <select
              value={selectedNewLeaderId}
              onChange={(e) => setSelectedNewLeaderId(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 mb-6"
            >
              <option value="" className="text-black">Choose employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id} className="text-black">
                  {emp.firstName} {emp.lastName} {emp.departmentName ? `• ${emp.departmentName}` : ''} {emp.branchName ? `(${emp.branchName})` : ''}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsChangingTeamLeader(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignTeamLeader}
                disabled={actionLoading || !selectedNewLeaderId}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANIMATED 4-STAGE PROGRESS STEPPER */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <span>Pipeline Stage Progression</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30">
                {Math.round(progressPercent)}% Completed
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Click any stage to view requirements, manage assignees, or submit work.
            </p>
          </div>

          {project.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>All 4 Stages Complete!</span>
            </div>
          )}
        </div>

        {/* PROGRESS BAR TRACK & ICONS */}
        <div className="relative pt-4 pb-2">
          {/* Background Connecting Bar */}
          <div className="absolute top-1/2 left-8 right-8 h-1.5 -translate-y-1/2 bg-white/10 rounded-full z-0" />

          {/* Animated Filled Gradient Progress Bar */}
          <motion.div
            className="absolute top-1/2 left-8 h-1.5 -translate-y-1/2 rounded-full z-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]"
            initial={{ width: 0 }}
            animate={{ width: `calc(${progressPercent}% - 3rem)` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* 4 Stage Nodes */}
          <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-6">
            {STAGE_KEYS.map((key, idx) => {
              const stageData = stages.find(s => s.stageName === key);
              const status = stageData ? stageData.status : 'PENDING';
              const isSelected = activeStageKey === key;
              const meta = STAGE_METADATA[key];

              return (
                <div
                  key={key}
                  onClick={() => setActiveStageKey(key)}
                  className={`cursor-pointer flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-white/15 border-2 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.3)] -translate-y-1.5'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:-translate-y-1'
                  }`}
                >
                  {/* Stage Logo with Draw Animation */}
                  <div className="mb-2">
                    <StageLogo stage={key} status={status} size={48} />
                  </div>

                  <span className={`text-xs sm:text-sm font-semibold tracking-wide ${
                    isSelected ? 'text-cyan-300' : 'text-gray-200'
                  }`}>
                    {idx + 1}. {meta.label}
                  </span>

                  {/* Status Indicator */}
                  <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                    {status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-medium animate-pulse">
                        <Clock className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
                        <Lock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ACTIVE STAGE WORKSPACE & SUBMISSION PANEL */}
      {activeStage && (
        <motion.div
          key={activeStage.stageName}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT 2 COLS: STAGE REQUIREMENTS & MULTI-EMPLOYEE ASSIGNMENTS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-6">
              
              {/* Stage Banner */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <StageLogo stage={activeStage.stageName} status={activeStage.status} size={56} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        Stage {activeStage.stageOrder} of 4
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        activeStage.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : activeStage.status === 'IN_PROGRESS'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {activeStage.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-medium text-white mt-1">
                      {activeStage.title || STAGE_METADATA[activeStage.stageName]?.defaultTitle}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {STAGE_METADATA[activeStage.stageName]?.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* MULTI-EMPLOYEE ASSIGNMENT SECTION (Admin can assign 1 or more employees from ANY department) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold tracking-wider text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Assigned Employees ({stageAssigneeIds.length})
                  </label>
                  <span className="text-[11px] text-gray-500">From any department</span>
                </div>

                {/* Chips of assigned employees */}
                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-black/40 border border-white/10">
                  {stageAssigneeIds.length === 0 ? (
                    <span className="text-xs text-gray-500 italic py-1">No employees assigned yet. Use the selector below to assign team members.</span>
                  ) : (
                    stageAssigneeIds.map(empId => {
                      const emp = employees.find(e => e.id === empId);
                      if (!emp) return null;
                      return (
                        <span
                          key={empId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-xs text-cyan-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-cyan-400/30 flex items-center justify-center font-bold text-[10px] text-cyan-200">
                            {emp.firstName.charAt(0)}
                          </span>
                          <span>{emp.firstName} {emp.lastName}</span>
                          {emp.departmentName && (
                            <span className="text-[10px] text-gray-400">• {emp.departmentName}</span>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignee(empId)}
                              className="text-cyan-300 hover:text-red-400 ml-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Add Assignee Dropdown (Admin / Team Lead) */}
                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <select
                      value={employeeToAdd}
                      onChange={(e) => setEmployeeToAdd(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="" className="text-black">Assign an employee from any department...</option>
                      {employees
                        .filter(e => !stageAssigneeIds.includes(e.id))
                        .map(emp => (
                          <option key={emp.id} value={emp.id} className="text-black">
                            {emp.firstName} {emp.lastName} — {emp.departmentName || 'General'} ({emp.branchName || 'Main'})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddAssignee}
                      disabled={!employeeToAdd}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                )}
              </div>

              {/* STAGE DESCRIPTION / REQUIREMENTS */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Stage Description & Requirements
                </label>
                <textarea
                  rows={4}
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  disabled={!isAdmin && project.teamLeaderName !== userEmail}
                  placeholder="Provide technical specifications, wireframe requirements, acceptance criteria..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none disabled:opacity-75"
                />
              </div>

              {/* REFERENCE LINKS */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-gray-300 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                  Reference Links (Figma, PRD, API Docs)
                </label>
                <input
                  type="text"
                  value={stageReferenceLinks}
                  onChange={(e) => setStageReferenceLinks(e.target.value)}
                  disabled={!isAdmin && project.teamLeaderName !== userEmail}
                  placeholder="e.g. https://figma.com/file/... or https://notion.so/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-75"
                />
                {stageReferenceLinks && (
                  <div className="pt-1">
                    <a
                      href={stageReferenceLinks.startsWith('http') ? stageReferenceLinks : `https://${stageReferenceLinks}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Reference Link</span>
                    </a>
                  </div>
                )}
              </div>

              {/* SAVE STAGE DETAILS BUTTON (Admin / Team Lead) */}
              {isAdmin && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveStageConfig}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save Stage Config & Assignees</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COL: DELIVERABLE SUBMISSION BOX & MARK AS COMPLETE */}
          <div className="space-y-6">
            
            {/* SUBMISSION CARD */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-cyan-500/30 space-y-5 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-cyan-400" />
                  Work Deliverable
                </h3>
                <span className="text-[11px] text-gray-400">Submission Box</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Submit work as a link of Google Drive, GitHub repository, or Figma project file.
              </p>

              {/* SUBMISSION LINK INPUT */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-gray-300">
                  Deliverable URL *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {getLinkIcon(submissionLink)}
                  </div>
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://drive.google.com/... or https://github.com/..."
                    className="w-full bg-black/60 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-xs"
                  />
                </div>
              </div>

              {/* SUBMISSION NOTES */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-gray-300">
                  Submission Notes / Summary
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Provide PR details, commit hash, access instructions, or preview notes..."
                  className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              {/* SAVE SUBMISSION LINK BUTTON */}
              <button
                onClick={handleSubmitWork}
                disabled={actionLoading || !submissionLink.trim()}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Deliverable Link</span>
              </button>

              {/* CURRENTLY SUBMITTED DELIVERABLE BADGE (If exists) */}
              {activeStage.submissionLink && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-400" /> Current Deliverable:
                    </span>
                    {activeStage.submittedByName && (
                      <span className="text-[10px] text-gray-400">By {activeStage.submittedByName}</span>
                    )}
                  </div>
                  <a
                    href={activeStage.submissionLink.startsWith('http') ? activeStage.submissionLink : `https://${activeStage.submissionLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[11px] break-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span>{activeStage.submissionLink}</span>
                  </a>
                  {activeStage.submissionNotes && (
                    <p className="text-gray-300 text-[11px] pt-1 italic">"{activeStage.submissionNotes}"</p>
                  )}
                </div>
              )}

              {/* 4. MARK AS COMPLETE / REOPEN ACTION BAR */}
              <div className="pt-2">
                {activeStage.status !== 'COMPLETED' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCompleteStage}
                    disabled={actionLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-black" />
                    <span>Mark as Complete</span>
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-center">
                      <p className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Stage Completed Successfully!
                      </p>
                      {activeStage.completedAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Finished {new Date(activeStage.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={handleReopenStage}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Reopen Stage for Revision</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* STAGE HELP HINT */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                When <strong>Mark as Complete</strong> is clicked, the progress bar moves automatically to the next stage logo, and unlocks the next phase for assigned employees.
              </span>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
};
