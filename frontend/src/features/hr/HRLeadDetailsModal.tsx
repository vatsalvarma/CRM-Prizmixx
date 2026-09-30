import React, { useState, useRef } from 'react';
import { updateDocumentStatus, updateLeadStatus, uploadDocument, type HRLead, type HRDocument } from './hrApi';
import { X, CheckCircle, Upload, FileText, Eye, MessageCircle } from 'lucide-react';

interface HRLeadDetailsModalProps {
  lead: HRLead;
  onClose: () => void;
  onUpdate: () => void;
}

export const HRLeadDetailsModal: React.FC<HRLeadDetailsModalProps> = ({ lead, onClose, onUpdate }) => {
  const [loadingDocId, setLoadingDocId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [activeUploadDocId, setActiveUploadDocId] = useState<number | null>(null);
  
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState(lead.phone || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAllDocsApproved = lead.documents.length > 0 && lead.documents.every(doc => doc.status === 'APPROVED');
  const isAlreadySubmitted = lead.status.endsWith('_SUBMITTED');

  const handleUpdateStatus = async (docId: number, status: string) => {
    try {
      setLoadingDocId(docId);
      await updateDocumentStatus(docId, status);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDocId(null);
    }
  };

  const triggerFileUpload = (docId: number) => {
    setActiveUploadDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadDocId) return;

    try {
      setLoadingDocId(activeUploadDocId);
      await uploadDocument(activeUploadDocId, file);
      onUpdate();
    } catch (error) {
      console.error("Failed to upload document", error);
    } finally {
      setLoadingDocId(null);
      setActiveUploadDocId(null);
    }
  };

  const handleSubmitToAdmin = async () => {
    try {
      setSubmitting(true);
      const newStatus = lead.status.endsWith('_SUBMITTED') ? lead.status : `${lead.status}_SUBMITTED`;
      await updateLeadStatus(lead.id, newStatus);
      onUpdate();
      onClose(); // Close the modal after submitting
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const API_BASE_URL = 'http://localhost:8080';

  const openWhatsAppModal = () => {
    setShowWhatsAppModal(true);
  };

  const executeShareOnWhatsApp = () => {
    if (!whatsAppNumber) {
      alert("Please enter a valid WhatsApp number.");
      return;
    }

    let messageText = `Hello ${lead.firstName}, here are your offboarding documents:\n\n`;
    
    lead.documents.forEach((doc, index) => {
      messageText += `${index + 1}. ${doc.documentName}\n`;
      if (doc.fileUrl) {
        messageText += `${API_BASE_URL}${doc.fileUrl}\n`;
      } else {
        messageText += `(Pending)\n`;
      }
      messageText += `\n`;
    });

    messageText += `Please review them carefully.`;

    const encodedMessage = encodeURIComponent(messageText);
    window.open(`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
    setShowWhatsAppModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.5)]">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{lead.firstName} {lead.lastName}</h2>
          <p className="text-gray-600 mb-8">{lead.position} {lead.departmentName && `• ${lead.departmentName}`}</p>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Documents</h3>
            <div className="space-y-4">
              {lead.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h4 
                      className={`font-medium text-gray-900 flex items-center gap-2 ${doc.fileUrl ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                      onClick={() => doc.fileUrl && setPreviewDocUrl(`${API_BASE_URL}${doc.fileUrl}`)}
                    >
                      <FileText className="w-4 h-4 text-blue-500" />
                      {doc.documentName}
                    </h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${
                      doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      doc.status === 'UPLOADED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {doc.fileUrl && (
                      <button 
                        onClick={() => setPreviewDocUrl(`${API_BASE_URL}${doc.fileUrl}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    )}
                    
                    {doc.status === 'PENDING' && (
                      <button 
                        onClick={() => triggerFileUpload(doc.id)}
                        disabled={loadingDocId === doc.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        {loadingDocId === doc.id ? 'Uploading...' : <><Upload className="w-4 h-4" /> Collect</>}
                      </button>
                    )}
                    
                    {doc.status === 'UPLOADED' && (
                      <button 
                        onClick={() => handleUpdateStatus(doc.id, 'APPROVED')}
                        disabled={loadingDocId === doc.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {lead.documents.length === 0 && (
                <p className="text-gray-500 italic">No documents required for this candidate.</p>
              )}
            </div>
          </div>
          
          {!isAlreadySubmitted && (
            <div className="mt-8 pt-6 border-t border-gray-200/50 flex justify-end gap-4">
              {lead.status.startsWith('OFFBOARDING') && (
                <button
                  onClick={openWhatsAppModal}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg bg-green-500 hover:bg-green-600 text-white shadow-green-500/20 hover:shadow-green-500/40"
                >
                  <MessageCircle className="w-5 h-5" /> Share on WhatsApp
                </button>
              )}
              <button
                onClick={handleSubmitToAdmin}
                disabled={submitting || !isAllDocsApproved}
                className={`px-6 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center ${
                  !isAllDocsApproved 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit to Admin for Final Review'}
              </button>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
        accept="image/*,application/pdf"
      />

      {/* Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setPreviewDocUrl(null)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-white/30 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.4)] flex flex-col">
            <button 
              onClick={() => setPreviewDocUrl(null)}
              className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full text-gray-800 transition-colors z-10 shadow-md backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center relative backdrop-blur-md border border-white/40 shadow-inner">
               <object data={previewDocUrl} className="w-full h-full" type="application/pdf">
                  <div className="flex items-center justify-center h-full">
                    <img src={previewDocUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" alt="Document Preview" />
                  </div>
               </object>
            </div>
          </div>
        </div>
      )}
      {/* WhatsApp Number Prompt Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowWhatsAppModal(false)} />
          <div className="relative w-full max-w-md bg-white/30 backdrop-blur-3xl border border-white/50 rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.4)] flex flex-col items-center">
            <button 
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full text-gray-800 transition-colors z-10 shadow-md backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Share Documents</h3>
            <p className="text-gray-700 text-center mb-8">Enter the WhatsApp number to share these documents with.</p>
            
            <div className="w-full flex gap-3">
              <input
                type="text"
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                placeholder="+1234567890"
                className="flex-1 px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-sm shadow-sm"
              />
              <button
                onClick={executeShareOnWhatsApp}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 whitespace-nowrap"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
