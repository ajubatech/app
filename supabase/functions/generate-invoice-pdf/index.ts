import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
    const { invoiceId, userId } = await req.json();

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

    // Generate PDF using HTML template
    const htmlContent = generateInvoiceHTML(invoice, settings, userData);
    
    // Convert HTML to PDF using a service like Puppeteer or wkhtmltopdf
    // For this example, we'll simulate PDF generation and return a URL
    
    // In a real implementation, you would:
    // 1. Generate the PDF
    // 2. Upload it to Supabase Storage
    // 3. Get the public URL
    // 4. Update the invoice record with the PDF URL
    
    // Simulate PDF generation
    const pdfUrl = `https://example.com/invoices/${invoice.id}.pdf`;
    
    // Update invoice with PDF URL
    await supabaseClient
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId);

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl,
        message: 'PDF generated successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    
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

function generateInvoiceHTML(invoice: any, settings: any, user: any) {
  const businessName = settings?.business_name || user.full_name || 'Your Business';
  const businessAddress = settings?.address || 'Your Address';
  const businessEmail = settings?.email || user.email;
  const businessPhone = settings?.phone || 'Your Phone';
  
  const recipientName = invoice.recipient_name || 'Client';
  const recipientEmail = invoice.recipient_email;
  const recipientAddress = invoice.recipient_address || '';
  
  const invoiceItems = invoice.invoice_items || [];
  
  // Calculate totals
  const subtotal = invoiceItems.reduce((sum: number, item: any) => sum + item.amount, 0);
  const taxAmount = invoice.tax_amount || 0;
  const totalAmount = invoice.total_amount || subtotal + taxAmount;
  
  // Format dates
  const issueDate = new Date(invoice.issue_date).toLocaleDateString();
  const dueDate = new Date(invoice.due_date).toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-details {
          margin-bottom: 30px;
        }
        .invoice-details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .invoice-table th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .invoice-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .invoice-total {
          text-align: right;
          margin-top: 20px;
        }
        .invoice-total-row {
          margin-bottom: 5px;
        }
        .invoice-total-label {
          font-weight: bold;
          margin-right: 20px;
        }
        .invoice-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <div class="invoice-title">${businessName}</div>
            <div>${businessAddress}</div>
            <div>${businessEmail}</div>
            <div>${businessPhone}</div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>Invoice #: ${invoice.invoice_number}</div>
            <div>Issue Date: ${issueDate}</div>
            <div>Due Date: ${dueDate}</div>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-details-row">
            <div>
              <div><strong>Bill To:</strong></div>
              <div>${recipientName}</div>
              <div>${recipientEmail}</div>
              <div>${recipientAddress}</div>
            </div>
            <div>
              <div><strong>Status:</strong> ${invoice.status.toUpperCase()}</div>
              ${invoice.reference ? `<div><strong>Reference:</strong> ${invoice.reference}</div>` : ''}
            </div>
          </div>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceItems.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unit_price.toFixed(2)}</td>
                <td>$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="invoice-total">
          <div class="invoice-total-row">
            <span class="invoice-total-label">Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="invoice-total-row">
            <span class="invoice-total-label">Tax (${invoice.tax_rate || 0}%):</span>
            <span>$${taxAmount.toFixed(2)}</span>
          </div>
          <div class="invoice-total-row">
            <span class="invoice-total-label">Total:</span>
            <span>$${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div style="margin-top: 30px;">
            <strong>Notes:</strong>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        ${settings?.terms ? `
          <div style="margin-top: 20px;">
            <strong>Terms and Conditions:</strong>
            <p>${settings.terms}</p>
          </div>
        ` : ''}
        
        <div class="invoice-footer">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}