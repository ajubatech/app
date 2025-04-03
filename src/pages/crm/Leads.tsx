import React from 'react';
import { Phone, Mail, Filter, Download, Plus, MoreVertical, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Lead {
  id: string;
  name: string;
  status: 'new' | 'in_progress' | 'closed';
  priority: 'normal' | 'high' | 'low';
  date: string;
}

export default function Leads() {
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const leads: Lead[] = [
    {
      id: '1',
      name: 'Unknown',
      status: 'new',
      priority: 'normal',
      date: '3/29/2025'
    },
    {
      id: '2',
      name: 'Unknown',
      status: 'new',
      priority: 'normal',
      date: '3/29/2025'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Leads</h1>
          <p className="text-gray-600">Manage your sales leads and potential clients</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </motion.button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                ?
              </div>
              <div>
                <h3 className="font-medium">{lead.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full ${
                    lead.status === 'new'
                      ? 'bg-green-100 text-green-700'
                      : lead.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {lead.status}
                  </span>
                  <span className="text-gray-500">{lead.priority}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-gray-500">{lead.date}</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const tabs = [
  { id: 'all', name: 'All Leads' },
  { id: 'new', name: 'New' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'closed', name: 'Closed' }
];