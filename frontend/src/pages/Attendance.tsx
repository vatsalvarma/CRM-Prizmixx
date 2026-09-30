import { useEffect, useState } from 'react';
import { sheetsApi } from '../api/googleSheets';
import { Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface AttendanceRecord {
  Date: string;
  EmployeeID: string;
  Name: string;
  CheckInTime: string;
  CheckOutTime: string;
  Location: string;
  Status: string;
}

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [locationStr, setLocationStr] = useState<string>('Detecting location...');

  // Mock employee context for now
  const currentUser = { id: 'EMP001', name: 'John Doe' };

  useEffect(() => {
    fetchRecords();
    
    // Get GPS
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStr(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setLocationStr('Location unavailable');
        }
      );
    }
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await sheetsApi.getSheetData('Attendance');
      setRecords(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async (type: 'IN' | 'OUT') => {
    try {
      setActionLoading(true);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const dateString = now.toLocaleDateString();

      // Simple implementation: for "OUT", ideally we would update an existing row.
      // But since our simple Apps Script API only appends rows currently, we will just log a new row for now
      // A more complex backend would handle updating the Checkout time of the day's record.
      
      const payload = [
        dateString,
        currentUser.id,
        currentUser.name,
        type === 'IN' ? timeString : '', // Check In
        type === 'OUT' ? timeString : '', // Check Out
        locationStr,
        type === 'IN' ? 'Present' : 'Completed' // Status
      ];

      await sheetsApi.createRecord('Attendance', payload);
      await fetchRecords();
      alert(`Successfully checked ${type.toLowerCase()}`);
    } catch (error) {
      alert(`Failed to check ${type.toLowerCase()}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>

      {/* Action Card */}
      <div className="p-6 bg-[var(--surface)] border border-gray-800 rounded-lg max-w-2xl">
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {locationStr}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handleCheckInOut('IN')}
            disabled={actionLoading || locationStr === 'Detecting location...'}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-500 hover:bg-green-600 text-white h-12 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Check In'}
          </button>
          <button 
            onClick={() => handleCheckInOut('OUT')}
            disabled={actionLoading || locationStr === 'Detecting location...'}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-800 hover:bg-gray-700 text-white h-12 border border-gray-700 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Check Out'}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-gray-800 bg-[var(--surface)] overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">Recent Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No attendance logs found. Make sure headers match Google Sheet.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{record.Date}</td>
                    <td className="px-6 py-4 font-medium text-white">{record.Name}</td>
                    <td className="px-6 py-4 text-green-400">{record.CheckInTime || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{record.CheckOutTime || '-'}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{record.Location}</td>
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
