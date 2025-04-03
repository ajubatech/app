import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
}));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, category } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Generate system prompt based on category
    let systemPrompt = 'You are an expert AI assistant that helps create detailed marketplace listings.';
    let format = {};

    switch (category) {
      case 'automotive':
        systemPrompt += ' Focus on vehicle specifications, features, and condition.';
        format = {
          title: 'string - Catchy, professional title',
          description: 'string - Detailed vehicle description (200-300 words)',
          make: 'string - Vehicle manufacturer',
          model: 'string - Vehicle model',
          year: 'number - Manufacturing year',
          variant: 'string - Model variant/trim',
          bodyType: 'string - Vehicle body type',
          transmission: 'string - Transmission type (automatic/manual)',
          fuelType: 'string - Fuel type',
          features: 'array - Key vehicle features',
          suggestedPrice: 'number - Estimated market value in USD'
        };
        break;

      case 'real_estate':
        systemPrompt += ' Focus on property features, location benefits, and unique selling points.';
        format = {
          title: 'string - Professional property title',
          description: 'string - Compelling property description',
          propertyType: 'string - Type of property',
          features: 'array - Key property features',
          amenities: 'array - Available amenities',
          suggestedPrice: 'number - Estimated market value'
        };
        break;

      case 'services':
        systemPrompt += ' Focus on service benefits, expertise, and value proposition.';
        format = {
          title: 'string - Professional service title',
          description: 'string - Service description and benefits',
          category: 'string - Service category',
          features: 'array - Key service features',
          suggestedRate: 'number - Suggested hourly/project rate'
        };
        break;

      default:
        systemPrompt += ' Focus on product features, benefits, and condition.';
        format = {
          title: 'string - Catchy product title',
          description: 'string - Detailed product description',
          features: 'array - Key product features',
          suggestedPrice: 'number - Suggested retail price'
        };
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nRespond with a JSON object in this format:\n${JSON.stringify(format, null, 2)}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;

    return new Response(
      response,
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