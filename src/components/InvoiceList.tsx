import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Send, Eye, Filter, Search, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
  CheckCircle, Clock, XCircle, Calendar, ArrowUpDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Invoice } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface InvoiceListProps {
  onViewInvoice?: (invoice: Invoice) => void;
  onCreateNew?: () => void;
}

export default function InvoiceList({ onViewInvoice, onCreateNew }: InvoiceListProps) {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<{
    status?: string;
    type?: string;
    search?: string;
    dateRange?: 'all' | 'last30' | 'last90' | 'thisYear';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({
    status: 'all',
    type: 'all',
    search: '',
    dateRange: 'all',
    sortBy: 'issue_date',
    sortOrder: 'desc'
  });
  
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user, currentPage, filter]);
  
  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filter.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      
      if (filter.type && filter.type !== 'all') {
        query = query.eq('type', filter.type);
      }
      
      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,recipient_email.ilike.%${filter.search}%,invoice_number.ilike.%${filter.search}%`);
      }
      
      // Date range filter
      if (filter.dateRange && filter.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filter.dateRange) {
          case 'last30':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
          case 'last90':
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
          case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate) {
          query = query.gte('issue_date', startDate.toISOString());
        }
      }
      
      // Apply sorting
      if (filter.sortBy) {
        query = query.order(filter.sortBy, { ascending: filter.sortOrder === 'asc' });
      }
      
      // Apply pagination
      query = query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setInvoices(data || []);
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
      
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      if (!invoice.pdf_url) {
        // Generate PDF if not already generated
        const { data, error } = await supabase.functions
          .invoke('generate-invoice-pdf', {
            body: { invoiceId: invoice.id, userId: user?.id }
          });
        
        if (error) throw error;
        
        if (data.pdfUrl) {
          // Open PDF in new tab
          window.open(data.pdfUrl, '_blank');
        } else {
          throw new Error('Failed to generate PDF');
        }
      } else {
        // Open existing PDF
        window.open(invoice.pdf_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };
  
  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase.functions
        .invoke('send-invoice', {
          body: { 
            invoiceId: invoice.id, 
            userId: user?.id,
            message: 'Please find your invoice attached. Thank you for your business.'
          }
        });
      
      if (error) throw error;
      
      toast.success('Invoice sent successfully');
      loadInvoices(); // Refresh the list
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'paid':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };
  
  const handleSort = (field: string) => {
    setFilter(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Invoices
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={filter.search || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search invoices..."
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
          
          {/* Status Filter */}
          <select
            value={filter.status || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {/* Type Filter */}
          <select
            value={filter.type || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="service">Service</option>
            <option value="product">Product</option>
          </select>
          
          {/* Date Range Filter */}
          <select
            value={filter.dateRange || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
          
          {/* Create New Button */}
          {onCreateNew && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Create New
            </motion.button>
          )}
        </div>
      </div>
      
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
          <p className="text-gray-600 mb-6">
            {filter.search || filter.status !== 'all' || filter.type !== 'all' || filter.dateRange !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'You haven\'t created any invoices yet.'}
          </p>
          {onCreateNew && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateNew}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Create Your First Invoice
            </motion.button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <button 
                      onClick={() => handleSort('invoice_number')}
                      className="flex items-center gap-1 font-medium text-gray-700"
                    >
                      Invoice #
                      {filter.sortBy === 'invoice_number' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button 
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 font-medium text-gray-700"
                    >
                      Title
                      {filter.sortBy === 'title' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">Recipient</th>
                  <th className="py-3 px-4 text-left">
                    <button 
                      onClick={() => handleSort('issue_date')}
                      className="flex items-center gap-1 font-medium text-gray-700"
                    >
                      Issue Date
                      {filter.sortBy === 'issue_date' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button 
                      onClick={() => handleSort('due_date')}
                      className="flex items-center gap-1 font-medium text-gray-700"
                    >
                      Due Date
                      {filter.sortBy === 'due_date' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleSort('total_amount')}
                      className="flex items-center gap-1 font-medium text-gray-700 ml-auto"
                    >
                      Amount
                      {filter.sortBy === 'total_amount' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{invoice.invoice_number}</td>
                    <td className="py-3 px-4">{invoice.title}</td>
                    <td className="py-3 px-4">{invoice.recipient_email}</td>
                    <td className="py-3 px-4">{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</td>
                    <td className="py-3 px-4">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</td>
                    <td className="py-3 px-4 text-right">${invoice.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(invoice.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onViewInvoice && onViewInvoice(invoice)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Invoice"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(invoice)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <button
                            onClick={() => handleSendInvoice(invoice)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Send Invoice"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, (currentPage - 1) * itemsPerPage + invoices.length)} of {totalPages * itemsPerPage} invoices
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}