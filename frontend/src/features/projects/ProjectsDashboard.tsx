import React, { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject } from '../../api/projectsApi';
import { getClients } from '../../api/salesApi';
import { getDepartments, getAllEmployees } from '../../api/employeesApi';
import type { Project } from '../../api/projectsApi';
import type { Client } from '../../api/salesApi';
import { Plus, MoreVertical, Briefcase } from 'lucide-react';
import { ProjectDetails } from './ProjectDetails';
import { NewProjectModal } from './NewProjectModal';

export const ProjectsDashboard = () => {
 const [projects, setProjects] = useState<Project[]>([]);
 const [clients, setClients] = useState<Client[]>([]);
 const [departments, setDepartments] = useState<any[]>([]);
 const [employees, setEmployees] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedProject, setSelectedProject] = useState<Project | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
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
   await createProject(data, files);
   await fetchProjectsAndClients();
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

 if (selectedProject) {
 return <ProjectDetails project={selectedProject} onBack={() => setSelectedProject(null)} />;
 }

 return (
 <div className="p-8 h-full flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-light text-white">Projects</h2>
 <p className="text-sm text-gray-400 mt-1">Manage client projects and ongoing deliverables</p>
 </div>
 <button 
   onClick={() => setIsModalOpen(true)}
   className="flex items-center space-x-2 px-6 py-3 glass-btn-theme font-medium rounded-xl transition-all"
 >
 <Plus className="w-5 h-5" />
 <span>New Project</span>
 </button>
 </div>
 
 <NewProjectModal
   isOpen={isModalOpen}
   onClose={() => setIsModalOpen(false)}
   onSubmit={handleCreateProject}
   clients={clients}
   departments={departments}
   employees={employees}
 />

 {loading ? (
 <div className="text-gray-400 font-light animate-pulse">Loading projects...</div>
 ) : projects.length === 0 ? (
 <div className="text-gray-500 font-light py-12 text-center border border-white/5 rounded-[24px] border-dashed">
 No active projects. Start by creating one manually.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {projects.map((proj) => (
 <div 
 key={proj.id} 
 onClick={() => setSelectedProject(proj)}
 className="glass-card rounded-[24px] p-6 cursor-pointer border border-[#FF0000]/10 hover:border-[#FF0000]/30 hover:bg-[#FF0000]/[0.02] transition-all duration-300 backdrop-blur-xl group relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/10 rounded-full blur-3xl group-hover:bg-[#FF0000]/20 transition-colors"></div>
 
 <div className="flex justify-between items-start mb-4 relative">
 <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
 <Briefcase className="w-6 h-6 text-white/80" />
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

 <div className="relative">
 <h3 className="text-xl font-medium text-white mb-1 group-hover:text-[#FF0000] transition-colors">{proj.name}</h3>
 <p className="text-sm text-gray-400 mb-4">{proj.clientName}</p>

 {proj.assignedDepartmentName && (
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
 )}

 <div className="flex items-center justify-between">
 <span className={`px-3 py-1 rounded-full text-xs border ${
 proj.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border-green-500/20' :
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
 ))}
 </div>
 )}
 
   {/* Custom Delete Confirmation Modal */}
   {projectToDelete && (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
         onClick={() => setProjectToDelete(null)}
       />
       {/* Modal */}
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

