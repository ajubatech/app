import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '');

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, userId, message } = await req.json();

    if (!invoiceId || !userId) {
      throw new Error('Invoice ID and User ID are required');
    }

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    // Get invoice settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('invoice_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Check if PDF exists, if not generate it
    if (!invoice.pdf_url) {
      // Call the generate-invoice-pdf function
      const generateResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-invoice-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({ invoiceId, userId }),
        }
      );

      const generateResult = await generateResponse.json();
      if (!generateResult.success) {
        throw new Error('Failed to generate PDF: ' + generateResult.error);
      }

      invoice.pdf_url = generateResult.pdfUrl;
    }

    // Send email with Resend
    const businessName = settings?.business_name || userData.full_name || 'Your Business';
    const emailSubject = `Invoice #${invoice.invoice_number} from ${businessName}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice from ${businessName}</h2>
        <p>Invoice #${invoice.invoice_number}</p>
        <p>Amount: $${invoice.total_amount.toFixed(2)}</p>
        <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
        
        ${message ? `<p>Message: ${message}</p>` : ''}
        
        <p>Please find your invoice attached or view it online.</p>
        
        <div style="margin-top: 30px;">
          <a href="${invoice.pdf_url}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated email from ListHouze.</p>
        </div>
      </div>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${businessName} <invoices@listhouze.com>`,
      to: invoice.recipient_email,
      subject: emailSubject,
      html: emailHtml,
      attachments: invoice.pdf_url ? [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          path: invoice.pdf_url
        }
      ] : undefined
    });

    if (emailError) throw emailError;

    // Update invoice status to 'pending' if it was 'draft'
    if (invoice.status === 'draft') {
      await supabaseClient
        .from('invoices')
        .update({ status: 'pending' })
        .eq('id', invoiceId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoice sent to ${invoice.recipient_email}`,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending invoice:', error);
    
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