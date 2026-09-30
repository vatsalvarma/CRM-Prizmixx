import React, { useEffect, useState } from 'react';
import { getInvoicePayments, addPayment } from '../../api/financeApi';
import type { Invoice, Payment } from '../../api/financeApi';
import { X, DollarSign, Calendar, CreditCard } from 'lucide-react';

interface Props {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailsDrawer = ({ invoice, isOpen, onClose }: Props) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPayments();
    }
  }, [isOpen, invoice.id]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getInvoicePayments(invoice.id);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    try {
      await addPayment(invoice.id, {
        amount: parseFloat(amount),
        paymentMethod,
        referenceNumber: reference,
        paymentDate: new Date().toISOString().split('T')[0]
      });
      setAmount('');
      setReference('');
      fetchPayments();
      // Need to notify parent to refresh invoice list
    } catch (err) {
      console.error('Error adding payment:', err);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = invoice.totalAmount - totalPaid;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-[500px] glass-card z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-xl font-medium text-white">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-gray-400">{invoice.clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Summary */}
          <div className="glass-card rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-medium text-white">₹{invoice.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Balance Due</p>
                <p className={`text-2xl font-medium ${balanceDue <= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  ₹{Math.max(0, balanceDue).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 flex items-center mb-1"><Calendar className="w-4 h-4 mr-1"/> Issue Date</span>
                <span className="text-gray-300">{new Date(invoice.issueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500 flex items-center mb-1"><Calendar className="w-4 h-4 mr-1"/> Due Date</span>
                <span className="text-gray-300">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Record Payment Form */}
          {balanceDue > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-lg font-medium text-white mb-4 relative z-10">Record Payment</h3>
              <form onSubmit={handleAddPayment} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number"
                      step="0.01"
                      max={balanceDue}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#090909] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#090909] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Reference</label>
                    <input 
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. TXN-123"
                      className="w-full bg-[#090909] border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-white/5 hover:bg-white hover:text-black text-white rounded-xl transition-colors font-medium border border-white/10 hover:border-transparent mt-2"
                >
                  Save Payment
                </button>
              </form>
            </div>
          )}

          {/* Payment History */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Payment History</h3>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-gray-500 text-sm py-4 text-center border border-white/5 border-dashed rounded-xl">No payments recorded.</div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        ₹{p.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {p.paymentMethod.replace('_', ' ')} • {new Date(p.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold rounded">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
