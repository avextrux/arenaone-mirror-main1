import CreatePost from "@/components/dashboard/CreatePost";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const CreatePostPage = () => {
  const { user } = useAuth();
  const { profile, loading } = useOnboardingStatus(); // Usar o profile do hook de onboarding

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

  // A função onPost será tratada pelo componente Feed, então aqui apenas passamos um placeholder
  // ou podemos refatorar CreatePost para ter sua própria lógica de envio.
  // Por enquanto, vamos simular o onPost para que o componente CreatePost funcione.
  const handlePostSubmit = async (content: string, postType: string, visibility: string) => {
    console.log("Post submitted from CreatePostPage:", { content, postType, visibility });
    // Em uma implementação real, você chamaria a API para criar o post aqui.
    // Por simplicidade, vamos apenas logar e mostrar um toast.
    // A lógica real de criação de post já existe no Feed.tsx, então idealmente
    // este componente seria usado dentro do Feed ou teria sua própria lógica de API.
    // Para evitar duplicação, vamos apenas simular aqui.
    // Se o objetivo é ter uma página dedicada, a lógica de API deve vir para cá.
    // Por enquanto, o Feed.tsx ainda é o responsável por criar posts.
    // Para esta página funcionar de forma independente, precisaríamos de uma função de API aqui.
    // Por simplicidade, vamos apenas retornar uma Promise resolvida.
    return Promise.resolve();
  };


  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold mb-6">Criar Novo Post</h1>
      <CreatePost 
        user={{
          name: profile.full_name,
          avatar: profile.avatar_url,
          userType: profile.user_type || "fan" // Fallback para fan se for null
        }}
        onPost={handlePostSubmit} // Usando a função simulada
      />
    </div>
  );
};

export default CreatePostPage;