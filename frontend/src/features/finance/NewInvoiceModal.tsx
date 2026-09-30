import React, { useState, useEffect } from 'react';
import { createInvoice } from '../../api/financeApi';
import { getClients } from '../../api/salesApi';
import { getProjects } from '../../api/projectsApi';
import type { Client } from '../../api/salesApi';
import type { Project } from '../../api/projectsApi';
import { X, Loader } from 'lucide-react';

interface Props {
 onClose: () => void;
 onSuccess: () => void;
}

export const NewInvoiceModal = ({ onClose, onSuccess }: Props) => {
 const [clients, setClients] = useState<Client[]>([]);
 const [projects, setProjects] = useState<Project[]>([]);
 
 const [clientId, setClientId] = useState('');
 const [projectId, setProjectId] = useState('');
 const [amount, setAmount] = useState('');
 const [dueDate, setDueDate] = useState('');
 
 const [loading, setLoading] = useState(false);
 const [initialLoading, setInitialLoading] = useState(true);

 useEffect(() => {
 const fetchData = async () => {
 try {
 const [clientsData, projectsData] = await Promise.all([
 getClients(),
 getProjects()
 ]);
 setClients(clientsData);
 setProjects(projectsData);
 } catch (err) {
 console.error('Error fetching data:', err);
 } finally {
 setInitialLoading(false);
 }
 };
 fetchData();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!clientId || !amount || !dueDate) return;

 try {
 setLoading(true);
 const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
 
 await createInvoice({
 clientId: parseInt(clientId),
 projectId: projectId ? parseInt(projectId) : undefined,
 invoiceNumber,
 issueDate: new Date().toISOString().split('T')[0],
 dueDate,
 subtotal: parseFloat(amount),
 totalAmount: parseFloat(amount)
 });
 onSuccess();
 } catch (err) {
 console.error('Failed to create invoice', err);
 } finally {
 setLoading(false);
 }
 };

 const filteredProjects = projects.filter(p => p.clientId === parseInt(clientId));

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="glass-card w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-[24px]">
 <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
 <h2 className="text-xl font-medium text-white">Generate Invoice</h2>
 <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
 <X className="w-5 h-5" />
 </button>
 </div>

 {initialLoading ? (
 <div className="p-8 flex justify-center"><Loader className="w-6 h-6 text-white animate-spin" /></div>
 ) : (
 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className="block text-sm text-gray-400 mb-1">Client *</label>
 <select 
 value={clientId}
 onChange={(e) => {
 setClientId(e.target.value);
 setProjectId('');
 }}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/50 transition-colors"
 required
 >
 <option value="">Select a client...</option>
 {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1">Project (Optional)</label>
 <select 
 value={projectId}
 onChange={(e) => setProjectId(e.target.value)}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
 disabled={!clientId}
 >
 <option value="">No specific project...</option>
 {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1">Total Amount *</label>
 <input 
 type="number"
 step="0.01"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/50 transition-colors"
 placeholder="0.00"
 required
 />
 </div>

 <div>
 <label className="block text-sm text-gray-400 mb-1">Due Date *</label>
 <input 
 type="date"
 value={dueDate}
 onChange={(e) => setDueDate(e.target.value)}
 className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/50 transition-colors"
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
 disabled={loading || !clientId || !amount || !dueDate}
 className="flex-1 py-3 glass-btn-theme rounded-xl transition-all font-medium disabled:opacity-50 disabled:hover:shadow-none flex justify-center items-center"
 >
 {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Generate Invoice'}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};

