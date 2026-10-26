import React, { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject } from '../../api/projectsApi';
import { getClients } from '../../api/salesApi';
import { getDepartments, getAllEmployees } from '../../api/employeesApi';
import type { Project } from '../../api/projectsApi';
import type { Client } from '../../api/salesApi';
import { Plus, MoreVertical, Briefcase, Sparkles, Crown } from 'lucide-react';
import { ProjectDetails } from './ProjectDetails';
import { NewProjectModal } from './NewProjectModal';
import { ProjectTypeModal } from './ProjectTypeModal';
import { NewAdvancedProjectModal } from './NewAdvancedProjectModal';
import { AdvancedProjectView } from './AdvancedProjectView';

export const ProjectsDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modals state
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isNormalModalOpen, setIsNormalModalOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjectsAndClients = async () => {
    try {
      setLoading(true);
      const [projectsData, clientsData, deptsData, empsData] = await Promise.all([
        getProjects().catch(() => []),
        getClients().catch(() => []),
        getDepartments().catch(() => []),
        getAllEmployees().catch(() => [])
      ]);
      setProjects(projectsData);
      setClients(clientsData);
      setDepartments(deptsData);
      setEmployees(empsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndClients();
  }, []);

  const handleCreateProject = async (data: any, files: File[]) => {
    const created = await createProject(data, files);
    await fetchProjectsAndClients();
    if (created && created.projectType === 'ADVANCED') {
      setSelectedProject(created);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setActiveDropdown(null);
    setProjectToDelete(project);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      await fetchProjectsAndClients();
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete project");
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // If a project is selected, render either Advanced or Normal details
  if (selectedProject) {
    if (selectedProject.projectType === 'ADVANCED') {
      return (
        <AdvancedProjectView
          project={selectedProject}
          employees={employees}
          onBack={() => setSelectedProject(null)}
          onRefreshProject={fetchProjectsAndClients}
        />
      );
    }
    return <ProjectDetails project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-light text-white tracking-wide">Projects</h2>
          <p className="text-sm text-gray-400 mt-1">Manage client projects, multi-stage pipelines, and ongoing deliverables</p>
        </div>
        <button 
          onClick={() => setIsTypeModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 glass-btn-theme font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* 1. Project Type Selector Modal (Normal vs Advanced) */}
      <ProjectTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelectNormal={() => {
          setIsTypeModalOpen(false);
          setIsNormalModalOpen(true);
        }}
        onSelectAdvanced={() => {
          setIsTypeModalOpen(false);
          setIsAdvancedModalOpen(true);
        }}
      />

      {/* 2. Normal Project Modal */}
      <NewProjectModal
        isOpen={isNormalModalOpen}
        onClose={() => setIsNormalModalOpen(false)}
        onSubmit={handleCreateProject}
        clients={clients}
        departments={departments}
        employees={employees}
      />

      {/* 3. Advanced Project Modal */}
      <NewAdvancedProjectModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        onSubmit={handleCreateProject}
        clients={clients}
        employees={employees}
      />

      {/* Project Cards Grid */}
      {loading ? (
        <div className="text-gray-400 font-light animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-500 font-light py-16 text-center border border-white/5 rounded-[24px] border-dashed">
          <p className="text-base">No active projects.</p>
          <p className="text-xs text-gray-600 mt-1">Click "New Project" to launch a Normal or Advanced multi-stage pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isAdvanced = proj.projectType === 'ADVANCED';

            return (
              <div 
                key={proj.id} 
                onClick={() => setSelectedProject(proj)}
                className={`glass-card rounded-[24px] p-6 cursor-pointer border transition-all duration-300 backdrop-blur-xl group relative overflow-hidden ${
                  isAdvanced
                    ? 'border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]'
                    : 'border-[#FF0000]/10 hover:border-[#FF0000]/30 hover:bg-[#FF0000]/[0.02]'
                }`}
              >
                {/* Background glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors ${
                  isAdvanced ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-[#FF0000]/10 group-hover:bg-[#FF0000]/20'
                }`} />
                
                {/* Card Top Bar */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Briefcase className="w-5 h-5 text-white/80" />
                    </div>
                    {isAdvanced ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-300 tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> ADVANCED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-400 tracking-wider">
                        NORMAL
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      className="text-gray-500 hover:text-white transition-colors p-2" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveDropdown(activeDropdown === proj.id ? null : proj.id);
                      }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeDropdown === proj.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                        <button
                          onClick={(e) => handleDeleteClick(e, proj)}
                          className="w-full px-4 py-2 text-left text-sm text-[#FF0000] hover:bg-[#FF0000]/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  <h3 className={`text-xl font-medium text-white mb-1 transition-colors ${
                    isAdvanced ? 'group-hover:text-cyan-300' : 'group-hover:text-[#FF0000]'
                  }`}>
                    {proj.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{proj.clientName}</p>

                  {/* ADVANCED: TEAM LEADER & 4-STAGE TRACKER */}
                  {isAdvanced ? (
                    <div className="space-y-3 mb-5">
                      {/* Team Leader Badge */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs">
                        <Crown className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-gray-400">Team Lead:</span>
                        <strong className="text-yellow-300 font-medium truncate">{proj.teamLeaderName || 'Jane Doe'}</strong>
                      </div>

                      {/* Mini 4-Stage Stepper */}
                      <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          proj.currentStage === 'DESIGN'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                            : proj.stages?.find(s => s.stageName === 'DESIGN')?.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}>
                          1. Design
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          proj.currentStage === 'RESOURCES'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                            : proj.stages?.find(s => s.stageName === 'RESOURCES')?.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}>
                          2. Resources
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          proj.currentStage === 'DEVELOP_TEST'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                            : proj.stages?.find(s => s.stageName === 'DEVELOP_TEST')?.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}>
                          3. Dev
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                          proj.currentStage === 'DEPLOY'
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                            : proj.stages?.find(s => s.stageName === 'DEPLOY')?.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}>
                          4. Deploy
                        </span>
                      </div>
                    </div>
                  ) : (
                    proj.assignedDepartmentName && (
                      <div className="flex flex-col space-y-1 mb-6 text-xs bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center text-gray-400">
                          <span className="w-16">Dept:</span>
                          <span className="text-white font-medium">{proj.assignedDepartmentName}</span>
                        </div>
                        {proj.assignedEmployeeName && (
                          <div className="flex items-center text-gray-400">
                            <span className="w-16">Assignee:</span>
                            <span className="text-gray-200">{proj.assignedEmployeeName}</span>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Footer status */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      proj.status === 'COMPLETED' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20' :
                      proj.status === 'EXECUTION' ? 'bg-blue-900/30 text-blue-400 border-blue-500/20' :
                      'bg-purple-900/30 text-purple-400 border-purple-500/20'
                    }`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      Manager: <span className="text-gray-300 ml-1">{proj.managerName || 'Unassigned'}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setProjectToDelete(null)}
          />
          <div className="relative glass-card bg-black/40 border border-white/10 rounded-[24px] p-8 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/10 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-light text-white mb-2">Delete Project</h3>
            <p className="text-gray-400 mb-8 font-light">
              Are you sure you want to permanently delete <span className="text-white font-medium">{projectToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProject}
                className="px-6 py-2.5 rounded-full text-sm font-medium bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/40 hover:bg-[#FF0000]/30 transition-all shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
