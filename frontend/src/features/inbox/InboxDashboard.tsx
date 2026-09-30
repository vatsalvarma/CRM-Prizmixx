import React, { useEffect, useState } from 'react';
import { getPendingApprovals } from '../../api/approvalsApi';
import type { ApprovalRequest } from '../../api/approvalsApi';
import { getAllWorks } from '../../api/workApi';
import type { Work } from '../../api/workApi';
import { CheckCircle, Clock, FileText, Calendar, FileSpreadsheet, CreditCard, Briefcase, Plus } from 'lucide-react';
import { ApprovalDetailsDrawer } from './ApprovalDetailsDrawer';
import { NewWorkModal } from '../work/NewWorkModal';
import { WorkDetailsDrawer } from '../work/WorkDetailsDrawer';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';

type InboxItem = 
  | { type: 'APPROVAL'; data: ApprovalRequest; date: Date }
  | { type: 'WORK'; data: Work; date: Date };

export const InboxDashboard = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  
  const { role, departmentName } = useAuthStore();
  const isAdmin = role === 'ADMIN' || role === 'SYSTEM_MASTER';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approvalsData, worksData] = await Promise.all([
        getPendingApprovals(1).catch(() => []), // Hardcoded for demo
        getAllWorks().catch(() => [])
      ]);
      setApprovals(approvalsData);
      setWorks(worksData);
    } catch (err) {
      console.error('Error fetching inbox data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useWebSocket('/topic/works', (newWork: Work) => {
    setWorks(prev => {
      const exists = prev.find(w => w.id === newWork.id);
      if (exists) {
        return prev.map(w => w.id === newWork.id ? newWork : w);
      }
      return [newWork, ...prev];
    });
  });

  const getEntityIcon = (type: string) => {
    switch(type) {
      case 'LEAVE_REQUEST': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'PROPOSAL': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'INVOICE': return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      case 'EXPENSE': return <CreditCard className="w-5 h-5 text-orange-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEntityLabel = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  const getWorkCardTheme = (work: Work) => {
    if (isAdmin) {
      return {
        border: 'hover:border-gray-400/50',
        iconBg: 'bg-white/5 border-white/20 text-gray-300',
        textHover: 'group-hover:text-gray-300',
        badge: 'bg-white/10 text-gray-300 border-white/20',
        action: 'text-gray-300'
      };
    }
    
    if (work.departmentName === 'Developer') {
      return {
        border: 'hover:border-[#FF0000]/50',
        iconBg: 'bg-[#FF0000]/10 border-[#FF0000]/20 text-[#FF0000]',
        textHover: 'group-hover:text-[#FF0000]',
        badge: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
        action: 'text-[#FF0000]'
      };
    }

    return {
      border: 'hover:border-[#00ffcc]/50',
      iconBg: 'bg-[#00ffcc]/10 border-[#00ffcc]/20 text-[#00ffcc]',
      textHover: 'group-hover:text-[#00ffcc]',
      badge: 'bg-[#00ffcc]/10 text-[#00ffcc] border-[#00ffcc]/20',
      action: 'text-[#00ffcc]'
    };
  };

  const pendingWorks = works.filter(w => !w.completed && (isAdmin || w.departmentName === departmentName));

  // Combine and sort by date descending
  const inboxItems: InboxItem[] = [
    ...approvals.map(a => ({ type: 'APPROVAL' as const, data: a, date: new Date(a.createdAt) })),
    ...pendingWorks.map(w => ({ type: 'WORK' as const, data: w, date: new Date(w.assignedDate) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (loading) return <div className="p-8 text-gray-400 font-light animate-pulse">Loading Inbox...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-white">Work Inbox</h1>
          <p className="text-sm text-gray-400 mt-1">Review pending requests and assigned work</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-[#171717] border border-white/5 rounded-xl px-4 py-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#FF0000]" />
            <span className="text-white font-medium">{inboxItems.length} Pending</span>
          </div>
          <button 
            onClick={() => setIsNewWorkModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-2 glass-btn-theme font-medium rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Assign Work</span>
          </button>
        </div>
      </div>

      {inboxItems.length === 0 ? (
        <div className="glass-card border-dashed rounded-[24px] p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium mb-1">You're all caught up!</h3>
          <p className="text-gray-500">No pending items at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inboxItems.map(item => {
            if (item.type === 'APPROVAL') {
              const approval = item.data as ApprovalRequest;
              return (
                <div 
                  key={`approval-${approval.id}`}
                  onClick={() => setSelectedApproval(approval)}
                  className="glass-card rounded-2xl p-5 flex items-center justify-between hover:border-[#FF0000]/50 cursor-pointer group"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      {getEntityIcon(approval.entityType)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg mb-1 group-hover:text-[#FF0000] transition-colors">
                        {getEntityLabel(approval.entityType)} Request #{approval.entityId}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          <span className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center text-[10px] font-bold text-white mr-2 border border-white/10">
                            {approval.requesterName?.charAt(0) || '?'}
                          </span>
                          {approval.requesterName}
                        </span>
                        <span>•</span>
                        <span>{item.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-lg text-xs font-medium">
                      Needs Review
                    </span>
                    <div className="text-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium">
                      Review <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              const work = item.data as Work;
              const theme = getWorkCardTheme(work);
              return (
                <div 
                  key={`work-${work.id}`}
                  onClick={() => setSelectedWork(work)}
                  className={`glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer group transition-all duration-300 ${theme.border}`}
                >
                  <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${theme.iconBg}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-white font-medium text-lg mb-1 transition-colors ${theme.textHover}`}>
                        {work.name}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          <span className="w-5 h-5 rounded-full bg-[#171717] flex items-center justify-center text-[10px] font-bold text-white mr-2 border border-white/10">
                            {work.assignedEmployeeName?.charAt(0) || '?'}
                          </span>
                          Assigned to: {work.assignedEmployeeName}
                        </span>
                        <span>•</span>
                        <span>{work.departmentName}</span>
                        <span>•</span>
                        <span>{item.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 border rounded-lg text-xs font-medium ${theme.badge}`}>
                      In Progress
                    </span>
                    <div className={`${theme.action} opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium`}>
                      View <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {selectedApproval && (
        <ApprovalDetailsDrawer
          approval={selectedApproval}
          isOpen={true}
          onClose={() => {
            setSelectedApproval(null);
            fetchData();
          }}
        />
      )}

      {selectedWork && (
        <WorkDetailsDrawer
          work={selectedWork}
          isOpen={true}
          onClose={() => {
            setSelectedWork(null);
            fetchData();
          }}
          onUpdate={fetchData}
        />
      )}

      {isNewWorkModalOpen && (
        <NewWorkModal
          onClose={() => setIsNewWorkModalOpen(false)}
          onSuccess={() => {
            setIsNewWorkModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
