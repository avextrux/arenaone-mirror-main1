import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  receiver_id: string;
}

interface Conversation {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  user_type: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      // Simulando conversas - em produção, isso viria de uma query real
      const mockConversations: Conversation[] = [
        {
          user_id: "1",
          user_name: "Carlos Silva",
          avatar_url: undefined,
          user_type: "agent",
          last_message: "Vamos discutir a proposta do Real Madrid?",
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          unread_count: 2
        },
        {
          user_id: "2", 
          user_name: "Flamengo FC",
          avatar_url: undefined,
          user_type: "club",
          last_message: "Interessados no seu perfil",
          last_message_time: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 0
        },
        {
          user_id: "3",
          user_name: "João Olheiro",
          avatar_url: undefined,
          user_type: "scout",
          last_message: "Relatório do último jogo anexado",
          last_message_time: new Date(Date.now() - 86400000).toISOString(),
          unread_count: 1
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // Simulando mensagens - em produção, isso viria de uma query real
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Olá! Como você está?",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          sender_id: conversationId,
          receiver_id: user?.id || ""
        },
        {
          id: "2", 
          content: "Estou bem, obrigado! E você?",
          created_at: new Date(Date.now() - 3300000).toISOString(),
          read: true,
          sender_id: user?.id || "",
          receiver_id: conversationId
        },
        {
          id: "3",
          content: "Vamos discutir a proposta do Real Madrid?",
          created_at: new Date(Date.now() - 300000).toISOString(),
          read: false,
          sender_id: conversationId,
          receiver_id: user?.id || ""
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        created_at: new Date().toISOString(),
        read: false,
        sender_id: user.id,
        receiver_id: selectedConversation
      };

      setMessages(prev => [...prev, message]);
      setNewMessage("");

      // Em produção, aqui faria a inserção real no banco
      /* 
      await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage
        }]);
      */

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h`;
    if (hours < 168) return `${Math.floor(hours / 24)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Mensagens
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user_id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                    selectedConversation === conversation.user_id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.user_id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conversation.avatar_url} />
                      <AvatarFallback>
                        {conversation.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">
                          {conversation.user_name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs mt-1 ${getUserTypeColor(conversation.user_type)}`}>
                        {getUserTypeLabel(conversation.user_type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {conversations.find(c => c.user_id === selectedConversation)?.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {conversations.find(c => c.user_id === selectedConversation)?.user_name}
                      </h3>
                      <Badge className={`text-xs ${getUserTypeColor(conversations.find(c => c.user_id === selectedConversation)?.user_type || 'fan')}`}>
                        {getUserTypeLabel(conversations.find(c => c.user_id === selectedConversation)?.user_type || 'fan')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa da lista para começar a trocar mensagens
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;