import React, { useEffect, useState } from 'react';
import type { Client } from '../../api/salesApi';
import { getClients } from '../../api/salesApi';
import { Building2, Phone, Mail, Globe, Star } from 'lucide-react';

export const ClientDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <div className="p-8 text-gray-400 font-light animate-pulse">Loading Clients...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-white">Active Clients</h1>
          <p className="text-sm text-gray-400 mt-1">Converted leads and ongoing business relationships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-white/5 border-dashed rounded-[24px]">
            <p className="text-gray-500 font-light">No active clients yet. Convert a lead in the Sales Pipeline!</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="glass-card rounded-[24px] group hover:border-[#FF0000]/50">
              {/* Card Header */}
              <div className="p-6 border-b border-white/5 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20 shrink-0">
                  <Building2 className="w-6 h-6 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1 group-hover:text-[#FF0000] transition-colors">{client.companyName}</h3>
                  <p className="text-sm text-gray-400">{client.industry}</p>
                </div>
              </div>

              {/* Contacts */}
              <div className="p-6 space-y-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Contacts</h4>
                {client.contacts.length === 0 ? (
                  <p className="text-sm text-gray-600">No contacts listed.</p>
                ) : (
                  client.contacts.map(contact => (
                    <div key={contact.id} className="glass-card p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-300">{contact.firstName} {contact.lastName}</span>
                          {contact.isPrimary && <Star className="w-3 h-3 text-[#FF0000]" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="w-3 h-3 mr-2" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="w-3 h-3 mr-2" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {client.website && (
                <div className="p-4 bg-black/20 border-t border-white/10 flex items-center text-xs text-gray-500">
                  <Globe className="w-3 h-3 mr-2 text-[#FF0000]" />
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">
                    {client.website}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
