import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('category');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, value: any) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ value })
        .eq('id', id);

      if (error) throw error;
      toast.success('Setting updated');
      loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Settings</h1>
          <p className="text-gray-600">Configure system-wide settings</p>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settings.reduce((groups: any, setting) => {
          if (!groups[setting.category]) {
            groups[setting.category] = [];
          }
          groups[setting.category].push(setting);
          return groups;
        }, {}).map((group: any, category: string) => (
          <div key={category} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold capitalize">
                {category.replace(/_/g, ' ')}
              </h2>
            </div>

            <div className="space-y-4">
              {group.map((setting: any) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </label>
                  {typeof setting.value === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.value}
                        onChange={(e) => updateSetting(setting.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  ) : typeof setting.value === 'number' ? (
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.id, parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : typeof setting.value === 'object' ? (
                    <textarea
                      value={JSON.stringify(setting.value, null, 2)}
                      onChange={(e) => {
                        try {
                          const value = JSON.parse(e.target.value);
                          updateSetting(setting.id, value);
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.id, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}