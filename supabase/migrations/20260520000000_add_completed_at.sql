ALTER TABLE action_sessions
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;
