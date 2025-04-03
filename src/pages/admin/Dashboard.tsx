import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Users, Sparkles, DollarSign, 
  ArrowUp, ArrowDown, Calendar, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    aiUsage: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Get active listings
      const { count: listingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      // Get AI usage
      const { data: aiData } = await supabase
        .from('ai_test_logs')
        .select('*')
        .eq('status', 'success')
        .gte('created_at', getDateRange(timeframe));

      // Get revenue data
      const { data: revenueData } = await supabase
        .from('pro_plus_subscriptions')
        .select('*')
        .eq('active', true);

      setStats({
        totalUsers: userCount || 0,
        activeListings: listingCount || 0,
        aiUsage: aiData?.length || 0,
        revenue: calculateRevenue(revenueData)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const calculateRevenue = (subscriptions: any[]) => {
    return subscriptions?.reduce((total, sub) => {
      // Simple calculation - in reality would be more complex
      return total + 49; // $49 per subscription
    }, 0) || 0;
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'AI Usage',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgb(147, 51, 234)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600">Monitor your marketplace metrics</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              12%
            </span>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
          <p className="text-gray-600">Total Users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              8%
            </span>
          </div>
          <h3 className="text-2xl font-bold">{stats.activeListings}</h3>
          <p className="text-gray-600">Active Listings</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-red-600 text-sm">
              <ArrowDown className="w-4 h-4" />
              3%
            </span>
          </div>
          <h3 className="text-2xl font-bold">{stats.aiUsage}</h3>
          <p className="text-gray-600">AI Usage</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <ArrowUp className="w-4 h-4" />
              15%
            </span>
          </div>
          <h3 className="text-2xl font-bold">${stats.revenue}</h3>
          <p className="text-gray-600">Revenue</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Usage Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">AI Usage</h2>
              <p className="text-gray-600">AI feature usage over time</p>
            </div>
            <select className="px-3 py-1.5 border rounded-lg text-sm">
              <option>All Features</option>
              <option>Listing Generation</option>
              <option>Image Analysis</option>
              <option>Content Creation</option>
            </select>
          </div>
          <Line data={chartData} options={chartOptions} height="100" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <activity.icon className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const recentActivity = [
  {
    icon: Users,
    title: 'New business user registered',
    time: '2 minutes ago'
  },
  {
    icon: Sparkles,
    title: 'AI generated 15 listings',
    time: '15 minutes ago'
  },
  {
    icon: Calendar,
    title: 'Weekly analytics report generated',
    time: '1 hour ago'
  },
  {
    icon: DollarSign,
    title: 'New Pro+ subscription',
    time: '2 hours ago'
  }
];