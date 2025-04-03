import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Minus, Calendar, DollarSign, 
  Printer, Download, Send, Loader2, X, Check, 
  Info, Upload, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Invoice, InvoiceItem, Listing } from '../types';
import { format, addDays } from 'date-fns';

interface InvoiceGeneratorProps {
  listingId?: string;
  onInvoiceCreated?: (invoiceId: string) => void;
  onCancel?: () => void;
}

interface FormValues {
  recipient_email: string;
  recipient_name: string;
  recipient_address: string;
  title: string;
  description: string;
  type: 'sale' | 'rent' | 'service' | 'product';
  issue_date: string;
  due_date: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];
  tax_rate: number;
  notes: string;
  reference: string;
}

export default function InvoiceGenerator({ 
  listingId, 
  onInvoiceCreated,
  onCancel
}: InvoiceGeneratorProps) {
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      recipient_email: '',
      recipient_name: '',
      recipient_address: '',
      title: '',
      description: '',
      type: 'sale',
      issue_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
      tax_rate: 0,
      notes: '',
      reference: ''
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });
  
  const watchItems = watch('items');
  const watchTaxRate = watch('tax_rate');
  
  // Calculate subtotal and total
  const subtotal = watchItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = (subtotal * watchTaxRate) / 100;
  const total = subtotal + taxAmount;
  
  useEffect(() => {
    if (user) {
      loadInvoiceSettings();
    }
  }, [user]);
  
  useEffect(() => {
    if (listingId) {
      loadListing(listingId);
    }
  }, [listingId]);
  
  // Update amount when quantity or unit price changes
  useEffect(() => {
    watchItems.forEach((item, index) => {
      const amount = item.quantity * item.unit_price;
      if (amount !== item.amount) {
        setValue(`items.${index}.amount`, amount);
      }
    });
  }, [watchItems, setValue]);
  
  const loadInvoiceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setInvoiceSettings(data);
      }
    } catch (error) {
      console.error('Error loading invoice settings:', error);
    }
  };
  
  const loadListing = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setListing(data);
      
      // Pre-fill form with listing data
      setValue('title', `Invoice for ${data.title}`);
      setValue('description', `Payment for ${data.title}`);
      setValue('type', data.category === 'real_estate' ? 'sale' : data.category === 'services' ? 'service' : 'product');
      
      // Add listing as first item
      setValue('items', [
        {
          description: data.title,
          quantity: 1,
          unit_price: data.price,
          amount: data.price
        }
      ]);
      
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddItem = () => {
    append({ description: '', quantity: 1, unit_price: 0, amount: 0 });
  };
  
  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * data.tax_rate) / 100;
      const totalAmount = subtotal + taxAmount;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          recipient_email: data.recipient_email,
          recipient_name: data.recipient_name,
          recipient_address: data.recipient_address,
          listing_id: listingId,
          type: data.type,
          title: data.title,
          description: data.description,
          amount: subtotal,
          tax_rate: data.tax_rate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'draft',
          issue_date: new Date(data.issue_date).toISOString(),
          due_date: new Date(data.due_date).toISOString(),
          notes: data.notes,
          reference: data.reference
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      const invoiceItems = data.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);
      
      if (itemsError) throw itemsError;
      
      // Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions
        .invoke('generate-invoice-pdf', {
          body: { invoiceId: invoice.id, userId: user.id }
        });
      
      if (pdfError) {
        console.error('Error generating PDF:', pdfError);
        // Continue anyway, PDF can be generated later
      }
      
      // Get the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', invoice.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setGeneratedInvoice(completeInvoice);
      setShowPreview(true);
      
      toast.success('Invoice created successfully');
      
      if (onInvoiceCreated) {
        onInvoiceCreated(invoice.id);
      }
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendInvoice = async () => {
    if (!generatedInvoice) return;
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase.functions
        .invoke('send-invoice', {
          body: { 
            invoiceId: generatedInvoice.id, 
            userId: user?.id,
            message: 'Please find your invoice attached. Thank you for your business.'
          }
        });
      
      if (error) throw error;
      
      toast.success('Invoice sent successfully');
      
      // Close the preview
      setShowPreview(false);
      
      if (onInvoiceCreated) {
        onInvoiceCreated(generatedInvoice.id);
      }
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownloadPdf = () => {
    if (!generatedInvoice?.pdf_url) {
      toast.error('PDF not available yet');
      return;
    }
    
    // Open PDF in new tab
    window.open(generatedInvoice.pdf_url, '_blank');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (showPreview && generatedInvoice) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Invoice Preview
          </h2>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border rounded-lg p-6 mb-6">
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">{invoiceSettings?.business_name || user?.full_name || 'Your Business'}</h3>
              <p className="text-gray-600">{invoiceSettings?.address || 'Your Address'}</p>
              <p className="text-gray-600">{invoiceSettings?.email || user?.email}</p>
              <p className="text-gray-600">{invoiceSettings?.phone || 'Your Phone'}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg">INVOICE</h3>
              <p className="text-gray-600">Invoice #: {generatedInvoice.invoice_number}</p>
              <p className="text-gray-600">Issue Date: {new Date(generatedInvoice.issue_date).toLocaleDateString()}</p>
              <p className="text-gray-600">Due Date: {new Date(generatedInvoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Bill To:</h4>
            <p>{generatedInvoice.recipient_name}</p>
            <p>{generatedInvoice.recipient_email}</p>
            <p>{generatedInvoice.recipient_address}</p>
          </div>
          
          <table className="w-full mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-right">Quantity</th>
                <th className="py-2 px-4 text-right">Unit Price</th>
                <th className="py-2 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {generatedInvoice.items?.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{item.description}</td>
                  <td className="py-2 px-4 text-right">{item.quantity}</td>
                  <td className="py-2 px-4 text-right">${item.unit_price.toFixed(2)}</td>
                  <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>${generatedInvoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Tax ({generatedInvoice.tax_rate}%):</span>
                <span>${generatedInvoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total:</span>
                <span>${generatedInvoice.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {generatedInvoice.notes && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Notes:</h4>
              <p className="text-gray-600">{generatedInvoice.notes}</p>
            </div>
          )}
          
          {invoiceSettings?.terms && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Terms and Conditions:</h4>
              <p className="text-gray-600">{invoiceSettings.terms}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendInvoice}
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Invoice
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPdf}
            className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPreview(false)}
            className="px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Create New Invoice
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Recipient Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Recipient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                {...register('recipient_email', { required: 'Email is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="client@example.com"
              />
              {errors.recipient_email && (
                <p className="mt-1 text-sm text-red-600">{errors.recipient_email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                {...register('recipient_name')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Client Name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <textarea
                {...register('recipient_address')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Client Address"
              />
            </div>
          </div>
        </div>
        
        {/* Invoice Details */}
        <div>
          <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Property Sale Invoice"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="service">Service</option>
                <option value="product">Product</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                {...register('issue_date', { required: 'Issue date is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.issue_date && (
                <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                {...register('due_date', { required: 'Due date is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.due_date && (
                <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Invoice description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                {...register('reference')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Order #12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                {...register('tax_rate', { min: 0, max: 100 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Invoice Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-right">Quantity</th>
                  <th className="py-2 px-4 text-right">Unit Price</th>
                  <th className="py-2 px-4 text-right">Amount</th>
                  <th className="py-2 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        {...register(`items.${index}.description` as const, { required: true })}
                        className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity` as const, { 
                          required: true,
                          min: 1,
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                        min="1"
                        step="1"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        {...register(`items.${index}.unit_price` as const, { 
                          required: true,
                          min: 0,
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        {...register(`items.${index}.amount` as const, { 
                          required: true,
                          min: 0,
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-1 border rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="0.00"
                        readOnly
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={fields.length <= 1}
                        className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Tax ({watchTaxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes or payment instructions..."
          />
        </div>
        
        {/* Invoice Settings Notice */}
        {!invoiceSettings && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <Info className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Invoice Settings Not Configured</p>
              <p className="text-sm">
                You haven't set up your invoice settings yet. Your personal information will be used instead.
                <Link to="/settings" className="ml-1 text-blue-600 hover:underline">
                  Configure Settings
                </Link>
              </p>
            </div>
          </div>
        )}
        
        {/* Submit Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Create Invoice
              </>
            )}
          </motion.button>
          
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}