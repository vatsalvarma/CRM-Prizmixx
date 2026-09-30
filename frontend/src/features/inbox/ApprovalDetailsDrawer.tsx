import React, { useState } from 'react';
import { submitApprovalDecision } from '../../api/approvalsApi';
import type { ApprovalRequest } from '../../api/approvalsApi';
import { X, Check, XCircle, FileText, Calendar, Loader } from 'lucide-react';

interface Props {
 approval: ApprovalRequest;
 isOpen: boolean;
 onClose: () => void;
}

export const ApprovalDetailsDrawer = ({ approval, isOpen, onClose }: Props) => {
 const [responseNote, setResponseNote] = useState('');
 const [loading, setLoading] = useState(false);

 const handleDecision = async (status: 'APPROVED' | 'REJECTED') => {
 try {
 setLoading(true);
 await submitApprovalDecision(approval.id, status, responseNote);
 onClose();
 } catch (err) {
 console.error('Failed to submit decision:', err);
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <>
 <div 
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
 onClick={onClose}
 />
 
 <div className="fixed inset-y-0 right-0 w-[500px] glass-card z-50 flex flex-col animate-in slide-in-from-right duration-300">
 <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
 <div>
 <h2 className="text-xl font-medium text-white mb-1">Review Request</h2>
 <p className="text-sm text-[#FF0000]">{approval.entityType.replace(/_/g, ' ')} #{approval.entityId}</p>
 </div>
 <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
 {/* Summary Card */}
 <div className="glass-card rounded-xl p-5">
 <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Request Details</h3>
 
 <div className="space-y-4">
 <div>
 <label className="text-xs text-gray-500">Requester</label>
 <div className="text-sm text-white mt-1 font-medium">{approval.requesterName}</div>
 </div>
 
 <div>
 <label className="text-xs text-gray-500">Submitted On</label>
 <div className="text-sm text-white mt-1">{new Date(approval.createdAt).toLocaleString()}</div>
 </div>

 {approval.requestNote && (
 <div>
 <label className="text-xs text-gray-500">Request Note</label>
 <div className="text-sm text-gray-300 mt-1 bg-[#090909] p-3 rounded-lg border border-white/5">
 {approval.requestNote}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Decision Form */}
 <div className="space-y-3">
 <label className="text-sm font-medium text-gray-400">Add a Response Note (Optional)</label>
 <textarea
 value={responseNote}
 onChange={(e) => setResponseNote(e.target.value)}
 placeholder="E.g. Approved, great work! or Please revise the amounts..."
 className="w-full bg-[#090909] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#FF0000] transition-colors resize-none h-32"
 />
 </div>
 </div>

 <div className="p-6 border-t border-white/10 bg-black/20 flex space-x-3">
 <button 
 onClick={() => handleDecision('REJECTED')}
 disabled={loading}
 className="flex-1 py-3 bg-transparent border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
 >
 {loading ? <Loader className="w-5 h-5 animate-spin" /> : (
 <>
 <XCircle className="w-5 h-5" />
 <span>Reject</span>
 </>
 )}
 </button>
 
 <button 
 onClick={() => handleDecision('APPROVED')}
 disabled={loading}
 className="flex-1 py-3 glass-btn-theme rounded-xl transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
 >
 {loading ? <Loader className="w-5 h-5 animate-spin" /> : (
 <>
 <Check className="w-5 h-5" />
 <span>Approve</span>
 </>
 )}
 </button>
 </div>
 </div>
 </>
 );
};


