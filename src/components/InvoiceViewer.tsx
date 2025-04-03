import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Send, Printer, 
  Loader2, X, Check, Clock, AlertCircle, 
  XCircle, ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Invoice } from '../types';
import toast from 'react-hot-toast';

interface InvoiceViewerProps {
  invoice: Invoice;
  onBack?: () => void;
}

export default function InvoiceViewer({ invoice, onBack }: InvoiceViewerProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice);
  
  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      
      if (!currentInvoice.pdf_url) {
        // Generate PDF if not already generated
        const { data, error } = await supabase.functions
          .invoke('generate-invoice-pdf', {
            body: { invoiceId: currentInvoice.id, userId: user?.id }
          });
        
        if (error) throw error;
        
        if (data.pdfUrl) {
          setCurrentInvoice(prev => ({ ...prev, pdf_url: data.pdfUrl }));
          // Open PDF in new tab
          window.open(data.pdfUrl, '_blank');
        } else {
          throw new Error('Failed to generate PDF');
        }
      } else {
        // Open existing PDF
        window.open(currentInvoice.pdf_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendInvoice = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions
        .invoke('send-invoice', {
          body: { 
            invoiceId: currentInvoice.id, 
            userId: user?.id,
            message: 'Please find your invoice attached. Thank you for your business.'
          }
        });
      
      if (error) throw error;
      
      // Update status if it was a draft
      if (currentInvoice.status === 'draft') {
        const { data: updatedInvoice, error: updateError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', currentInvoice.id)
          .single();
        
        if (updateError) throw updateError;
        
        setCurrentInvoice(updatedInvoice);
      }
      
      toast.success('Invoice sent successfully');
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleUpdateStatus = async (status: 'paid' | 'cancelled') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', currentInvoice.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentInvoice(data);
      toast.success(`Invoice marked as ${status}`);
      
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'paid':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Check className="w-4 h-4" />
            Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {status}
          </span>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Invoice #{currentInvoice.invoice_number}
          </h2>
          {getStatusBadge(currentInvoice.status)}
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPdf}
            disabled={isLoading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Download</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Print</span>
          </motion.button>
          
          {currentInvoice.status !== 'paid' && currentInvoice.status !== 'cancelled' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendInvoice}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Status Actions */}
      {currentInvoice.status === 'pending' && (
        <div className="flex gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateStatus('paid')}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            Mark as Paid
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateStatus('cancelled')}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Cancel Invoice
          </motion.button>
        </div>
      )}
      
      {/* Invoice Content */}
      <div className="border rounded-lg p-6" id="invoice-print-area">
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold mb-1">INVOICE</h3>
            <p className="text-gray-600">#{currentInvoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Issue Date: {new Date(currentInvoice.issue_date).toLocaleDateString()}</p>
            <p className="text-gray-600">Due Date: {new Date(currentInvoice.due_date).toLocaleDateString()}</p>
            <p className={`font-medium mt-2 ${
              currentInvoice.status === 'paid' ? 'text-green-600' : 
              currentInvoice.status === 'overdue' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              Status: {currentInvoice.status.charAt(0).toUpperCase() + currentInvoice.status.slice(1)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">From:</h4>
            <p className="font-medium">{user?.full_name}</p>
            <p>{user?.email}</p>
            {/* Add more business details here */}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">To:</h4>
            <p className="font-medium">{currentInvoice.recipient_name}</p>
            <p>{currentInvoice.recipient_email}</p>
            <p className="whitespace-pre-line">{currentInvoice.recipient_address}</p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="font-semibold mb-4">{currentInvoice.title}</h3>
          {currentInvoice.description && (
            <p className="text-gray-600 mb-4">{currentInvoice.description}</p>
          )}
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left border-b">Description</th>
                <th className="py-2 px-4 text-right border-b">Quantity</th>
                <th className="py-2 px-4 text-right border-b">Unit Price</th>
                <th className="py-2 px-4 text-right border-b">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoice.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">${item.unit_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>${currentInvoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax ({currentInvoice.tax_rate || 0}%):</span>
              <span>${(currentInvoice.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-lg">
              <span>Total:</span>
              <span>${currentInvoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {currentInvoice.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Notes:</h4>
            <p className="text-gray-600">{currentInvoice.notes}</p>
          </div>
        )}
        
        {currentInvoice.reference && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Reference: {currentInvoice.reference}</p>
          </div>
        )}
      </div>
    </div>
  );
}