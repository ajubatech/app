import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const templates = {
  draft_saved: {
    subject: 'Welcome to ListHouze 🚀 — Your first listing draft is saved',
    html: (data: any) => `
      <h1>Hi there!</h1>
      <p>Your draft has been saved. Use ListAI to help polish and publish it.</p>
      <p>Ready to publish? <a href="${data.editUrl}">Click here to continue editing</a></p>
    `
  },
  listing_published: {
    subject: '🎉 Your listing is live on ListHouze!',
    html: (data: any) => `
      <h1>Congratulations!</h1>
      <p>Your listing "${data.listingTitle}" is now live.</p>
      <p><a href="${data.listingUrl}">View your listing</a></p>
    `
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json();

    if (!to || !template || !templates[template]) {
      throw new Error('Invalid request parameters');
    }

    const emailTemplate = templates[template];
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'ListHouze <noreply@listhouze.com>',
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html(data)
    });

    if (error) throw error;

    return new Response(
      JSON.stringify(emailData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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