-- Create listing_moderation_logs table
CREATE TABLE IF NOT EXISTS listing_moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  analysis jsonb NOT NULL,
  approved boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  content jsonb NOT NULL,
  status text DEFAULT 'unread',
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

-- Create user_behavior_flags table
CREATE TABLE IF NOT EXISTS user_behavior_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  flag_type text NOT NULL,
  content text,
  reason text NOT NULL,
  severity text DEFAULT 'medium',
  confidence float,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listing_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_flags ENABLE ROW LEVEL SECURITY;

-- Create policies for listing_moderation_logs
CREATE POLICY "Admins can read all moderation logs"
  ON listing_moderation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'content_admin')
    )
  );

CREATE POLICY "Users can read own moderation logs"
  ON listing_moderation_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for admin_notifications
CREATE POLICY "Admins can read notifications"
  ON admin_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'content_admin', 'support_admin')
    )
  );

CREATE POLICY "Admins can update notifications"
  ON admin_notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'content_admin', 'support_admin')
    )
  );

-- Create policies for user_behavior_flags
CREATE POLICY "Admins can read all user flags"
  ON user_behavior_flags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'support_admin')
    )
  );

CREATE POLICY "Admins can manage user flags"
  ON user_behavior_flags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'support_admin')
    )
  );