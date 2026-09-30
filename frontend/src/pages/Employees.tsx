import { useEffect, useState } from 'react';
import { sheetsApi } from '../api/googleSheets';
import { Plus, Search, Loader2 } from 'lucide-react';

interface Employee {
  ID: string;
  Name: string;
  Department: string;
  Role: string;
  Status: string;
  Email: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await sheetsApi.getSheetData('Employees');
      setEmployees(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newEmployee = [
      formData.get('id'),
      formData.get('name'),
      formData.get('department'),
      formData.get('role'),
      formData.get('status'),
      formData.get('email')
    ];

    try {
      setLoading(true);
      await sheetsApi.createRecord('Employees', newEmployee);
      setIsAdding(false);
      await fetchEmployees(); // Refresh data
    } catch (error: any) {
      alert(error.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp => 
    emp.Name?.toLowerCase().includes(search.toLowerCase()) || 
    emp.Department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Employees</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="id" placeholder="Employee ID (e.g. EMP001)" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--accent)]" />
              <input name="name" placeholder="Full Name" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--accent)]" />
              <input name="department" placeholder="Department" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--accent)]" />
              <input name="role" placeholder="Role" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--accent)]" />
              <input name="email" type="email" placeholder="Email Address" required className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--accent)]" />
              <select name="status" className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]">
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Offboarding">Offboarding</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-blue-600 h-10 px-4 py-2 disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Employee'}
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
          placeholder="Search employees..." 
          className="bg-transparent border-none focus:outline-none text-sm text-white w-full"
        />
      </div>

      <div className="rounded-md border border-gray-800 bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Employee Name</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading employees...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No employees found. Make sure the headers in your Google Sheet match the expected format.
                  </td>
                </tr>
              ) : (
                filtered.map((emp, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{emp.ID}</td>
                    <td className="px-6 py-4 font-medium text-white">{emp.Name}
                      <div className="text-xs text-gray-500 font-normal mt-1">{emp.Email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{emp.Department}</td>
                    <td className="px-6 py-4 text-gray-300">{emp.Role}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${emp.Status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                          emp.Status === 'On Leave' ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-gray-500/10 text-gray-400'}`}>
                        {emp.Status}
                      </span>
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
