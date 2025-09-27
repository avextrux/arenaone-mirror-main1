import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Search, Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook
import NewConversationDialog from "@/components/dashboard/NewConversationDialog"; // Import new component
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils"; // Importando as funções de utilitário
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate

// Define types based on Supabase schema
interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_type: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean | null;
  sender_id: string;
  conversation_id: string;
  profiles?: Profile; // Joined profile of the sender
}

interface Conversation {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
  other_user_profile?: Profile; // Profile of the other participant in the conversation
  last_message_content?: string; // Content of the last message
  unread_count?: number; // Number of unread messages for the current user
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile(); // Use the hook
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Get navigate object

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch conversations where current user is user1 or user2
      const { data: convsData, error: convsError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          user1_id,
          user2_id,
          last_message_at
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convsError) throw convsError;

      const conversationsWithProfiles: Conversation[] = [];
      for (const conv of convsData || []) {
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        
        const { data: otherUserProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, user_type')
          .eq('id', otherUserId)
          .single();

        if (profileError) console.error('Error fetching other user profile:', profileError);

        // Fetch last message content
        const { data: lastMessageData, error: lastMessageError } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastMessageError && lastMessageError.code !== 'PGRST116') console.error('Error fetching last message:', lastMessageError); // PGRST116 means no rows found

        // Fetch unread count
        const { count: unreadCount, error: unreadError } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', user.id); // Only count messages sent by others

        if (unreadError) console.error('Error fetching unread count:', unreadError);

        conversationsWithProfiles.push({
          ...conv,
          other_user_profile: otherUserProfile || undefined,
          last_message_content: lastMessageData?.content || 'Nenhuma mensagem',
          unread_count: unreadCount || 0,
        });
      }
      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar a lista de conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const startNewConversationWithUser = useCallback(async (otherUserId: string) => {
    if (!user || !otherUserId) return;

    try {
      // Check if conversation already exists
      const { data: existingConv, error: existingConvError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingConvError && existingConvError.code !== 'PGRST116') throw existingConvError;

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([{ user1_id: user.id, user2_id: otherUserId }])
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }
      
      setSelectedConversationId(conversationId);
      fetchConversations(); // Re-fetch to include the new conversation in the list
    } catch (error) {
      console.error('Error starting new conversation with user:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar uma nova conversa com este usuário.",
        variant: "destructive",
      });
    }
  }, [user, fetchConversations, toast]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Handle navigation state for starting a new conversation
  useEffect(() => {
    if (user && conversations.length > 0 && location.state?.targetUserId) {
      const targetUserId = location.state.targetUserId;
      const existingConversation = conversations.find(
        (conv) => conv.user1_id === targetUserId || conv.user2_id === targetUserId
      );

      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
      } else {
        startNewConversationWithUser(targetUserId);
      }

      // Clear the state to prevent re-triggering on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, conversations, location.state, navigate, startNewConversationWithUser]);


  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markMessagesAsRead(selectedConversationId);

      // Setup real-time subscription for messages in the selected conversation
      const subscription = supabase
        .channel(`messages:${selectedConversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversationId}`,
          },
          async (payload) => {
            const newMessage = payload.new as Message;
            // Fetch sender profile for the new message
            const { data: senderProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, user_type')
              .eq('id', newMessage.sender_id)
              .single();

            if (profileError) console.error('Error fetching sender profile for new message:', profileError);

            setMessages((prev) => [...prev, { ...newMessage, profiles: senderProfile || undefined }]);
            
            // Mark new message as read if it's from the other user and conversation is open
            if (newMessage.sender_id !== user?.id) {
              markMessagesAsRead(selectedConversationId);
            }
            // Update last message in conversations list
            setConversations(prev => prev.map(conv => 
              conv.id === selectedConversationId 
                ? { ...conv, last_message_content: newMessage.content, last_message_at: newMessage.created_at }
                : conv
            ));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedConversationId, user]);

  // Global subscription for new messages to update conversations list
  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
        .channel('global-messages-updates')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            },
            async (payload) => {
                const newMessage = payload.new as Message;

                // Check if this message belongs to a conversation the current user is part of
                const { data: conversation, error: convError } = await supabase
                    .from('conversations')
                    .select('id, user1_id, user2_id')
                    .eq('id', newMessage.conversation_id)
                    .single();

                if (convError) {
                    console.error('Error fetching conversation for new message:', convError);
                    return;
                }

                if (conversation && (conversation.user1_id === user.id || conversation.user2_id === user.id)) {
                    // If it's the currently selected conversation, the other subscription handles the message display
                    // But we still need to update the conversations list for last message content/time
                    if (newMessage.conversation_id === selectedConversationId) {
                        setConversations(prev => {
                            const updatedConvs = prev.map(conv => {
                                if (conv.id === newMessage.conversation_id) {
                                    return {
                                        ...conv,
                                        last_message_content: newMessage.content,
                                        last_message_at: newMessage.created_at,
                                        // If it's from another user and not yet read, increment unread count
                                        unread_count: newMessage.sender_id !== user.id && !newMessage.read ? (conv.unread_count || 0) + 1 : conv.unread_count
                                    };
                                }
                                return conv;
                            });
                            // Sort to bring the updated conversation to the top
                            return updatedConvs.sort((a, b) => 
                                new Date(b.last_message_at || b.created_at).getTime() - 
                                new Date(a.last_message_at || a.created_at).getTime()
                            );
                        });
                    } else {
                        // For non-selected conversations, update the list item
                        setConversations(prev => {
                            const existingConvIndex = prev.findIndex(c => c.id === newMessage.conversation_id);
                            let updatedConvs = [...prev];
                            let updatedConvItem: Conversation;

                            if (existingConvIndex > -1) {
                                // Update existing conversation
                                updatedConvItem = {
                                    ...prev[existingConvIndex],
                                    last_message_content: newMessage.content,
                                    last_message_at: newMessage.created_at,
                                    unread_count: newMessage.sender_id !== user.id && !newMessage.read ? (prev[existingConvIndex].unread_count || 0) + 1 : prev[existingConvIndex].unread_count
                                };
                                updatedConvs.splice(existingConvIndex, 1); // Remove old item
                            } else {
                                // This case should ideally not happen if fetchConversations is robust,
                                // but as a fallback, fetch the full conversation details
                                console.warn("New message for a conversation not in current list. Re-fetching all conversations.");
                                fetchConversations(); // Re-fetch all to ensure consistency
                                return prev; // Return previous state to avoid flickering while re-fetching
                            }

                            // Add the updated conversation to the top and sort
                            return [updatedConvItem, ...updatedConvs].sort((a, b) => 
                                new Date(b.last_message_at || b.created_at).getTime() - 
                                new Date(a.last_message_at || a.created_at).getTime()
                            );
                        });
                    }
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(messagesSubscription);
    };
}, [user, selectedConversationId, fetchConversations]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            user_type
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens da conversa.",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', user.id); // Only mark messages from others as read
      
      // Update unread count in state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          read: false, // Sender's message is initially unread by receiver
        }]);

      if (error) throw error;
      setNewMessage("");

      // Update last message in conversations list
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversationId 
          ? { ...conv, last_message_content: newMessage.trim(), last_message_at: new Date().toISOString() }
          : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleConversationStarted = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    fetchConversations(); // Re-fetch conversations to update the list
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className={`grid h-full ${isMobile ? 'grid-cols-1' : 'grid-cols-3 gap-6'}`}>
        {/* Conversations List (Visible on mobile if no conversation is selected) */}
        {(!isMobile || !selectedConversationId) && (
          <div className={`${isMobile ? 'col-span-1' : 'col-span-1'}`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Mensagens
                  </span>
                  <NewConversationDialog onConversationStarted={handleConversationStarted} />
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
              <CardContent className="flex-1 space-y-2 p-0 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 ${
                        selectedConversationId === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.other_user_profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {conversation.other_user_profile?.full_name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm truncate">
                              {conversation.other_user_profile?.full_name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message_content}
                            </p>
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs ml-2">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <Badge className={`text-xs mt-1 ${getUserTypeColor(conversation.other_user_profile?.user_type || null)}`}>
                            {getUserTypeLabel(conversation.other_user_profile?.user_type || null)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma conversa encontrada.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chat Area (Visible on mobile if a conversation is selected, or always on desktop) */}
        {(!isMobile || selectedConversationId) && (
          <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b p-4 flex-row items-center gap-3">
                    {isMobile && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedConversationId(null)} className="p-2">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    )}
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.other_user_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {selectedConversation.other_user_profile?.full_name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.other_user_profile?.full_name}
                      </h3>
                      <Badge className={`text-xs ${getUserTypeColor(selectedConversation.other_user_profile?.user_type || null)}`}>
                        {getUserTypeLabel(selectedConversation.other_user_profile?.user_type || null)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
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
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center p-4 text-center">
                  <div className="max-w-xs">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Selecione uma conversa</h3>
                    <p className="text-muted-foreground">
                      Escolha uma conversa da lista para começar a trocar mensagens.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;