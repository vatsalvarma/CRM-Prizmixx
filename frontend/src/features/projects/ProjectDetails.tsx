import React, { useEffect, useState } from 'react';
import { getProjectTasks, updateTaskStatus } from '../../api/projectsApi';
import type { Project, Task } from '../../api/projectsApi';
import { ArrowLeft, Plus, Calendar, User, Play, CheckCircle2 } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { createTask } from '../../api/projectsApi';

interface Props {
 project: Project;
 onBack: () => void;
}

const STATUS_COLUMNS = ['TODO', 'IN_PROGRESS', 'TEST', 'REVIEW', 'COMPLETED'];

export const ProjectDetails = ({ project, onBack }: Props) => {
 const [tasks, setTasks] = useState<Task[]>([]);
 const [loading, setLoading] = useState(true);
 const [isCreatingTask, setIsCreatingTask] = useState(false);
 const [newTaskTitle, setNewTaskTitle] = useState('');

 // Listen for real-time task updates
 useWebSocket(`/topic/projects/${project.id}/tasks`, () => {
   fetchTasks();
 });

 const fetchTasks = async () => {
 try {
 setLoading(true);
 const data = await getProjectTasks(project.id);
 setTasks(data);
 } catch (err) {
 console.error('Error fetching tasks:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchTasks();
 }, [project.id]);

 const handleStatusChange = async (taskId: number, newStatus: string) => {
 try {
 await updateTaskStatus(taskId, newStatus);
 fetchTasks(); // Refresh board
 } catch (err) {
 alert('Failed to update task status');
 }
 };

 const handleCreateTask = async () => {
   if (!newTaskTitle.trim()) {
     setIsCreatingTask(false);
     return;
   }
   
   try {
     await createTask({
       projectId: project.id,
       title: newTaskTitle.trim(),
       status: 'TODO',
       priority: 'MEDIUM'
     });
     setNewTaskTitle('');
     setIsCreatingTask(false);
     fetchTasks();
   } catch (err) {
     alert('Failed to create task');
   }
 };

 const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   e.target.style.height = 'auto';
   e.target.style.height = e.target.scrollHeight + 'px';
   setNewTaskTitle(e.target.value);
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
   if (e.key === 'Enter' && !e.shiftKey) {
     e.preventDefault();
     handleCreateTask();
   }
 };

 const getPriorityColor = (priority: string) => {
 switch (priority) {
 case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
 case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
 case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
 default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
 }
 };

 return (
 <div className="p-8 flex flex-col animate-in fade-in duration-300">
 {/* Header */}
 <div className="flex items-center space-x-4 mb-8">
 <button 
 onClick={onBack}
 className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
 >
 <ArrowLeft className="w-6 h-6" />
 </button>
 <div className="flex-1">
 <div className="flex items-center space-x-3 mb-1">
 <h2 className="text-3xl font-light text-white">{project.name}</h2>
 <span className="px-3 py-1 rounded-full text-xs border bg-purple-900/30 text-purple-400 border-purple-500/20">
 {project.status}
 </span>
 </div>
 {project.title && <p className="text-lg text-gray-200 mb-1">{project.title}</p>}
 <p className="text-sm text-[#FF0000]">{project.clientName}</p>
 </div>
 <button 
   onClick={() => setIsCreatingTask(true)}
   className="flex items-center space-x-2 px-6 py-2 glass-btn-theme font-medium rounded-xl transition-all"
 >
 <Plus className="w-5 h-5" />
 <span>Add Task</span>
 </button>
 </div>

 {/* Project Info & Attachments */}
 <div className="grid grid-cols-3 gap-6 mb-8">
   <div className="col-span-2 glass-card rounded-[24px] p-6 text-sm">
     <h3 className="text-white font-medium mb-3">Project Description</h3>
     <p className="text-gray-400 whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
     
     {project.referenceLinks && (
       <div className="mt-6">
         <h3 className="text-white font-medium mb-3">Reference Links</h3>
         <ul className="space-y-2">
           {project.referenceLinks.split('\n').filter(l => l.trim()).map((link, i) => (
             <li key={i}>
               <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all">
                 {link}
               </a>
             </li>
           ))}
         </ul>
       </div>
     )}
   </div>
   
   <div className="glass-card rounded-[24px] p-6 text-sm">
     <h3 className="text-white font-medium mb-4">Attachments</h3>
     {project.attachments && project.attachments.length > 0 ? (
       <div className="space-y-3">
         {project.attachments.map(att => (
           <a 
             key={att.id} 
             href={att.url} 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
           >
             <div className="flex-1 truncate text-gray-300 group-hover:text-white transition-colors">
               {att.fileName}
             </div>
           </a>
         ))}
       </div>
     ) : (
       <p className="text-gray-500 italic">No attachments</p>
     )}
   </div>
 </div>

 {/* Kanban Board */}
 {loading ? (
 <div className="text-gray-400 font-light animate-pulse">Loading board...</div>
 ) : (
 <div className="flex space-x-6 overflow-x-auto flex-1 pb-4 custom-scrollbar">
 {STATUS_COLUMNS.map(status => (
 <div key={status} className="flex flex-col w-[320px] shrink-0">
 <div className="flex justify-between items-center mb-4 px-2">
 <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{status.replace('_', ' ')}</h3>
 <span className="bg-[#171717] text-[#FF0000] text-xs px-2 py-1 rounded-full border border-white/5">
 {tasks.filter(t => t.status === status).length}
 </span>
 </div>
 
 <div className="flex-1 glass-card rounded-[24px] p-4 space-y-4 min-h-[500px]">
  
  {/* Inline Task Creation Card */}
  {status === 'TODO' && isCreatingTask && (
    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
      <textarea
        autoFocus
        value={newTaskTitle}
        onChange={handleInputResize}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!newTaskTitle.trim()) setIsCreatingTask(false);
        }}
        placeholder="Type your task and press Enter..."
        className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none overflow-hidden min-h-[40px]"
        rows={1}
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button 
          onClick={() => setIsCreatingTask(false)}
          className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleCreateTask}
          className="px-3 py-1 text-xs bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30 rounded-lg hover:bg-[#FF0000]/30 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )}

  {tasks.filter(t => t.status === status).map(task => (
  <div 
  key={task.id} 
  className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-[#FF0000]/50 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,0,0,0.1)] transition-all group flex flex-col"
  >
 <div className="flex justify-between items-start mb-2">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
 {task.priority}
 </span>
 <select 
 value={task.status}
 onChange={(e) => handleStatusChange(task.id, e.target.value)}
 className="bg-[#090909] text-xs text-gray-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity"
 >
 {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
 </select>
 </div>
 
 <h4 className="text-white font-medium mb-2">{task.title}</h4>
 {task.description && (
 <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description}</p>
 )}
 
 <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
 <div className="flex items-center space-x-2">
   <div className="flex items-center text-xs text-gray-500">
     <User className="w-3 h-3 mr-1" />
     <span className="truncate max-w-[80px]">{task.assigneeName || 'Unassigned'}</span>
   </div>
   {task.dueDate && (
   <div className="flex items-center text-xs text-gray-500">
     <Calendar className="w-3 h-3 mr-1" />
     <span>{new Date(task.dueDate).toLocaleDateString()}</span>
   </div>
   )}
 </div>
 
 {/* Quick Action Buttons */}
 {task.status === 'TODO' && (
   <button 
     onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
     className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs transition-colors opacity-0 group-hover:opacity-100"
   >
     <Play className="w-3 h-3" />
     <span>Start</span>
   </button>
 )}
 {task.status === 'IN_PROGRESS' && (
   <button 
     onClick={() => handleStatusChange(task.id, 'TEST')}
     className="flex items-center space-x-1 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-xs transition-colors opacity-0 group-hover:opacity-100"
   >
     <ArrowLeft className="w-3 h-3 rotate-180" />
     <span>To Test</span>
   </button>
 )}
 {task.status === 'TEST' && (
   <button 
     onClick={() => handleStatusChange(task.id, 'REVIEW')}
     className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs transition-colors opacity-0 group-hover:opacity-100"
   >
     <ArrowLeft className="w-3 h-3 rotate-180" />
     <span>To Review</span>
   </button>
 )}
 {task.status === 'REVIEW' && (
   <button 
     onClick={() => handleStatusChange(task.id, 'COMPLETED')}
     className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs transition-colors opacity-0 group-hover:opacity-100"
   >
     <CheckCircle2 className="w-3 h-3" />
     <span>Complete</span>
   </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};

