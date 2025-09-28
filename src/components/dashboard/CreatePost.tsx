import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Video, MapPin, Smile, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/integrations/supabase/types";
import { getPostTypeOptions } from "@/lib/userTypeUtils"; // Importando do novo utilitário

interface CreatePostProps {
  user: {
    name: string;
    avatar?: string;
    userType: UserType;
  };
  onPost: (content: string, postType: string, visibility: string) => Promise<void>;
}

const CreatePost = ({ user, onPost }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("post");
  const [visibility, setVisibility] = useState("public");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handlePost = async () => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo do post não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      await onPost(content.trim(), postType, visibility);
      setContent("");
      setPostType("post");
      toast({
        title: "Post publicado!",
        description: "Seu post foi publicado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        description: "Ocorreu um erro ao publicar seu post.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getPostTypePlaceholder = (type: string) => {
    switch (type) {
      case 'transfer':
        return "Compartilhe novidades sobre transferências...";
      case 'match_result':
        return "Como foi a partida hoje?";
      case 'training':
        return "Como foi o treinamento?";
      default:
        return "O que está acontecendo?";
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {getPostTypeOptions(user.userType).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="followers">Seguidores</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder={getPostTypePlaceholder(postType)}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
              maxLength={2000}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                  <Image className="w-4 h-4 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                  <Video className="w-4 h-4 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                  <MapPin className="w-4 h-4 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                  <Smile className="w-4 h-4 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                  <Calendar className="w-4 h-4 text-primary" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {content.length}/2000
                </span>
                <Button
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {isPosting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;