/*
  # Create reviews table for customer testimonials

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `rating` (integer)
      - `comment` (text)
      - `service` (text)
      - `verified` (boolean)
      - `photo_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for authenticated users to create reviews
    - Add policy for public read access to approved reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  service text NOT NULL CHECK (service IN ('timecapsule', 'customsong')),
  verified boolean DEFAULT false,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (verified = true);

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS reviews_verified_idx ON reviews(verified);
CREATE INDEX IF NOT EXISTS reviews_service_idx ON reviews(service);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);