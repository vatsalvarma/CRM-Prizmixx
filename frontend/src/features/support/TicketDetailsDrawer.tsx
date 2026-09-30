import React, { useEffect, useState } from 'react';
import { getTicketComments, addTicketComment } from '../../api/supportApi';
import type { SupportTicket, TicketComment } from '../../api/supportApi';
import { X, Send, Lock, Globe, Clock, User, AlertCircle } from 'lucide-react';

interface Props {
  ticket: SupportTicket;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailsDrawer = ({ ticket, isOpen, onClose }: Props) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, ticket.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getTicketComments(ticket.id);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addTicketComment(ticket.id, {
        comment: newComment,
        isInternal
      });
      setNewComment('');
      setIsInternal(false);
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[550px] glass-card z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                ticket.priority === 'URGENT' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                ticket.priority === 'HIGH' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
                ticket.priority === 'MEDIUM' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                'text-green-400 bg-green-400/10 border-green-400/20'
              }`}>
                {ticket.priority}
              </span>
              <span className="text-gray-500 text-xs font-medium">#{ticket.id}</span>
            </div>
            <h2 className="text-xl font-medium text-white mb-1 leading-tight">{ticket.subject}</h2>
            <p className="text-sm text-gray-400">{ticket.clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Details Section */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 flex items-center mb-1"><User className="w-4 h-4 mr-1"/> Assignee</span>
                <span className="text-gray-300">{ticket.assigneeName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><Clock className="w-4 h-4 mr-1"/> SLA Due</span>
                <span className={ticket.slaDueTime && new Date(ticket.slaDueTime) < new Date() && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? 'text-red-400 font-medium' : 'text-gray-300'}>
                  {ticket.slaDueTime ? new Date(ticket.slaDueTime).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Thread */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Activity Thread</h3>
            {loading ? (
              <div className="text-center text-gray-500 text-sm animate-pulse">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-8 border border-white/5 rounded-xl border-dashed">No comments yet.</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className={`p-4 rounded-2xl border backdrop-blur-md ${c.isInternal ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">{c.userName}</span>
                      {c.isInternal ? (
                        <span className="flex items-center text-[10px] text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                          <Lock className="w-3 h-3 mr-1" /> Internal
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                          <Globe className="w-3 h-3 mr-1" /> Public
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="glass-card rounded-2xl p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <form onSubmit={handleAddComment} className="flex flex-col space-y-3 relative z-10">
              <div className="relative">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a reply..."
                  className="w-full bg-[#090909] border border-white/10 rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-white/50 transition-colors resize-none h-[100px]"
                  required
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-3 bottom-3 p-2 glass-btn-theme rounded-lg transition-all disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 px-1">
                <input 
                  type="checkbox" 
                  id="internal" 
                  checked={isInternal} 
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 text-[#FF0000] focus:ring-[#FF0000] bg-gray-900 cursor-pointer"
                />
                <label htmlFor="internal" className="text-sm text-gray-400 cursor-pointer flex items-center">
                  <Lock className="w-3 h-3 mr-1" /> Make this an internal note (hidden from client)
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
