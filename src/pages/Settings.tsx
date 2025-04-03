import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Lock, Key, Globe, Moon, Calendar,
  Smartphone, CreditCard, Building2, Users, Webhook,
  MessageSquare, Search
} from 'lucide-react';
import BillingSection from '../components/BillingSection';

type Tab = 'general' | 'notifications' | 'security' | 'billing' | 'integrations';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">General Settings</h2>
              <p className="text-gray-600">Manage your basic account preferences</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>English</option>
                    <option>Māori</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Pacific/Auckland (GMT+12)</option>
                    <option>Pacific/Chatham (GMT+12:45)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>NZD ($)</option>
                    <option>USD ($)</option>
                    <option>AUD ($)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-600">Toggle between light and dark themes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="text-gray-600">Choose how you want to be notified</p>

              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center gap-3">
                      {notification.icon}
                      <div>
                        <p className="font-medium">{notification.name}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Push</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
              <p className="text-gray-600">Manage your security preferences</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-md font-medium mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Add an extra layer of security to your account</p>
                      <p className="text-sm text-gray-500">
                        We'll ask for a code in addition to your password when you log in
                      </p>
                    </div>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-md font-medium mb-4">Active Sessions</h3>
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {session.icon}
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-gray-600">{session.location}</p>
                          </div>
                        </div>
                        <button className="text-sm text-red-600 hover:underline">
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <BillingSection />
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">API & Integrations</h2>
              <p className="text-gray-600">Manage your API keys and connected services</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-4">API Keys</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Production API Key</p>
                        <p className="text-sm text-gray-600">Last used 2 days ago</p>
                      </div>
                      <button className="px-4 py-2 border rounded-lg hover:bg-white">
                        View Key
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Test API Key</p>
                        <p className="text-sm text-gray-600">Last used 5 days ago</p>
                      </div>
                      <button className="px-4 py-2 border rounded-lg hover:bg-white">
                        View Key
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-md font-medium mb-4">Connected Services</h3>
                  <div className="space-y-4">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-gray-600">{integration.status}</p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg ${
                          integration.connected
                            ? 'border hover:bg-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'billing' && (
            <div className="mt-8 pt-6 border-t">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Save Changes
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'general', name: 'General' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'security', name: 'Privacy & Security' },
  { id: 'billing', name: 'Billing & Payments' },
  { id: 'integrations', name: 'API & Integrations' },
];

const notifications = [
  {
    id: 'messages',
    name: 'Messages',
    description: 'When someone sends you a message',
    icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'listings',
    name: 'Listing Activity',
    description: 'When someone interacts with your listings',
    icon: <Building2 className="w-5 h-5 text-green-600" />,
  },
  {
    id: 'account',
    name: 'Account Activity',
    description: 'Important updates about your account',
    icon: <User className="w-5 h-5 text-purple-600" />,
  },
];

const sessions = [
  {
    id: 1,
    device: 'Chrome on MacBook Pro',
    location: 'Auckland, New Zealand',
    icon: <Globe className="w-5 h-5 text-gray-600" />,
  },
  {
    id: 2,
    device: 'Safari on iPhone 12',
    location: 'Wellington, New Zealand',
    icon: <Smartphone className="w-5 h-5 text-gray-600" />,
  },
];

const integrations = [
  {
    id: 'payment',
    name: 'Payment Gateway',
    status: 'Connected since Jan 2024',
    connected: true,
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'crm',
    name: 'CRM System',
    status: 'Not connected',
    connected: false,
    icon: <Users className="w-5 h-5 text-gray-600" />,
  },
  {
    id: 'webhook',
    name: 'Webhook Endpoints',
    status: 'Connected since Mar 2024',
    connected: true,
    icon: <Webhook className="w-5 h-5 text-green-600" />,
  },
];