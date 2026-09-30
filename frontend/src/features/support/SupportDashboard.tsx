import React, { useEffect, useState } from 'react';
import { getTickets, updateTicketStatus } from '../../api/supportApi';
import type { SupportTicket } from '../../api/supportApi';
import { Plus, User, Clock, AlertCircle } from 'lucide-react';
import { TicketDetailsDrawer } from './TicketDetailsDrawer';
import { NewTicketModal } from './NewTicketModal';
import { useWebSocket } from '../../hooks/useWebSocket';

const STATUS_COLUMNS = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'RESOLVED', 'CLOSED'];

export const SupportDashboard = () => {
 const [tickets, setTickets] = useState<SupportTicket[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
 const [isNewModalOpen, setIsNewModalOpen] = useState(false);

 const fetchTickets = async (silent = false) => {
 try {
 if (!silent) setLoading(true);
 const data = await getTickets();
 setTickets(data);
 } catch (err) {
 console.error('Error fetching tickets:', err);
 } finally {
 if (!silent) setLoading(false);
 }
 };

 useEffect(() => {
 fetchTickets();
 }, []);

 useWebSocket('/topic/tickets', (newTicket: SupportTicket) => {
   fetchTickets(true);
   setSelectedTicket(current => (current?.id === newTicket.id ? newTicket : current));
 });

 const handleStatusChange = async (ticketId: number, newStatus: string) => {
 try {
 await updateTicketStatus(ticketId, newStatus);
 fetchTickets();
 } catch (err) {
 alert('Failed to update status');
 }
 };

 const getPriorityStyle = (priority: string) => {
 switch(priority) {
 case 'URGENT': return 'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.2)]';
 case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
 case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
 case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
 default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
 }
 };

 return (
 <div className="p-8 h-full flex flex-col overflow-hidden animate-in fade-in duration-300">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-light text-white">Support Helpdesk</h2>
 <p className="text-sm text-gray-400 mt-1">Manage client issues, inquiries, and SLAs</p>
 </div>
 <button 
 onClick={() => setIsNewModalOpen(true)}
 className="flex items-center space-x-2 px-6 py-3 glass-btn-theme font-medium rounded-xl transition-all"
 >
 <Plus className="w-5 h-5" />
 <span>New Ticket</span>
 </button>
 </div>

 {/* Kanban Board */}
 <div className="flex space-x-6 overflow-x-auto overflow-y-hidden flex-1 pb-4 custom-scrollbar min-h-0">
 {STATUS_COLUMNS.map(status => (
 <div key={status} className="flex flex-col w-[320px] shrink-0">
 <div className="flex justify-between items-center mb-4 px-2">
 <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{status.replace(/_/g, ' ')}</h3>
 <span className="bg-[#171717] text-[#FF0000] text-xs px-2 py-1 rounded-full border border-white/5 shadow-inner">
 {tickets.filter(t => t.status === status).length}
 </span>
 </div>
 
 <div className="flex-1 glass-card rounded-[24px] p-4 space-y-4 overflow-y-auto custom-scrollbar min-h-0 relative">
 {loading && <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-10 text-gray-500">Loading...</div>}
 {tickets.filter(t => t.status === status).map(ticket => (
 <div 
 key={ticket.id} 
 onClick={() => setSelectedTicket(ticket)}
 className="glass-card p-5 rounded-2xl hover:border-[#FF0000]/50 cursor-pointer group flex flex-col"
 >
 {ticket.priority === 'URGENT' && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-2xl"></div>}
 
 <div className="flex justify-between items-start mb-3 relative z-10">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityStyle(ticket.priority)}`}>
 {ticket.priority}
 </span>
 <select 
 value={ticket.status}
 onChange={(e) => {
 e.stopPropagation();
 handleStatusChange(ticket.id, e.target.value);
 }}
 onClick={(e) => e.stopPropagation()}
 className="bg-[#090909] text-xs text-gray-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
 >
 {STATUS_COLUMNS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
 </select>
 </div>
 
 <h4 className="text-white font-medium mb-1 relative z-10 group-hover:text-[#FF0000] transition-colors">{ticket.subject}</h4>
 <p className="text-xs text-[#FF0000]/80 mb-4 relative z-10">{ticket.clientName}</p>
 
 <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
 <div className="flex items-center text-xs text-gray-500">
 <User className="w-3 h-3 mr-1" />
 <span className="truncate max-w-[100px]">{ticket.assigneeName || 'Unassigned'}</span>
 </div>
 {ticket.slaDueTime && (
 <div className={`flex items-center text-[10px] px-2 py-1 rounded border ${new Date(ticket.slaDueTime) < new Date() && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? 'bg-red-900/30 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
 <Clock className="w-3 h-3 mr-1" />
 <span>SLA: {new Date(ticket.slaDueTime).toLocaleDateString()}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {selectedTicket && (
 <TicketDetailsDrawer 
 ticket={selectedTicket} 
 isOpen={true} 
 onClose={() => {
 setSelectedTicket(null);
 fetchTickets();
 }} 
 />
 )}

 {isNewModalOpen && (
 <NewTicketModal 
 onClose={() => setIsNewModalOpen(false)}
 onSuccess={() => {
 setIsNewModalOpen(false);
 fetchTickets();
 }}
 />
 )}
 </div>
 );
};

