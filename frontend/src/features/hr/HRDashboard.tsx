import React, { useState, useEffect } from 'react';
import { getHRLeads, createHRLead, type HRLead } from './hrApi';
import { HRLeadDetailsModal } from './HRLeadDetailsModal';
import { CreateOffboardingModal } from './CreateOffboardingModal';
import { CreateOnboardingModal } from './CreateOnboardingModal';

export const HRDashboard = () => {
  const [leads, setLeads] = useState<HRLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<HRLead | null>(null);
  const [activeTab, setActiveTab] = useState<'ONBOARDING' | 'OFFBOARDING'>('ONBOARDING');
  const [isOffboardingModalOpen, setIsOffboardingModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  const fetchLeads = () => {
    getHRLeads().then(setLeads).catch(console.error);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="h-full p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="h-full w-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">HR Operations</h1>
            <p className="text-sm text-gray-700 mt-1">Manage Onboarding & Offboarding workflows</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-white/30 backdrop-blur-md rounded-xl p-1 border border-white/40">
              <button 
                onClick={() => setActiveTab('ONBOARDING')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ONBOARDING' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Onboarding
              </button>
              <button 
                onClick={() => setActiveTab('OFFBOARDING')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'OFFBOARDING' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Offboarding
              </button>
            </div>
            {activeTab === 'OFFBOARDING' ? (
              <button 
                onClick={() => setIsOffboardingModalOpen(true)}
                className="px-6 py-2 bg-red-600/90 hover:bg-red-700 text-white border border-red-500/50 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
              >
                + Initiate Offboarding
              </button>
            ) : (
              <button 
                onClick={() => setIsOnboardingModalOpen(true)}
                className="px-6 py-2 bg-blue-600/90 hover:bg-blue-700 text-white border border-blue-500/50 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
              >
                + New Onboarding Lead
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
          {leads.filter(l => l.status.startsWith(activeTab)).map(lead => (
            <div 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)}
              className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-6 hover:bg-white/50 transition-colors cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h3>
                  <p className="text-sm text-gray-700">{lead.position}</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-900 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-gray-700 font-medium mb-1">Email: {lead.email}</p>
              {lead.departmentName && <p className="text-xs text-gray-700 font-medium">Dept: {lead.departmentName}</p>}
            </div>
          ))}
          
          
          {leads.filter(l => l.status.startsWith(activeTab)).length === 0 && (
            <div className="col-span-full py-12 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.05),inset_0_0_15px_rgba(255,255,255,0.3)]">
              <p className="text-gray-800 font-medium text-lg">No {activeTab.toLowerCase()} tasks in progress.</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedLead && (
        <HRLeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={() => {
            fetchLeads();
            setSelectedLead(null);
          }}
        />
      )}

      {isOffboardingModalOpen && (
        <CreateOffboardingModal 
          onClose={() => setIsOffboardingModalOpen(false)}
          onSuccess={() => {
            fetchLeads();
            setIsOffboardingModalOpen(false);
          }}
        />
      )}

      {isOnboardingModalOpen && (
        <CreateOnboardingModal 
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={() => {
            fetchLeads();
            setIsOnboardingModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
