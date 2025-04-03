import React from 'react';
import { motion } from 'framer-motion';
import ServiceListingForm from '../../../components/forms/ServiceListingForm';
import AIAssistant from '../../../components/AIAssistant';

export default function NewServiceListing() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ServiceListingForm />
        </motion.div>
      </div>
    </div>
  );
}