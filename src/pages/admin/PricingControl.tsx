import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function PricingControl() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingRules();
  }, []);

  const loadPricingRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('category');

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
      toast.error('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Pricing rule updated');
      loadPricingRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pricing Control</h1>
          <p className="text-gray-600">Manage pricing rules and subscription plans</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Add Rule
        </button>
      </div>

      {/* Pricing Rules */}
      <div className="space-y-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{rule.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{rule.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
                <button 
                  onClick={() => updateRule(rule.id, { active: !rule.active })}
                  className={`px-4 py-2 rounded-lg ${
                    rule.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {rule.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {Object.entries(rule.rules).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newRules = { ...rule.rules, [key]: parseFloat(e.target.value) };
                        updateRule(rule.id, { rules: newRules });
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}