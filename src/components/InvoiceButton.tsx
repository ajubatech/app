import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import InvoiceGenerator from './InvoiceGenerator';

interface InvoiceButtonProps {
  listingId?: string;
  className?: string;
  buttonText?: string;
}

export default function InvoiceButton({ 
  listingId, 
  className = '', 
  buttonText = 'Create Invoice'
}: InvoiceButtonProps) {
  const { user, userRole } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Only show for lister or business users
  if (userRole !== 'lister' && userRole !== 'business') {
    return null;
  }
  
  const handleClick = () => {
    setShowModal(true);
  };
  
  const handleInvoiceCreated = (invoiceId: string) => {
    // Close modal after a delay
    setTimeout(() => {
      setShowModal(false);
    }, 2000);
  };
  
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FileText className="w-5 h-5" />
        )}
        {buttonText}
      </motion.button>
      
      {/* Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InvoiceGenerator 
              listingId={listingId}
              onInvoiceCreated={handleInvoiceCreated}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}