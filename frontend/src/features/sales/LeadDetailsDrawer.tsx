import React, { useEffect, useState } from 'react';
import type { Lead, LeadActivity } from '../../api/salesApi';
import { getLeadActivities, addLeadActivity } from '../../api/salesApi';
import { X, Phone, Mail, Users, FileText, Send } from 'lucide-react';

interface Props {
  lead: Lead;
  onClose: () => void;
  onUpdate: () => void;
}

export const LeadDetailsDrawer = ({ lead, onClose, onUpdate }: Props) => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('NOTE');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getLeadActivities(lead.id);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [lead.id]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      await addLeadActivity(lead.id, {
        activityType,
        description: newNote
      });
      setNewNote('');
      fetchActivities();
    } catch (err) {
      alert('Failed to add activity');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-4 h-4 text-green-400" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'MEETING': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[500px] glass-card z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-xl font-medium text-white">{lead.clientCompany}</h2>
            <p className="text-sm text-gray-400">{lead.contactName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Lead Info */}
          <div className="glass-card rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm text-gray-300">{lead.email || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="text-sm text-gray-300">{lead.phone || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Project Name</div>
                <div className="text-sm text-gray-300">{lead.projectName || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Required Service</div>
                <div className="text-sm text-gray-300">{lead.requiredService || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{lead.description || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Owner</div>
                <div className="text-sm text-gray-300">{lead.ownerName ? `${lead.ownerName} (${lead.ownerDepartment || 'N/A'})` : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/20">
                  {lead.status}
                </span>
              </div>
              {lead.referenceLinks && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Reference Links</div>
                  <a href={lead.referenceLinks} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline break-all">{lead.referenceLinks}</a>
                </div>
              )}
              {lead.documentUrl && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Document / PDF</div>
                  <a href={lead.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline break-all">{lead.documentUrl}</a>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-light text-white mb-6 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-white" />
              <span>Activity Log</span>
            </h3>

            {loading ? (
              <div className="text-sm text-gray-500 text-center animate-pulse">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8 border border-white/5 border-dashed rounded-xl">No activities recorded yet.</div>
            ) : (
              <div className="space-y-6">
                {activities.map((act) => (
                  <div key={act.id} className="flex space-x-4">
                    <div className="mt-1 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
                      {getActivityIcon(act.activityType)}
                    </div>
                    <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-300">{act.employeeName}</span>
                        <span className="text-xs text-gray-500">{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Activity Form */}
          <div className="glass-card rounded-2xl p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <form onSubmit={handleAddActivity} className="relative z-10">
              <div className="flex space-x-2 mb-4">
                {['NOTE', 'CALL', 'EMAIL', 'MEETING'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivityType(type as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activityType === type ? 'glass-btn-theme' : 'bg-[#090909] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log a new activity..."
                  className="w-full bg-[#090909] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 pr-12 resize-none h-24 transition-colors"
                ></textarea>
                <button 
                  type="submit"
                  disabled={!newNote.trim()}
                  className="absolute bottom-3 right-3 p-2 glass-btn-theme rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
