import React, { useState, useEffect } from 'react';
import { createTicket } from '../../api/supportApi';
import { getClients } from '../../api/salesApi';
import type { Client } from '../../api/salesApi';
import { X, Loader } from 'lucide-react';

interface Props {
 onClose: () => void;
 onSuccess: () => void;
}

export const NewTicketModal = ({ onClose, onSuccess }: Props) => {
 const [clients, setClients] = useState<Client[]>([]);
 const [clientId, setClientId] = useState('');
 const [subject, setSubject] = useState('');
 const [description, setDescription] = useState('');
 const [priority, setPriority] = useState('MEDIUM');
 
 const [loading, setLoading] = useState(false);
 const [initialLoading, setInitialLoading] = useState(true);

 useEffect(() => {
 const fetchClients = async () => {
 try {
 const data = await getClients();
 setClients(data);
 } catch (err) {
 console.error(err);
 } finally {
 setInitialLoading(false);
 }
 };
 fetchClients();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!clientId || !subject || !description) return;

 try {
 setLoading(true);
 await createTicket({
 clientId: parseInt(clientId),
 subject,
 description,
 priority
 });
 onSuccess();
 } catch (err) {
 console.error('Failed to create ticket', err);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-[#121212] border border-white/10 rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#171717]">
 <h2 className="text-xl font-medium text-white">Create Support Ticket</h2>
 <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
 <X className="w-5 h-5" />
 </button>
 </div>

 {initialLoading ? (
 <div className="p-12 flex justify-center"><Loader className="w-8 h-8 text-[#FF0000] animate-spin" /></div>
 ) : (
 <form onSubmit={handleSubmit} className="p-6 space-y-5">
 <div>
 <label className="block text-sm text-gray-400 mb-1.5">Client *</label>
 <select 
 value={clientId}
 onChange={(e) => setClientId(e.target.value)}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF0000] transition-colors"
 required
 >
 <option value="">Select a client...</option>
 {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1.5">Subject *</label>
 <input 
 type="text"
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 placeholder="Brief summary of the issue"
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF0000] transition-colors"
 required
 />
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
 <select 
 value={priority}
 onChange={(e) => setPriority(e.target.value)}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF0000] transition-colors"
 >
 <option value="LOW">Low</option>
 <option value="MEDIUM">Medium</option>
 <option value="HIGH">High</option>
 <option value="URGENT">Urgent (Immediate SLA)</option>
 </select>
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
 <textarea 
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Provide detailed information about the issue, steps to reproduce, or any relevant context..."
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF0000] transition-colors h-32 resize-none"
 required
 />
 </div>

 <div className="pt-4 flex space-x-3">
 <button 
 type="button"
 onClick={onClose}
 className="flex-1 py-3 bg-transparent text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors font-medium"
 >
 Cancel
 </button>
 <button 
 type="submit"
 disabled={loading || !clientId || !subject || !description}
 className="flex-1 py-3 glass-btn-theme rounded-xl transition-all font-medium disabled:opacity-50 disabled:hover:shadow-none flex justify-center items-center"
 >
 {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Create Ticket'}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};

