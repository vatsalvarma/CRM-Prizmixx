import { useEffect, useState } from 'react';
import { sheetsApi } from '../api/googleSheets';
import { Plus, Search, Loader2 } from 'lucide-react';

interface Lead {
  ID: string;
  ClientName: string;
  Contact: string;
  Source: string;
  Status: string;
  Value: string;
  Owner: string;
}

export default function Sales() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await sheetsApi.getSheetData('Leads');
      setLeads(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newLead = [
      formData.get('id'),
      formData.get('clientName'),
      formData.get('contact'),
      formData.get('source'),
      formData.get('status'),
      formData.get('value'),
      formData.get('owner')
    ];

    try {
      setLoading(true);
      await sheetsApi.createRecord('Leads', newLead);
      setIsAdding(false);
      await fetchLeads();
    } catch (error) {
      alert("Failed to add lead. Make sure the 'Leads' sheet exists.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(lead => 
    lead.ClientName?.toLowerCase().includes(search.toLowerCase()) || 
    lead.Status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">CRM & Sales Pipeline</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">New Lead</h2>
          <form onSubmit={handleAddLead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="id" placeholder="Lead ID (e.g. LD-100)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="clientName" placeholder="Client / Company Name" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="contact" placeholder="Contact Email / Phone" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <select name="source" className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]">
                <option value="Website">Website Form</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Social Media">Social Media</option>
              </select>
              <select name="status" className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]">
                <option value="New">New</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
              <input name="value" type="number" placeholder="Deal Value ($)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="owner" placeholder="Sales Owner" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2 disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Lead'}
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
          placeholder="Search leads..." 
          className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
        />
      </div>

      <div className="rounded-md border border-gray-800 bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading leads...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No leads found. Make sure the headers in your Google Sheet match.
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{lead.ID}</td>
                    <td className="px-6 py-4 font-medium text-white">{lead.ClientName}
                      <div className="text-xs text-gray-500 font-normal mt-1">{lead.Contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                        ${lead.Status === 'Won' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          lead.Status === 'Lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          lead.Status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-gray-800 text-gray-300 border-gray-700'}`}>
                        {lead.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">${lead.Value}</td>
                    <td className="px-6 py-4 text-gray-300">{lead.Owner}</td>
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
