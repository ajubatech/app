import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DomainConnectorProps {
  onComplete: () => void;
}

export default function DomainConnector({ onComplete }: DomainConnectorProps) {
  const [domain, setDomain] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const checkDomain = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    try {
      setIsChecking(true);
      setStatus('checking');

      // Simulate domain check
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if domain is valid format
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        setStatus('error');
        setErrorMessage('Please enter a valid domain (e.g., example.com)');
        return;
      }

      // Success
      setStatus('success');
      toast.success('Domain verified successfully!');
      
      // Notify parent component
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error checking domain:', error);
      setStatus('error');
      setErrorMessage('Failed to verify domain. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">Connect Your Domain</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Enter your domain name to connect it to your ListHouze marketplace.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'checking' || status === 'success'}
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <Check className="w-5 h-5" />
            <p className="text-sm">Domain verified successfully!</p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={checkDomain}
          disabled={!domain || status === 'checking' || status === 'success'}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'checking' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              Domain Connected
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Connect Domain
            </>
          )}
        </motion.button>
      </div>

      <div className="mt-6 pt-6 border-t">
        <h3 className="font-medium mb-2">Next Steps:</h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
          <li>Update your DNS settings at your domain registrar</li>
          <li>Add CNAME record pointing to <code className="bg-gray-100 px-1 py-0.5 rounded">listhouze-app.netlify.app</code></li>
          <li>Wait for DNS propagation (may take up to 24 hours)</li>
        </ol>
      </div>
    </div>
  );
}