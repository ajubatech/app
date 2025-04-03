/*
  # Add banner fields to listings table
  
  1. New Fields
    - `banner_text` - Text for the banner display
    - `banner_type` - Type of banner (free or pro)
    - `banner_style` - Visual style of the banner
  
  2. Changes
    - Adds three new columns to the listings table
    - Sets default value for banner_type to 'free'
*/

-- Add banner fields to listings table
ALTER TABLE IF EXISTS public.listings
ADD COLUMN IF NOT EXISTS banner_text TEXT,
ADD COLUMN IF NOT EXISTS banner_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS banner_style TEXT;

-- Update metadata JSON schema to include banner information
COMMENT ON COLUMN public.listings.metadata IS 'JSON object that can include banner information and other metadata';