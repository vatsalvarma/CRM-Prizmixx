import { useEffect, useState } from 'react';
import { sheetsApi } from '../api/googleSheets';
import { Plus, Search, Loader2 } from 'lucide-react';

interface Project {
  ID: string;
  Name: string;
  Client: string;
  Manager: string;
  Status: string;
  Progress: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await sheetsApi.getSheetData('Projects');
      setProjects(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject = [
      formData.get('id'),
      formData.get('name'),
      formData.get('client'),
      formData.get('manager'),
      formData.get('status'),
      formData.get('progress')
    ];

    try {
      setLoading(true);
      await sheetsApi.createRecord('Projects', newProject);
      setIsAdding(false);
      await fetchProjects();
    } catch (error) {
      alert("Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => 
    p.Name?.toLowerCase().includes(search.toLowerCase()) || 
    p.Client?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Project Management</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> New Project
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">New Project</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="id" placeholder="Project ID (e.g. PJ-100)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="name" placeholder="Project Name" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="client" placeholder="Client Name" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <input name="manager" placeholder="Project Manager" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
              <select name="status" className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]">
                <option value="Planning">Planning</option>
                <option value="Execution">Execution</option>
                <option value="Review">Review / QA</option>
                <option value="Completed">Completed</option>
              </select>
              <input name="progress" type="number" min="0" max="100" placeholder="Progress (%)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2 disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Project'}
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
          placeholder="Search projects..." 
          className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
        />
      </div>

      <div className="rounded-md border border-gray-800 bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Manager</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {loading && projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-gray-300">{p.ID}</td>
                    <td className="px-6 py-4 font-medium text-white">{p.Name}
                      <div className="text-xs text-gray-500 font-normal mt-1">{p.Client}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{p.Manager}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {p.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${p.Progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{p.Progress}%</span>
                      </div>
                    </td>
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
