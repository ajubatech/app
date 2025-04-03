import React, { useState } from 'react';
import { Home, Package, Wrench, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import RealEstateForm from '../components/forms/RealEstateForm';
import ProductForm from '../components/forms/ProductForm';
import ServiceForm from '../components/forms/ServiceForm';
import AutomotiveForm from '../components/forms/AutomotiveForm';

type ListingType = 'real_estate' | 'product' | 'service' | 'automotive' | null;

export default function CreateListing() {
  const [selectedType, setSelectedType] = useState<ListingType>(null);

  const handleBack = () => {
    setSelectedType(null);
  };

  if (selectedType === 'real_estate') {
    return <RealEstateForm onBack={handleBack} />;
  }

  if (selectedType === 'product') {
    return <ProductForm onBack={handleBack} />;
  }

  if (selectedType === 'service') {
    return <ServiceForm onBack={handleBack} />;
  }

  if (selectedType === 'automotive') {
    return <AutomotiveForm onBack={handleBack} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Create a Listing</h1>
      <p className="text-gray-600 text-center mb-12">
        Choose what type of listing you want to create
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedType('real_estate')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Real Estate</h2>
          <p className="text-gray-600">
            List properties for sale or rent, including houses, apartments, and land
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedType('product')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Product</h2>
          <p className="text-gray-600">
            Sell physical items, from electronics to handmade crafts
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedType('service')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Service</h2>
          <p className="text-gray-600">
            Offer your professional services, skills, and expertise
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedType('automotive')}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Car className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Automotive</h2>
          <p className="text-gray-600">
            List vehicles for sale, including cars, motorcycles, and boats
          </p>
        </motion.button>
      </div>
    </div>
  );
}