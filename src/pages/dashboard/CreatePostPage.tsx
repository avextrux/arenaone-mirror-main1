import CreatePost from "@/components/dashboard/CreatePost";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { AppProfile } from "@/types/app"; // Importar AppProfile
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreatePostPage = () => {
  const { user } = useAuth();
  const { profile, loading } = useOnboardingStatus(); // Usar o profile do hook de onboarding
  const navigate = useNavigate();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground ml-4">Carregando perfil para criar post...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Erro ao carregar perfil</h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar suas informações para criar um post.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handlePostSubmit = async (content: string, postType: string, visibility: string) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          user_id: user.id,
          content: content,
          post_type: postType,
          visibility: visibility
        }]);

      if (error) throw error;

      toast({
        title: "Post criado!",
        description: "Seu post foi publicado com sucesso.",
      });

      // Redirect to feed after successful post creation
      navigate('/dashboard/feed');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro ao criar post",
        description: "Não foi possível publicar seu post.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold mb-6">Criar Novo Post</h1>
      <CreatePost 
        user={profile} // Passar o objeto profile diretamente
        onPost={handlePostSubmit} // Usando a função simulada
      />
    </div>
  );
};

export default CreatePostPage;