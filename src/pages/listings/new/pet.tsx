import React from 'react';
import { motion } from 'framer-motion';
import PetListingForm from '../../../components/forms/PetListingForm';
import VisionAIUpload from '../../../components/VisionAIUpload';

export default function NewPetListing() {
  const handleAIAnalysis = (result: any) => {
    // Handle AI analysis result
    console.log('AI Analysis:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-8">
            {/* Vision AI Upload */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Start with AI</h2>
              <p className="text-gray-600 mb-6">
                Upload a photo of your pet and let AI help you create the listing
              </p>
              <VisionAIUpload onAnalysis={handleAIAnalysis} />
            </div>

            {/* Manual Form */}
            <PetListingForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}