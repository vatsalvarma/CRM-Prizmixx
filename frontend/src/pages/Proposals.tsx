import { useEffect, useState } from 'react';
import { sheetsApi } from '../api/googleSheets';
import { Plus, Search, Loader2 } from 'lucide-react';

interface Proposal {
  ID: string;
  ClientName: string;
  ProjectName: string;
  Amount: string;
  Status: string;
  DateSent: string;
}

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await sheetsApi.getSheetData('Proposals');
      setProposals(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProposal = [
      formData.get('id'),
      formData.get('clientName'),
      formData.get('projectName'),
      formData.get('amount'),
      formData.get('status'),
      new Date().toLocaleDateString()
    ];

    try {
      setLoading(true);
      await sheetsApi.createRecord('Proposals', newProposal);
      setIsAdding(false);
      await fetchProposals();
    } catch (error) {
      alert("Failed to add proposal.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = proposals.filter(p => 
    p.ClientName?.toLowerCase().includes(search.toLowerCase()) || 
    p.ProjectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Proposals & Quotations</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Proposal
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">New Proposal</h2>
          <form onSubmit={handleAddProposal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="id" placeholder="Proposal ID (e.g. PR-001)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="clientName" placeholder="Client Name" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="projectName" placeholder="Project Description" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="amount" type="number" placeholder="Total Amount ($)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <select name="status" className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]">
                <option value="Draft">Draft</option>
                <option value="Sent">Sent (Pending Approval)</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2 disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-gray-800 rounded-md w-full max-w-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search proposals..." 
          className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
        />
      </div>

      <div className="rounded-md border border-gray-800 bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Client / Project</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Sent</th>
              </tr>
            </thead>
            <tbody>
              {loading && proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No proposals found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-gray-300">{p.ID}</td>
                    <td className="px-6 py-4 font-medium text-white">{p.ClientName}
                      <div className="text-xs text-gray-500 font-normal mt-1">{p.ProjectName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">${p.Amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border
                        ${p.Status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          p.Status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                        {p.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{p.DateSent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
