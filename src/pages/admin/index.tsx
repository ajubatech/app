import React from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { 
  LayoutDashboard, Sparkles, DollarSign, 
  Users, MessageSquare, Settings 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AdminDashboard from './Dashboard';
import AIUsage from './AIUsage';
import PricingControl from './PricingControl';
import BusinessAudit from './BusinessAudit';
import MarketingTools from './MarketingTools';
import AdminSettings from './Settings';

export default function AdminPortal() {
  const { user } = useAuthStore();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/ai-usage" element={<AIUsage />} />
            <Route path="/pricing" element={<PricingControl />} />
            <Route path="/business-audit" element={<BusinessAudit />} />
            <Route path="/marketing" element={<MarketingTools />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar() {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <h1 className="text-xl font-bold mb-8">Admin Portal</h1>
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <SidebarLink key={item.path} {...item} />
        ))}
      </nav>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, path }: typeof sidebarItems[0]) {
  return (
    <Link
      to={path}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50"
    >
      <Icon className="w-5 h-5 text-gray-500" />
      <span>{label}</span>
    </Link>
  );
}

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/admin'
  },
  {
    icon: Sparkles,
    label: 'AI Usage',
    path: '/admin/ai-usage'
  },
  {
    icon: DollarSign,
    label: 'Pricing',
    path: '/admin/pricing'
  },
  {
    icon: Users,
    label: 'Business Audit',
    path: '/admin/business-audit'
  },
  {
    icon: MessageSquare,
    label: 'Marketing',
    path: '/admin/marketing'
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/admin/settings'
  }
];