/*
  # Add stripe_price_id to profiles table

  1. Changes
    - Add `stripe_price_id` column to profiles table for storing Stripe price IDs
    
  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_price_id text;
  END IF;
END $$;