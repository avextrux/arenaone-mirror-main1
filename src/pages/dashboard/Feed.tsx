import { useEffect, useState } from "react";
import CreatePost from "@/components/dashboard/CreatePost";
import FeedPost from "@/components/dashboard/FeedPost";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Profile as UserProfile } from "@/pages/Dashboard"; // Importando o tipo Profile

interface Post {
  id: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user_id: string;
  profiles?: { // Made profiles optional
    full_name: string;
    avatar_url?: string;
    user_type: string;  
    verified: boolean;
  };
}

interface FeedProps {
  profile: UserProfile | null;
}

const Feed = ({ profile }: FeedProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loadingFeed, setLoadingFeed] = useState(true); // Novo estado de carregamento para o feed

  useEffect(() => {
    if (user && profile) { // Garante que o perfil está disponível
      fetchFeed();
      fetchLikedPosts();
    }
  }, [user, profile]); // Adiciona profile como dependência

  const fetchFeed = async () => {
    setLoadingFeed(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          user_type,
          verified
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setPosts(data);
    }
    setLoadingFeed(false);
  };

  const fetchLikedPosts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id);

    if (data) {
      setLikedPosts(new Set(data.map(like => like.post_id)));
    }
  };

  const handleCreatePost = async (content: string, postType: string, visibility: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        content: content,
        post_type: postType,
        visibility: visibility
      }]);

    if (!error) {
      await fetchFeed();
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
          : post
      ));
    } else {
      await supabase
        .from('likes')
        .insert([{
          user_id: user.id,
          post_id: postId
        }]);

      setLikedPosts(prev => new Set([...prev, postId]));

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    }
  };

  if (!profile || loadingFeed) { // Usa o profile da prop e o novo estado de carregamento
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost 
        user={{
          name: profile.full_name,
          avatar: profile.avatar_url,
          userType: profile.user_type || "player" // Fallback temporário, idealmente user_type nunca seria null aqui
        }}
        onPost={handleCreatePost}
      />

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              id={post.id}
              author={{
                name: post.profiles?.full_name || "Usuário Desconhecido", // Null check
                username: post.profiles?.full_name?.toLowerCase().replace(/\s+/g, '') || "desconhecido", // Null check
                avatar: post.profiles?.avatar_url, // Null check
                userType: post.profiles?.user_type || "player", // Null check
                verified: post.profiles?.verified || false // Null check
              }}
              content={post.content}
              postType={post.post_type}
              likes={post.likes_count}
              comments={post.comments_count}
              shares={post.shares_count}
              timestamp={post.created_at}
              isLiked={likedPosts.has(post.id)}
              onLike={() => handleLikePost(post.id)}
              onComment={() => {}}
              onShare={() => {}}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum post ainda</h3>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a compartilhar algo interessante!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Feed;