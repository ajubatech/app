import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Settings, Save, Upload, Loader2, Info, 
  Building, Phone, Mail, Globe, CreditCard, FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { InvoiceSettings as InvoiceSettingsType } from '../types';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function InvoiceSettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceSettingsType>();
  
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        reset(data);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error loading invoice settings:', error);
      toast.error('Failed to load invoice settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  });
  
  const onSubmit = async (data: InvoiceSettingsType) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload logo if changed
      let logoUrl = data.logo_url;
      if (logoFile) {
        const fileName = `${user.id}/${Date.now()}-${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invoice-logos')
          .upload(fileName, logoFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('invoice-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrlData.publicUrl;
      }
      
      // Check if settings already exist
      const { data: existingData, error: checkError } = await supabase
        .from('invoice_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingData) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('invoice_settings')
          .update({
            ...data,
            logo_url: logoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from('invoice_settings')
          .insert({
            ...data,
            user_id: user.id,
            logo_url: logoUrl,
            invoice_prefix: data.invoice_prefix || 'INV-',
            next_invoice_number: data.next_invoice_number || 1001
          });
        
        if (insertError) throw insertError;
      }
      
      toast.success('Invoice settings saved successfully');
      
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      toast.error('Failed to save invoice settings');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Invoice Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-600" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                {...register('business_name', { required: 'Business name is required' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Business Name"
              />
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                {...register('address')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Business Address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Phone Number"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('website')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="www.yourbusiness.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Number
              </label>
              <input
                type="text"
                {...register('tax_number')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tax/VAT Number"
              />
            </div>
          </div>
        </div>
        
        {/* Logo Upload */}
        <div>
          <h3 className="text-lg font-medium mb-4">Business Logo</h3>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="max-h-32 max-w-full mb-4 object-contain"
                />
                <p className="text-sm text-gray-600">
                  Click or drag to replace logo
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop your logo here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Recommended size: 300x100px, Max 5MB
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Invoice Numbering */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Invoice Numbering
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Prefix
              </label>
              <input
                type="text"
                {...register('invoice_prefix')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="INV-"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: "INV-" will generate invoice numbers like INV-1001
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Invoice Number
              </label>
              <input
                type="number"
                {...register('next_invoice_number', { 
                  valueAsNumber: true,
                  min: 1
                })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1001"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be the number of your next invoice
              </p>
            </div>
          </div>
        </div>
        
        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Payment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                {...register('bank_details.bank_name')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bank Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                {...register('bank_details.account_name')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Account Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                {...register('bank_details.account_number')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Account Number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Code / SWIFT
              </label>
              <input
                type="text"
                {...register('bank_details.branch_code')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Branch Code or SWIFT"
              />
            </div>
          </div>
        </div>
        
        {/* Terms & Notes */}
        <div>
          <h3 className="text-lg font-medium mb-4">Terms & Notes</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions
              </label>
              <textarea
                {...register('terms')}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Payment terms, refund policy, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Notes
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Thank you for your business!"
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}