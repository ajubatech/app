import React, { useEffect } from 'react';
import { verifyRecaptchaToken } from '../utils/recaptcha';

interface RecaptchaWrapperProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  action?: string;
  onVerify?: (result: { success: boolean; score?: number }) => void;
}

/**
 * This is a mock component that replaces the actual reCAPTCHA
 * It automatically triggers the onChange callback with a fake token
 */
const RecaptchaWrapper: React.FC<RecaptchaWrapperProps> = ({ 
  onChange, 
  action,
  onVerify 
}) => {
  // Automatically trigger the onChange callback when component mounts
  useEffect(() => {
    console.log('Mock reCAPTCHA: Component mounted');
    
    // Use setTimeout to simulate the async nature of reCAPTCHA
    const timer = setTimeout(() => {
      const fakeToken = 'recaptcha-disabled-mock-token';
      console.log('Mock reCAPTCHA: Providing fake token');
      
      // Call the onChange callback with the fake token
      onChange(fakeToken);
      
      // If onVerify is provided, call it with a successful result
      if (onVerify) {
        verifyRecaptchaToken(fakeToken, action)
          .then(result => onVerify(result))
          .catch(error => {
            console.error('Error in mock verification:', error);
            onVerify({ 
              success: true,
              score: 1.0 
            });
          });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onChange, onVerify, action]);

  // Return an empty div instead of the actual reCAPTCHA widget
  return <div className="hidden">reCAPTCHA disabled</div>;
};

export default RecaptchaWrapper;