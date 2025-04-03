/*
  # Create AI Test Logs Table

  1. New Table
    - ai_test_logs
      - id (uuid, primary key)
      - test_results (jsonb)
      - error (text)
      - status (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS ai_test_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_results jsonb DEFAULT '{}',
  error text,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_test_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read test logs
CREATE POLICY "Users can read test logs"
  ON ai_test_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create test logs
CREATE POLICY "Users can create test logs"
  ON ai_test_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);