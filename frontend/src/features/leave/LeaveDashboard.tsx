import React, { useEffect, useState } from 'react';
import { getMyBalances, getMyRequests, submitLeaveRequest, getAllPendingRequests, approveLeaveRequest, rejectLeaveRequest } from '../../api/leaveApi';
import type { LeaveBalance, LeaveRequest } from '../../api/leaveApi';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Check, X } from 'lucide-react';
import { GlassDatePicker } from '../../components/GlassDatePicker';
import { GlassSelect } from '../../components/GlassSelect';
import { useAuthStore } from '../../store/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';

export const LeaveDashboard = () => {
 const { role } = useAuthStore();
 const isAdmin = role === 'ADMIN' || role === 'SYSTEM_MASTER' || role === 'MANAGER';
 
 const [balances, setBalances] = useState<LeaveBalance[]>([]);
 const [requests, setRequests] = useState<LeaveRequest[]>([]);
 const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 
 // Form State
 const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [reason, setReason] = useState('');

 const fetchData = async () => {
 try {
 setLoading(true);
 const [bal, req] = await Promise.all([getMyBalances(), getMyRequests()]);
 setBalances(bal);
 setRequests(req);
 if (isAdmin) {
   const pending = await getAllPendingRequests();
   setPendingApprovals(pending);
 }
 if (bal.length > 0) setLeaveTypeId(bal[0].leaveTypeId);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, []);

 useWebSocket('/topic/leaves', () => {
   fetchData();
 });

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await submitLeaveRequest({
 leaveTypeId,
 startDate,
 endDate,
 reason
 });
 setShowForm(false);
 fetchData();
 } catch (err: any) {
 const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to submit leave request. Check dates and balances.';
 alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
 }
 };

 const handleApprove = async (id: number) => {
   try {
     await approveLeaveRequest(id);
     fetchData();
   } catch (err) {
     alert('Failed to approve request.');
   }
 };

 const handleReject = async (id: number) => {
   const reason = prompt("Enter rejection reason:");
   if (reason) {
     try {
       await rejectLeaveRequest(id, reason);
       fetchData();
     } catch (err) {
       alert('Failed to reject request.');
     }
   }
 };

 if (loading) return <div className="p-8 text-white font-light animate-pulse">Loading Leave Dashboard...</div>;

 return (
 <div className="p-8 space-y-8">
 {/* Header & Apply Button */}
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-light text-white">Leave Management</h1>
 <p className="text-sm text-gray-400 mt-1">Manage your time off</p>
 </div>
 <button 
 onClick={() => setShowForm(!showForm)}
 className="flex items-center space-x-2 px-6 py-3 glass-btn-theme font-medium rounded-xl transition-all"
 >
 <Plus className="w-5 h-5" />
 <span>Apply for Leave</span>
 </button>
 </div>

 {/* Leave Request Form */}
 {showForm && (
 <div className="glass-card !overflow-visible rounded-[24px] p-8 border border-[var(--theme-glow-strong)]">
 <h2 className="text-xl font-light text-[var(--theme-accent)] mb-6">New Leave Request</h2>
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm text-gray-400 mb-2">Leave Type</label>
 <GlassSelect 
 value={leaveTypeId}
 onChange={(val) => setLeaveTypeId(Number(val))}
 options={balances.map(b => ({ value: b.leaveTypeId, label: b.leaveTypeName }))}
 placeholder="Select a leave type"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm text-gray-400 mb-2">Start Date</label>
 <GlassDatePicker value={startDate} onChange={setStartDate} placeholder="Select start date" />
 </div>
 <div>
 <label className="block text-sm text-gray-400 mb-2">End Date</label>
 <GlassDatePicker value={endDate} onChange={setEndDate} placeholder="Select end date" />
 </div>
 </div>
 <div>
 <label className="block text-sm text-gray-400 mb-2">Reason</label>
 <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3}
 className="w-full bg-[#090909] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--theme-btn-border)]"></textarea>
 </div>
 <div className="flex justify-end space-x-4">
 <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-white/10 text-gray-400 rounded-xl hover:text-white">Cancel</button>
 <button type="submit" className="px-6 py-3 glass-btn-theme font-medium rounded-xl">Submit Request</button>
 </div>
 </form>
 </div>
 )}

 {/* Leave Balances Cards */}
 {!isAdmin && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {balances.map(b => (
 <div key={b.id} className="glass-card rounded-[24px] p-6 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-glow-weak)] blur-2xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
 <div className="flex items-center space-x-3 mb-4 relative z-10">
 <Calendar className="w-5 h-5 text-[var(--theme-accent)]" />
 <h3 className="text-gray-300 font-medium">{b.leaveTypeName}</h3>
 </div>
 <div className="text-4xl font-light text-white">{b.balance} <span className="text-lg text-gray-500">Days</span></div>
 </div>
 ))}
 </div>
 )}

 {/* Admin Approvals Queue */}
 {isAdmin && (
  <div className="glass-card rounded-[24px] border border-[var(--theme-glow-weak)]">
    <div className="p-6 border-b border-white/5">
      <h2 className="text-xl font-light text-white">Pending Team Approvals</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#090909] text-gray-400 text-sm">
            <th className="p-4 font-medium">Employee</th>
            <th className="p-4 font-medium">Type</th>
            <th className="p-4 font-medium">Duration</th>
            <th className="p-4 font-medium">Reason</th>
            <th className="p-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pendingApprovals.map(req => (
            <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-4 text-white font-medium">{req.employeeName}</td>
              <td className="p-4 text-gray-300">{req.leaveTypeName}</td>
              <td className="p-4 text-gray-400">{req.startDate} to {req.endDate}</td>
              <td className="p-4 text-gray-400 truncate max-w-xs">{req.reason}</td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <button onClick={() => handleApprove(req.id!)} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleReject(req.id!)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {pendingApprovals.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">No pending leave requests.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
 )}

 {/* History Table */}
 <div className="glass-card rounded-[24px]">
 <div className="p-6 border-b border-white/5">
 <h2 className="text-xl font-light text-white">Leave History</h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-[#090909] text-gray-400 text-sm">
 <th className="p-4 font-medium">Type</th>
 <th className="p-4 font-medium">Duration</th>
 <th className="p-4 font-medium">Reason</th>
 <th className="p-4 font-medium">Status</th>
 <th className="p-4 font-medium">Approver</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {requests.map(req => (
 <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
 <td className="p-4 text-white">{req.leaveTypeName}</td>
 <td className="p-4 text-gray-300">{req.startDate} to {req.endDate}</td>
 <td className="p-4 text-gray-400 truncate max-w-xs">{req.reason}</td>
 <td className="p-4">
 <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs border
 ${req.status === 'APPROVED' ? 'bg-green-900/20 text-green-400 border-green-500/20' : 
 req.status === 'REJECTED' ? 'bg-red-900/20 text-red-400 border-red-500/20' : 
 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20'}`}>
 {req.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
 {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
 {(req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW') && <Clock className="w-3 h-3" />}
 <span>{req.status}</span>
 </span>
 </td>
 <td className="p-4 text-gray-400">{req.approverName || '-'}</td>
 </tr>
 ))}
 {requests.length === 0 && (
 <tr>
 <td colSpan={5} className="p-8 text-center text-gray-500">No leave requests found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};


