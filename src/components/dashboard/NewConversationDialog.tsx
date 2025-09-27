import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, UserPlus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_type: string;
}

interface NewConversationDialogProps {
  onConversationStarted: (conversationId: string) => void;
}

const NewConversationDialog = ({ onConversationStarted }: NewConversationDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const getUserTypeColor = (userType: string) => {
    const colors = {
      player: "bg-blue-100 text-blue-800",
      club: "bg-red-100 text-red-800",
      agent: "bg-green-100 text-green-800",
      coach: "bg-purple-100 text-purple-800",
      scout: "bg-orange-100 text-orange-800",
      journalist: "bg-yellow-100 text-yellow-800",
      fan: "bg-gray-100 text-gray-800"
    };
    return colors[userType as keyof typeof colors] || colors.fan;
  };

  const getUserTypeLabel = (userType: string) => {
    const labels = {
      player: "Jogador",
      club: "Clube", 
      agent: "Agente",
      coach: "Técnico",
      scout: "Olheiro",
      journalist: "Jornalista",
      fan: "Torcedor"
    };
    return labels[userType as keyof typeof labels] || "Usuário";
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .ilike('full_name', `%${searchTerm.trim()}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar perfis.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user || !otherUserId || creatingConversation) return;

    setCreatingConversation(true);
    try {
      // Check if conversation already exists
      const { data: existingConv, error: existingConvError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingConvError && existingConvError.code !== 'PGRST116') throw existingConvError; // PGRST116 means no rows found

      let conversationId = existingConv?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([{ user1_id: user.id, user2_id: otherUserId }])
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      toast({
        title: "Conversa iniciada!",
        description: "Você pode começar a enviar mensagens.",
      });
      onConversationStarted(conversationId);
      setOpen(false); // Close dialog
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar uma nova conversa.",
        variant: "destructive",
      });
    } finally {
      setCreatingConversation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={isMobile ? "max-w-[95vw] rounded-lg" : "max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Iniciar Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Busque por usuários para iniciar uma nova conversa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome completo..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={searching}
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
            >
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {searching ? (
              <div className="text-center text-muted-foreground py-4">Buscando...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {profile.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{profile.full_name}</p>
                      <Badge className={`text-xs mt-1 ${getUserTypeColor(profile.user_type)}`}>
                        {getUserTypeLabel(profile.user_type)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartConversation(profile.id)}
                    disabled={creatingConversation}
                  >
                    {creatingConversation ? "Iniciando..." : <UserPlus className="w-4 h-4" />}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                {searchTerm.trim() ? "Nenhum usuário encontrado." : "Comece a digitar para buscar usuários."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;