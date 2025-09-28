import { useEffect, useState } from "react";
import CreatePost from "@/components/dashboard/CreatePost";
import FeedPost from "@/components/dashboard/FeedPost";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppProfile, AppPost, FeedAuthorProfile } from "@/types/app"; // Importando AppProfile e AppPost
import { Tables, UserType } from "@/integrations/supabase/types"; // Importando Tables e UserType

interface Post extends AppPost {} // Estender de AppPost

interface FeedProps {
  profile: AppProfile | null; // Usar AppProfile
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
          id,
          full_name,
          avatar_url,
          user_type,
          verified,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setPosts(data as Post[]); // Cast para Post[]
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

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        content: content,
        post_type: postType,
        visibility: visibility
      }])
      .select();

    if (error) {
      toast({
        title: "Erro ao publicar post",
        description: "Não foi possível publicar seu post.",
        variant: "destructive",
      });
    } else {
      await fetchFeed();
      toast({
        title: "Post publicado!",
        description: "Seu post foi publicado com sucesso.",
      });
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
          ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1) }
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
          ? { ...post, likes_count: (post.likes_count || 0) + 1 }
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
        user={profile} // Passar o objeto profile diretamente
        onPost={handleCreatePost}
      />

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              id={post.id}
              author={post.profiles || { // Garantir que author seja FeedAuthorProfile
                id: post.user_id,
                full_name: "Usuário Desconhecido",
                user_type: UserType.Fan, // Corrigido: Usar UserType.Fan
                verified: false,
                email: "unknown@example.com" // Adicionar email para satisfazer FeedAuthorProfile
              }}
              content={post.content}
              postType={post.post_type || "post"}
              likes={post.likes_count || 0}
              comments={post.comments_count || 0}
              shares={post.shares_count || 0}
              timestamp={post.created_at || new Date().toISOString()}
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
              <h3 className="font-semibold text-lg mb-2">Nenhum post ainda</h3>
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