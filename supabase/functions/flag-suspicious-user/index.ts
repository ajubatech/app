import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
}));

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// List of disposable email domains
const disposableEmailDomains = [
  'mailinator.com', 'tempmail.com', 'throwawaymail.com', 'guerrillamail.com',
  'yopmail.com', '10minutemail.com', 'mailnesia.com', 'temp-mail.org',
  'fakeinbox.com', 'sharklasers.com', 'trashmail.com', 'getnada.com',
  'dispostable.com', 'mailcatch.com', 'mintemail.com', 'mailinator.net'
];

// Suspicious name patterns
const suspiciousNamePatterns = [
  /^test\s/i, /^test$/i, /^user\s/i, /^user$/i, /^admin\s/i, /^admin$/i,
  /^[a-z]{1,2}\s[a-z]{1,2}$/i, /^[0-9]+\s[0-9]+$/i, /^[a-z]{1,2}[0-9]{1,2}$/i,
  /^anonymous/i, /^fake/i, /^dummy/i, /^sample/i, /^example/i
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName } = await req.json();

    if (!userId || !email) {
      throw new Error('User ID and email are required');
    }

    let isSuspicious = false;
    const reasons = [];

    // Check email domain
    const domain = email.split('@')[1].toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
      isSuspicious = true;
      reasons.push('Disposable email domain detected');
    }

    // Check suspicious email patterns
    if (/^test@|^admin@|^user@|^123@|^abc@|^xyz@/i.test(email)) {
      isSuspicious = true;
      reasons.push('Suspicious email pattern detected');
    }

    // Check name patterns
    if (fullName) {
      for (const pattern of suspiciousNamePatterns) {
        if (pattern.test(fullName)) {
          isSuspicious = true;
          reasons.push('Suspicious name pattern detected');
          break;
        }
      }
    }

    // If suspicious, flag the user
    if (isSuspicious) {
      await supabaseClient
        .from('user_behavior_flags')
        .insert({
          user_id: userId,
          flag_type: 'suspicious_signup',
          reason: reasons.join(', '),
          status: 'active',
          severity: 'medium'
        });

      // Notify admin
      await supabaseClient
        .from('admin_notifications')
        .insert({
          type: 'suspicious_user',
          content: {
            userId,
            email,
            fullName,
            reasons
          },
          status: 'unread'
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        flagged: isSuspicious,
        reasons: isSuspicious ? reasons : []
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
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