import React, { useEffect, useState } from 'react';
import { getLeads, updateLeadStatus } from '../../api/salesApi';
import type { Lead } from '../../api/salesApi';
import { Plus, MoreVertical } from 'lucide-react';
import { LeadDetailsDrawer } from './LeadDetailsDrawer';
import { NewLeadModal } from './NewLeadModal';
import { useWebSocket } from '../../hooks/useWebSocket';

const STATUS_COLUMNS = ['NEW', 'QUALIFIED', 'PROPOSAL_SENT', 'LOST', 'CONVERTED'];

 export const LeadDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeads = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useWebSocket('/topic/leads', (newLead: Lead) => {
    // Silently refetch all leads to guarantee 100% synchronization
    fetchLeads(true);
    
    // If the updated lead is currently selected, update the drawer
    setSelectedLead(current => (current?.id === newLead.id ? newLead : current));
  });

 const handleStatusChange = async (leadId: number, newStatus: string) => {
 try {
 await updateLeadStatus(leadId, newStatus);
 fetchLeads();
 } catch (err) {
 alert('Failed to update lead status');
 }
 };

 return (
 <div className="h-full p-6 lg:p-8 animate-in fade-in duration-300">
 <div className="h-full w-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Pipeline</h2>
 <p className="text-sm text-gray-700 mt-1">Manage leads and conversions</p>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center space-x-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-700 text-white border border-blue-500/50 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
 <Plus className="w-5 h-5" />
 <span>New Lead</span>
 </button>
 </div>

 {loading ? (
 <div className="text-gray-400 font-light animate-pulse">Loading pipeline...</div>
 ) : (
 <div className="flex space-x-6 overflow-x-auto flex-1 pb-4 custom-scrollbar min-h-0">
 {STATUS_COLUMNS.map(status => (
 <div key={status} className="flex flex-col w-80 shrink-0">
 <div className="flex justify-between items-center mb-4 px-2">
 <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{status.replace('_', ' ')}</h3>
 <span className="bg-white/40 text-gray-900 text-xs px-2 py-1 rounded-full border border-white/60 font-semibold">
 {leads.filter(l => l.status === status).length}
 </span>
 </div>
 
 <div className="flex-1 rounded-[24px] p-4 space-y-4 overflow-y-auto custom-scrollbar min-h-0">
 {leads.filter(l => l.status === status).map(lead => (
 <div 
 key={lead.id} 
 className="bg-white/40 backdrop-blur-md border border-white/60 p-5 rounded-2xl cursor-pointer hover:bg-white/50 transition-colors shadow-lg hover:shadow-xl group"
 onClick={() => setSelectedLead(lead)}
 >
 <div className="flex justify-between items-start mb-2">
 <h4 className="text-gray-900 font-bold truncate pr-2">{lead.clientCompany}</h4>
 <button className="text-gray-700 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
 <MoreVertical className="w-4 h-4" />
 </button>
 </div>
 <p className="text-xs text-gray-700 font-medium mb-4">{lead.contactName}</p>
 
 <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
 <div className="text-xs text-gray-700 font-medium">
 {new Date(lead.createdAt).toLocaleDateString()}
 </div>
 
 {/* Simple status mover for demo purposes - in a real app this would be drag & drop */}
 <select 
 value={lead.status}
 onChange={(e) => {
 e.stopPropagation();
 handleStatusChange(lead.id, e.target.value);
 }}
 className="bg-white text-xs text-gray-900 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
 >
 {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
 </select>
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 {selectedLead && (
 <LeadDetailsDrawer 
 lead={selectedLead} 
 onClose={() => setSelectedLead(null)} 
 onUpdate={fetchLeads} 
 />
 )}
 
 {isModalOpen && (
 <NewLeadModal 
 onClose={() => setIsModalOpen(false)} 
 onSuccess={() => fetchLeads()} 
 />
 )}
 </div>
 </div>
 );
};

