import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createApi } from 'npm:unsplash-js@7.0.18';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const unsplash = createApi({
  accessKey: Deno.env.get('UNSPLASH_ACCESS_KEY') || '',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, page = 1, perPage = 12 } = await req.json();

    if (!query) {
      throw new Error('Search query is required');
    }

    // Add category-specific keywords
    let searchQuery = query;
    switch (category) {
      case 'real_estate':
        searchQuery += ' property real estate';
        break;
      case 'automotive':
        searchQuery += ' car vehicle';
        break;
      case 'services':
        searchQuery += ' business service';
        break;
      case 'pets':
        searchQuery += ' pet animal';
        break;
    }

    const result = await unsplash.search.getPhotos({
      query: searchQuery,
      page,
      perPage,
      orientation: 'squarish',
    });

    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    const images = result.response.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      description: photo.description || photo.alt_description,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html,
      },
    }));

    return new Response(
      JSON.stringify(images),
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