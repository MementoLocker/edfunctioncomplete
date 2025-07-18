/*
  # Create waitlist table for custom song service

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `service` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for public insert access
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  service text NOT NULL DEFAULT 'customsong',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_service_idx ON waitlist(service);