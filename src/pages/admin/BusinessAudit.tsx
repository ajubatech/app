import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, CheckCircle, Flag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function BusinessAudit() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          business_audits (
            id,
            status,
            notes,
            flags,
            audit_date
          )
        `)
        .eq('role', 'business')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const createAudit = async (businessId: string, status: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('business_audits')
        .insert({
          business_id: businessId,
          status,
          notes
        });

      if (error) throw error;
      toast.success('Audit created successfully');
      loadBusinesses();
    } catch (error) {
      console.error('Error creating audit:', error);
      toast.error('Failed to create audit');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Business Audit</h1>
          <p className="text-gray-600">Review and manage business accounts</p>
        </div>
      </div>

      {/* Business List */}
      <div className="space-y-6">
        {businesses.map((business) => (
          <div key={business.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{business.full_name}</h3>
                  <p className="text-sm text-gray-600">{business.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {business.business_audits?.[0]?.status === 'approved' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </span>
                ) : business.business_audits?.[0]?.status === 'flagged' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                    <Flag className="w-4 h-4" />
                    Flagged
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    Pending Review
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Audit</p>
                  <p className="font-medium">
                    {business.business_audits?.[0]?.audit_date
                      ? new Date(business.business_audits[0].audit_date).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium capitalize">{business.status || 'active'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => createAudit(business.id, 'approved', 'Business verified')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => createAudit(business.id, 'flagged', 'Requires review')}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Flag
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}