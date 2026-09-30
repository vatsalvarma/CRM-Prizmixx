import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Plus, UserPlus } from 'lucide-react';
import type { Employee, CreateEmployeeResponse } from '../../api/employeesApi';
import { getAllEmployees } from '../../api/employeesApi';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { EmployeeCredentialsModal } from './EmployeeCredentialsModal';
import { EmployeeDetailsPopup } from './EmployeeDetailsPopup';
import { getHRLeads, type HRLead } from '../hr/hrApi';
import { useWebSocket } from '../../hooks/useWebSocket';

export const AdminEmployeeDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreateEmployeeResponse | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [hrLeads, setHrLeads] = useState<HRLead[]>([]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
    try {
      const leads = await getHRLeads();
      setHrLeads(leads.filter(l => l.status.endsWith('_SUBMITTED')));
    } catch (err) {
      console.error('Error fetching HR leads:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useWebSocket('/topic/employees', (msg) => {
    if (msg?.type === 'UPDATE') {
      fetchEmployees();
    }
  });

  const handleEmployeeCreated = (credentials: CreateEmployeeResponse) => {
    setIsCreateModalOpen(false);
    setCreatedCredentials(credentials);
    fetchEmployees();
  };

  const workingCount = employees.filter(e => e.employmentStatus !== 'ON_LEAVE').length;
  const onLeaveCount = employees.filter(e => e.employmentStatus === 'ON_LEAVE').length;

  return (
    <div className="p-8 min-h-full flex flex-col text-white animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light">Employee Directory</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your team and generate credentials</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-black hover:bg-gray-200 font-medium rounded-xl transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-[24px] p-6 flex items-center space-x-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Working (Active)</p>
            <p className="text-3xl font-light text-white">{workingCount}</p>
          </div>
        </div>
        <div className="glass-card rounded-[24px] p-6 flex items-center space-x-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Employees on Leave</p>
            <p className="text-3xl font-light text-white">{onLeaveCount}</p>
          </div>
        </div>
      </div>

      {/* HR Leads Pending Review */}
      {hrLeads.length > 0 && (
        <div className="glass-card rounded-[32px] flex flex-col mb-8">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Pending HR Leads for Review
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {hrLeads.map(lead => (
                <div key={lead.id} className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{lead.firstName} {lead.lastName}</h3>
                    <p className="text-xs text-blue-300 mt-1">{lead.position} {lead.departmentName && `• ${lead.departmentName}`}</p>
                    <p className="text-xs text-gray-400 mt-1">Documents ready for review</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-100 rounded-xl text-sm font-medium transition-colors border border-blue-500/30">
                    Review & Convert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="glass-card rounded-[32px] flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">All Employees</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-12 animate-pulse">Loading directory...</div>
          ) : employees.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No employees found.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {employees.map(employee => (
                <div 
                  key={employee.id} 
                  onClick={() => setSelectedEmployee(employee)}
                  className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-white/10 hover:border-white/30 transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center text-lg font-light text-white border border-white/20">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium group-hover:text-gray-300 transition-colors">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <div className="flex items-center text-xs text-gray-400 mt-1 space-x-3">
                        <span className="font-mono text-gray-300">{employee.employeeId || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{employee.departmentName || 'No Department'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                      {employee.employmentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateEmployeeModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const { createEmployee } = await import('../../api/employeesApi');
            const res = await createEmployee(data);
            handleEmployeeCreated(res);
          } catch (err) {
            console.error('Failed to create employee', err);
            alert('Failed to create employee. Make sure departments are seeded.');
          }
        }}
      />

      <EmployeeCredentialsModal
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />

      <EmployeeDetailsPopup
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEmployeeDeleted={() => {
          setSelectedEmployee(null);
          fetchEmployees();
        }}
      />
    </div>
  );
};
