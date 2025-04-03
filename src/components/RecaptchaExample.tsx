import React, { useState, useEffect } from 'react';
import { verifyRecaptchaToken } from '../utils/recaptcha';
import { Button } from './ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecaptchaExampleProps {
  action?: string;
}

export default function RecaptchaExample({ action = 'homepage' }: RecaptchaExampleProps) {
  const [verificationResult, setVerificationResult] = useState<{
    success?: boolean;
    score?: number;
    action?: string;
    timestamp?: string;
  } | null>(null);

  // Automatically verify on component mount
  useEffect(() => {
    handleVerify();
  }, []);

  const handleVerify = async () => {
    try {
      const result = await verifyRecaptchaToken('mock-token', action);
      setVerificationResult(result);
      
      toast.success('Verification successful (reCAPTCHA disabled)');
    } catch (error) {
      console.error('Error in verification:', error);
      toast.error('Error in verification process');
      setVerificationResult({ success: true });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">reCAPTCHA Example</h2>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          <p className="font-medium">reCAPTCHA is currently disabled</p>
          <p className="text-sm mt-1">All verification requests will automatically succeed.</p>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Verification Successful</span>
          </div>
          
          <p className="text-sm">Score: 1.0 (Maximum)</p>
          <p className="text-sm">Action: {action}</p>
          <p className="text-sm">Time: {new Date().toLocaleString()}</p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium mb-2">Note:</h3>
          <p className="text-sm text-gray-600">
            reCAPTCHA has been disabled on this platform. In a production environment, 
            you would typically implement reCAPTCHA to protect against bots and automated abuse.
          </p>
        </div>
      </div>
    </div>
  );
}