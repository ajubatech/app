/*
  # Add Reel Tables

  1. New Tables
    - reel_likes
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - reel_id (uuid, foreign key)
      - created_at (timestamp)
    
    - reel_comments
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - reel_id (uuid, foreign key)
      - comment (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create reel_likes table
CREATE TABLE IF NOT EXISTS reel_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reel_id uuid REFERENCES media(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, reel_id)
);

ALTER TABLE reel_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for reel_likes
CREATE POLICY "Anyone can read reel likes"
  ON reel_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON reel_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create reel_comments table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reel_comments') THEN
    CREATE TABLE reel_comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      reel_id uuid REFERENCES media(id) ON DELETE CASCADE,
      comment text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Anyone can read reel comments"
      ON reel_comments
      FOR SELECT
      TO public
      USING (true);

    CREATE POLICY "Users can manage own comments"
      ON reel_comments
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;