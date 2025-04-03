/**
 * Mock function to replace the actual reCAPTCHA verification
 * This always returns success since reCAPTCHA is disabled
 */
export async function verifyRecaptchaToken(token: string, action?: string): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  timestamp?: string;
  hostname?: string;
  errorCodes?: string[];
  message?: string;
}> {
  console.log('reCAPTCHA verification bypassed - feature disabled');
  console.log('Token received:', token);
  console.log('Action:', action || 'default');
  
  // Return a successful verification result
  return {
    success: true,
    score: 1.0,
    action: action || 'default',
    timestamp: new Date().toISOString(),
    hostname: window.location.hostname,
    message: 'reCAPTCHA verification bypassed'
  };
}