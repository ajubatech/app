import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Sparkles, Filter } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AIUsage() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsage: 0,
    activeUsers: 0,
    averagePerUser: 0
  });

  useEffect(() => {
    loadUsageData();
  }, [timeframe]);

  const loadUsageData = async () => {
    try {
      setLoading(true);

      // Get AI usage data
      const { data: usageData, error } = await supabase
        .from('ai_test_logs')
        .select('*')
        .gte('created_at', getDateRange(timeframe));

      if (error) throw error;

      // Calculate stats
      const totalUsage = usageData?.length || 0;
      const uniqueUsers = new Set(usageData?.map(log => log.user_id)).size;
      const avgPerUser = uniqueUsers ? totalUsage / uniqueUsers : 0;

      setStats({
        totalUsage,
        activeUsers: uniqueUsers,
        averagePerUser: Math.round(avgPerUser * 10) / 10
      });
    } catch (error) {
      console.error('Error loading AI usage data:', error);
      toast.error('Failed to load AI usage data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const date = new Date();
    switch (range) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
    }
    return date.toISOString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">AI Usage Analytics</h1>
          <p className="text-gray-600">Monitor AI feature usage across your platform</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalUsage}</h3>
          <p className="text-gray-600">Total AI Requests</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
          <p className="text-gray-600">Active Users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.averagePerUser}</h3>
          <p className="text-gray-600">Average Usage per User</p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Usage Over Time</h2>
            <p className="text-gray-600">AI feature usage trends</p>
          </div>
          <select className="px-3 py-1.5 border rounded-lg text-sm">
            <option>All Features</option>
            <option>Listing Generation</option>
            <option>Image Analysis</option>
            <option>Content Creation</option>
          </select>
        </div>
        {/* Chart will go here */}
      </div>
    </div>
  );
}