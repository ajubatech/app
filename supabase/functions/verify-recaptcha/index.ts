import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Using test keys for development
// In production, use environment variables with real keys
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY') || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    if (!token) {
      throw new Error('reCAPTCHA token is required');
    }

    console.log('Verifying reCAPTCHA token:', token);
    console.log('Action:', action || 'No action specified');

    // Verify the reCAPTCHA token with Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
        ...(action ? { action } : {})
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Log verification attempt for debugging
    console.log('reCAPTCHA verification result:', data);

    // For test keys, always return success
    // The test keys will always return success regardless of the token
    if (RECAPTCHA_SECRET_KEY === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Using test reCAPTCHA keys - verification bypassed',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: data.success,
        score: data.score, // Only available with reCAPTCHA v3
        action: data.action, // Only available with reCAPTCHA v3
        timestamp: data.challenge_ts,
        hostname: data.hostname,
        errorCodes: data['error-codes']
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});