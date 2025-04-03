/*
  # Create Registration Lookup History Table

  1. New Table
    - lookup_history
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - rego_plate (text)
      - state (text)
      - country (text)
      - status (text)
      - data (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS lookup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rego_plate text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'AU',
  status text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_country CHECK (country IN ('AU', 'NZ'))
);

ALTER TABLE lookup_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own lookup history
CREATE POLICY "Users can read own lookup history"
  ON lookup_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to create lookup history entries
CREATE POLICY "Users can create lookup history"
  ON lookup_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());