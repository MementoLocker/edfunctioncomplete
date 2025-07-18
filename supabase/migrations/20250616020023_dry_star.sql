/*
  # Create capsules table for time capsules

  1. New Tables
    - `capsules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `recipients` (jsonb)
      - `delivery_date` (timestamptz)
      - `files` (jsonb)
      - `customization` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `capsules` table
    - Add policies for users to manage their own capsules
*/

CREATE TABLE IF NOT EXISTS capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  recipients jsonb DEFAULT '[]'::jsonb,
  delivery_date timestamptz NOT NULL,
  files jsonb DEFAULT '[]'::jsonb,
  customization jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sealed', 'delivered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own capsules"
  ON capsules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own capsules"
  ON capsules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own capsules"
  ON capsules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own capsules"
  ON capsules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS capsules_user_id_idx ON capsules(user_id);
CREATE INDEX IF NOT EXISTS capsules_delivery_date_idx ON capsules(delivery_date);
CREATE INDEX IF NOT EXISTS capsules_status_idx ON capsules(status);