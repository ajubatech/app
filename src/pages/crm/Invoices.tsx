import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Invoice } from '../../types';
import InvoiceList from '../../components/InvoiceList';
import InvoiceGenerator from '../../components/InvoiceGenerator';
import InvoiceViewer from '../../components/InvoiceViewer';
import InvoiceSettings from '../../components/InvoiceSettings';
import toast from 'react-hot-toast';

export default function Invoices() {
  const { user, userRole } = useAuthStore();
  const [activeView, setActiveView] = useState<'list' | 'create' | 'view' | 'settings'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkInvoiceSettings();
    }
  }, [user]);
  
  const checkInvoiceSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('user_id')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setHasSettings(!!data);
      
      // If first time and no settings, show settings view
      if (!data && !localStorage.getItem('invoice_settings_seen')) {
        setActiveView('settings');
        localStorage.setItem('invoice_settings_seen', 'true');
      }
      
    } catch (error) {
      console.error('Error checking invoice settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNew = () => {
    setActiveView('create');
    setSelectedInvoice(null);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveView('view');
  };
  
  const handleInvoiceCreated = (invoiceId: string) => {
    // Load the created invoice
    loadInvoice(invoiceId);
  };
  
  const loadInvoice = async (invoiceId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .single();
      
      if (error) throw error;
      
      setSelectedInvoice(data);
      setActiveView('view');
      
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Only allow lister or business users to access invoices
  if (userRole !== 'lister' && userRole !== 'business') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invoicing Not Available</h2>
          <p className="text-gray-600 mb-6">
            Invoicing features are only available for Lister and Business accounts.
          </p>
          <p className="text-gray-600">
            Upgrade your account to access invoicing features.
          </p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'list' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Invoices
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateNew}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'create' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Create New
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveView('settings')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeView === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Settings
        </motion.button>
      </div>
      
      {/* Content */}
      <div>
        {activeView === 'list' && (
          <InvoiceList 
            onViewInvoice={handleViewInvoice} 
            onCreateNew={handleCreateNew} 
          />
        )}
        
        {activeView === 'create' && (
          <InvoiceGenerator 
            onInvoiceCreated={handleInvoiceCreated}
            onCancel={() => setActiveView('list')}
          />
        )}
        
        {activeView === 'view' && selectedInvoice && (
          <InvoiceViewer 
            invoice={selectedInvoice}
            onBack={() => setActiveView('list')}
          />
        )}
        
        {activeView === 'settings' && (
          <InvoiceSettings />
        )}
      </div>
    </div>
  );
}