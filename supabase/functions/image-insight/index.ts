import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';
import vision from 'npm:@google-cloud/vision@4.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
}));

// Initialize Google Vision
const visionClient = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    // Get Google Vision analysis
    const [visionResult] = await visionClient.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'TEXT_DETECTION' },
        { type: 'SAFE_SEARCH_DETECTION' },
      ],
    });

    // Extract relevant information from Vision API
    const labels = visionResult.labelAnnotations?.map(label => label.description) || [];
    const objects = visionResult.localizedObjectAnnotations?.map(obj => obj.name) || [];
    const text = visionResult.textAnnotations?.[0]?.description || '';
    const safeSearch = visionResult.safeSearchAnnotation || {};

    // Use OpenAI to analyze combined data
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing images for marketplace listings. Combine the Google Vision API results with your analysis to provide detailed insights.'
        },
        {
          role: 'user',
          content: `Analyze this image data and provide listing details:
            Labels: ${labels.join(', ')}
            Objects: ${objects.join(', ')}
            Text Found: ${text}
            Safety: ${JSON.stringify(safeSearch)}
            
            Provide a JSON response with:
            - category: Most likely listing category
            - title: Suggested listing title
            - description: Detailed description
            - condition: Assessment of item condition
            - key_features: Array of important features
            - suggested_price: Estimated value range
            - safety_concerns: Any potential issues to note`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const aiAnalysis = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        google_vision: {
          labels,
          objects,
          text,
          safety: safeSearch
        },
        analysis: JSON.parse(aiAnalysis)
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