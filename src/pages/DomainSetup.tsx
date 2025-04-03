import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, ArrowRight, Settings, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import DomainConnector from '../components/DomainConnector';

export default function DomainSetup() {
  const [step, setStep] = useState(1);
  const [domainConnected, setDomainConnected] = useState(false);

  const handleDomainConnected = () => {
    setDomainConnected(true);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Connect Your Domain to ListHouze
          </h1>
          <p className="text-gray-600">
            Follow these steps to connect your custom domain to your ListHouze marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10" />
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-blue-600 -z-10" style={{ width: `${(step / 3) * 100}%` }} />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">Connect Your Domain</h2>
              <DomainConnector onComplete={handleDomainConnected} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">Configure DNS Settings</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium">DNS Configuration</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Add the following DNS records at your domain registrar:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">CNAME</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">www</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">listhouze-app.netlify.app</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">3600</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">A</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">@</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">75.2.60.5</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">3600</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center mb-6">Verify Connection</h2>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Domain Successfully Connected!</h3>
                <p className="text-gray-600 mb-6">
                  Your domain has been successfully connected to your ListHouze marketplace.
                  It may take up to 24 hours for DNS changes to fully propagate.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center justify-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Domain Settings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}