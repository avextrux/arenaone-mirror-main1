/*
  # Fix authentication and profiles system

  1. Improvements
    - Fix profile creation trigger
    - Add proper RLS policies
    - Ensure data consistency
    - Add missing indexes
    - Fix foreign key constraints

  2. Security
    - Update RLS policies for better security
    - Add proper constraints
    - Fix permission checks
*/

-- Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'fan'::user_type),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_club_members_invite_code ON club_members(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_club_members_status ON club_members(status);
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);

-- Fix RLS policies for better security
DROP POLICY IF EXISTS "Users can view public posts and own posts" ON posts;
CREATE POLICY "Users can view posts based on visibility"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR 
    (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows 
      WHERE following_id = posts.user_id AND follower_id = auth.uid()
    ))
  );

-- Improve club member policies
DROP POLICY IF EXISTS "club_members_insert_by_admin_or_unassigned_invite" ON club_members;
CREATE POLICY "club_members_insert_by_admin_or_self_assign"
  ON club_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admin can create invites
    has_department_permission(auth.uid(), club_id, 'admin'::club_department, 'write'::permission_level) OR
    -- User can assign themselves to unassigned invites
    (user_id = auth.uid() AND invite_code IS NOT NULL)
  );

-- Add function to check if user can access player data
CREATE OR REPLACE FUNCTION can_access_player_data(player_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Player can access their own data
  IF EXISTS (
    SELECT 1 FROM players 
    WHERE id = player_id AND profile_id = requesting_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Club staff can access their club's players
  IF EXISTS (
    SELECT 1 FROM players p
    JOIN club_members cm ON cm.club_id = p.current_club_id
    WHERE p.id = player_id 
    AND cm.user_id = requesting_user_id 
    AND cm.status = 'accepted'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update player policies to use the new function
DROP POLICY IF EXISTS "Allow players to update own profile or club staff to update" ON players;
CREATE POLICY "players_update_access_control"
  ON players
  FOR UPDATE
  TO authenticated
  USING (can_access_player_data(id, auth.uid()))
  WITH CHECK (can_access_player_data(id, auth.uid()));

-- Add constraint to ensure valid opportunity types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'opportunities_valid_type'
  ) THEN
    ALTER TABLE opportunities 
    ADD CONSTRAINT opportunities_valid_type 
    CHECK (opportunity_type IN ('player_transfer', 'coaching_job', 'scouting_role', 'medical_role', 'administrative_role', 'transfer', 'loan', 'trial', 'staff', 'partnership'));
  END IF;
END $$;

-- Ensure messages table has proper foreign key to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_receiver_id_fkey'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation last_message_at
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Add missing receiver_id column to messages if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'receiver_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update messages RLS policies
DROP POLICY IF EXISTS "messages_select_participants" ON messages;
CREATE POLICY "messages_select_conversation_participants"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Ensure proper cleanup of unused files
CREATE OR REPLACE FUNCTION cleanup_unused_storage_files()
RETURNS void AS $$
DECLARE
  file_record RECORD;
BEGIN
  -- This is a placeholder for storage cleanup logic
  -- In a real implementation, you would scan storage buckets
  -- and remove files that are no longer referenced
  RAISE NOTICE 'Storage cleanup function called';
END;
$$ LANGUAGE plpgsql;