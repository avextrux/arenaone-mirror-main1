-- Create user types enum
CREATE TYPE public.user_type AS ENUM (
  'player',
  'club',
  'agent',
  'coach',
  'scout', 
  'journalist',
  'fan',
  'referee',
  'medical_staff'
);

-- Update profiles table to include user type and additional fields
ALTER TABLE public.profiles 
ADD COLUMN user_type public.user_type DEFAULT 'fan',
ADD COLUMN bio TEXT,
ADD COLUMN location TEXT,
ADD COLUMN website TEXT,
ADD COLUMN verified BOOLEAN DEFAULT false,
ADD COLUMN followers_count INTEGER DEFAULT 0,
ADD COLUMN following_count INTEGER DEFAULT 0,
ADD COLUMN posts_count INTEGER DEFAULT 0;

-- Create posts table for social media functionality
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  post_type TEXT DEFAULT 'post' CHECK (post_type IN ('post', 'transfer', 'match_result', 'training')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follows table for networking
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create connections table for professional networking
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create messages table for direct messaging
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create opportunities table for job/transfer opportunities
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('player_transfer', 'coaching_job', 'scouting_role', 'medical_role', 'administrative_role')),
  requirements TEXT[],
  location TEXT,
  salary_range TEXT,
  deadline DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create opportunity applications table
CREATE TABLE public.opportunity_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(opportunity_id, applicant_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Users can view public posts and own posts" ON public.posts
FOR SELECT USING (
  visibility = 'public' OR 
  user_id = auth.uid() OR
  (visibility = 'followers' AND EXISTS (
    SELECT 1 FROM public.follows 
    WHERE following_id = posts.user_id AND follower_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their own posts" ON public.posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on visible posts" ON public.comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id AND (
      posts.visibility = 'public' OR 
      posts.user_id = auth.uid() OR
      (posts.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM public.follows 
        WHERE following_id = posts.user_id AND follower_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for connections
CREATE POLICY "Users can view their own connections" ON public.connections
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests" ON public.connections
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections they are involved in" ON public.connections
FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received" ON public.messages
FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for opportunities
CREATE POLICY "Users can view all opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Users can create opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Users can update their own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = poster_id);
CREATE POLICY "Users can delete their own opportunities" ON public.opportunities FOR DELETE USING (auth.uid() = poster_id);

-- RLS Policies for opportunity applications
CREATE POLICY "Users can view applications for their opportunities or their own applications" ON public.opportunity_applications
FOR SELECT USING (
  auth.uid() = applicant_id OR
  EXISTS (SELECT 1 FROM public.opportunities WHERE opportunities.id = opportunity_applications.opportunity_id AND opportunities.poster_id = auth.uid())
);

CREATE POLICY "Users can create applications" ON public.opportunity_applications
FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications or applications for their opportunities" ON public.opportunity_applications
FOR UPDATE USING (
  auth.uid() = applicant_id OR
  EXISTS (SELECT 1 FROM public.opportunities WHERE opportunities.id = opportunity_applications.opportunity_id AND opportunities.poster_id = auth.uid())
);

-- Create triggers for updating timestamps
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunity_applications_updated_at
  BEFORE UPDATE ON public.opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();