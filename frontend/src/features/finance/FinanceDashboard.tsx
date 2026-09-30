import React, { useEffect, useState } from 'react';
import { getInvoices } from '../../api/financeApi';
import type { Invoice } from '../../api/financeApi';
import { Plus, MoreVertical, DollarSign, FileText, Download, IndianRupee } from 'lucide-react';
import { InvoiceDetailsDrawer } from './InvoiceDetailsDrawer';
import { NewInvoiceModal } from './NewInvoiceModal';

export const FinanceDashboard = () => {
 const [invoices, setInvoices] = useState<Invoice[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
 const [isNewModalOpen, setIsNewModalOpen] = useState(false);

 const fetchInvoices = async () => {
 try {
 setLoading(true);
 const data = await getInvoices();
 setInvoices(data);
 } catch (err) {
 console.error('Error fetching invoices:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchInvoices();
 }, []);

 const totalReceivables = invoices.reduce((sum, inv) => {
 if (inv.status !== 'CANCELLED' && inv.status !== 'PAID') {
 return sum + inv.totalAmount;
 }
 return sum;
 }, 0);

 const totalCollected = invoices.reduce((sum, inv) => {
 if (inv.status === 'PAID') {
 return sum + inv.totalAmount;
 }
 return sum; // Should technically sum up partial payments, but simplifying for MVP
 }, 0);

 const getStatusStyle = (status: string) => {
 switch(status) {
 case 'PAID': return 'bg-green-900/30 text-green-400 border-green-500/20';
 case 'PARTIALLY_PAID': return 'bg-blue-900/30 text-blue-400 border-blue-500/20';
 case 'OVERDUE': return 'bg-red-900/30 text-red-400 border-red-500/20';
 case 'DRAFT': return 'bg-gray-800 text-gray-400 border-gray-600';
 default: return 'bg-orange-900/30 text-orange-400 border-orange-500/20';
 }
 };

 return (
 <div className="h-full p-6 lg:p-8 animate-in fade-in duration-300">
 <div className="h-full w-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden flex flex-col">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Finance & Invoices</h2>
 <p className="text-sm text-gray-700 mt-1">Manage billing, track payments, and generate invoices</p>
 </div>
 <button 
 onClick={() => setIsNewModalOpen(true)}
 className="flex items-center space-x-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-700 text-white border border-blue-500/50 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
 >
 <Plus className="w-5 h-5" />
 <span>Generate Invoice</span>
 </button>
 </div>

 {/* Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-[24px] p-6 group">
 <div className="flex items-center space-x-4 relative z-10">
 <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
 <IndianRupee className="w-6 h-6 text-orange-600" />
 </div>
 <div>
 <p className="text-sm text-gray-700 font-medium">Total Receivables</p>
 <h3 className="text-2xl font-bold text-gray-900">₹{totalReceivables.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
 </div>
 </div>
 </div>

 <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-[24px] p-6 group">
 <div className="flex items-center space-x-4 relative z-10">
 <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
 <IndianRupee className="w-6 h-6 text-green-600" />
 </div>
 <div>
 <p className="text-sm text-gray-700 font-medium">Total Collected</p>
 <h3 className="text-2xl font-bold text-gray-900">₹{totalCollected.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
 </div>
 </div>
 </div>
 
 <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-sm rounded-[24px] p-6 group">
 <div className="flex items-center space-x-4 relative z-10">
 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
 <FileText className="w-6 h-6 text-blue-600" />
 </div>
 <div>
 <p className="text-sm text-gray-700 font-medium">Total Invoices</p>
 <h3 className="text-2xl font-bold text-gray-900">{invoices.length}</h3>
 </div>
 </div>
 </div>
 </div>

 {/* Invoices List */}
 <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[24px] flex-1 flex flex-col shadow-lg overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
 <div className="p-6 border-b border-white/60 flex justify-between items-center z-10 relative bg-white/20">
 <h3 className="text-xl font-bold text-gray-900">Recent Invoices</h3>
 </div>
 
 <div className="flex-1 overflow-auto z-10">
 {loading ? (
 <div className="p-8 text-center text-gray-500 animate-pulse">Loading invoices...</div>
 ) : invoices.length === 0 ? (
 <div className="p-12 text-center text-gray-500 border-2 border-dashed border-white/5 mx-6 my-6 rounded-xl">
 No invoices generated yet.
 </div>
 ) : (
 <table className="w-full text-left border-collapse relative z-10">
 <thead>
 <tr className="border-b border-white/60 text-gray-700 font-bold text-sm bg-white/10">
 <th className="py-4 px-6">Invoice #</th>
 <th className="py-4 px-6">Client</th>
 <th className="py-4 px-6">Issue Date</th>
 <th className="py-4 px-6">Due Date</th>
 <th className="py-4 px-6">Amount</th>
 <th className="py-4 px-6">Status</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {invoices.map((inv) => (
 <tr 
 key={inv.id} 
 onClick={() => setSelectedInvoice(inv)}
 className="border-b border-white/60 hover:bg-white/50 transition-colors cursor-pointer group"
 >
 <td className="py-4 px-6 font-bold text-gray-900 transition-colors">
 {inv.invoiceNumber}
 </td>
 <td className="py-4 px-6">
 <div className="text-gray-900 font-medium">{inv.clientName}</div>
 {inv.projectName && <div className="text-xs text-gray-700">{inv.projectName}</div>}
 </td>
 <td className="py-4 px-6 text-gray-700 font-medium">
 {new Date(inv.issueDate).toLocaleDateString()}
 </td>
 <td className="py-4 px-6 text-gray-700 font-medium">
 {new Date(inv.dueDate).toLocaleDateString()}
 </td>
 <td className="py-4 px-6 font-bold text-gray-900">
 ₹{inv.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
 </td>
 <td className="py-4 px-6">
 <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wider ${getStatusStyle(inv.status)}`}>
 {inv.status.replace('_', ' ')}
 </span>
 </td>
 <td className="py-4 px-6 text-right">
 <button className="text-gray-400 hover:text-white transition-colors p-2" onClick={(e) => e.stopPropagation()}>
 <MoreVertical className="w-5 h-5" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {selectedInvoice && (
 <InvoiceDetailsDrawer 
 invoice={selectedInvoice} 
 isOpen={true} 
 onClose={() => {
 setSelectedInvoice(null);
 fetchInvoices();
 }} 
 />
 )}

 {isNewModalOpen && (
 <NewInvoiceModal 
 onClose={() => setIsNewModalOpen(false)}
 onSuccess={() => {
 setIsNewModalOpen(false);
 fetchInvoices();
 }}
 />
 )}
 </div>
 </div>
 );
};

