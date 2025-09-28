import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, CheckCircle, Archive, Trash2, MessageSquare, UserPlus, TrendingUp, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus"; // Import useOnboardingStatus
import { AppNotification } from "@/types/app"; // Importar AppNotification

interface Notification extends AppNotification {} // Usar AppNotification

const Notifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refetchStatus } = useOnboardingStatus(); // Use refetchStatus from the hook
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Setup real-time subscription for new notifications
      const subscription = supabase
        .channel(`notifications_for_user_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            toast({
              title: newNotification.title,
              description: newNotification.description,
            });
            refetchStatus(); // Re-fetch status to update unread count
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    } else {
      setLoading(false);
    }
  }, [user, toast, refetchStatus]);

  const fetchNotifications = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({ title: "Erro", description: "Não foi possível carregar notificações.", variant: "destructive" });
      } else {
        setNotifications(data as Notification[] || []); // Cast para Notification[]
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ title: "Erro", description: "Ocorreu um erro ao carregar notificações.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Notificação marcada como lida",
        description: "Esta notificação não aparecerá mais como não lida.",
      });
      refetchStatus(); // Re-fetch status to update unread count
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({ title: "Erro", description: "Não foi possível marcar como lida.", variant: "destructive" });
    }
  };

  const archiveNotification = async (id: string) => {
    const notificationToArchive = notifications.find(notif => notif.id === id);
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Notificação arquivada",
        description: "A notificação foi removida da sua lista.",
      });
      if (notificationToArchive && !notificationToArchive.read) {
        refetchStatus(); // Re-fetch status if an unread notification was archived
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast({ title: "Erro", description: "Não foi possível arquivar a notificação.", variant: "destructive" });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      toast({
        title: "Todas as notificações marcadas como lidas",
        description: "Sua caixa de entrada está limpa!",
      });
      refetchStatus(); // Re-fetch status to update unread count
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({ title: "Erro", description: "Não foi possível marcar todas como lidas.", variant: "destructive" });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'connection_request': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'club_invite': return <Building className="w-5 h-5 text-red-500" />;
      case 'system': return <Bell className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
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
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);
  const readNotifications = notifications.filter(notif => notif.read);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notificações
          </h1>
          <p className="text-muted-foreground">
            Mantenha-se atualizado com as últimas atividades
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadNotifications.length === 0}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Marcar todas como lidas
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma notificação</h3>
            <p className="text-muted-foreground">
              Você está em dia! Novas notificações aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {unreadNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Não Lidas ({unreadNotifications.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {unreadNotifications.map((notif, index) => (
                  <div key={notif.id}>
                    <div className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{notif.title}</h3>
                          <span className="text-xs text-muted-foreground">{formatTime(notif.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notif.description}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => markAsRead(notif.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Lida
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => archiveNotification(notif.id)}>
                            <Archive className="w-3 h-3 mr-1" /> Arquivar
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < unreadNotifications.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {readNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lidas ({readNotifications.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {readNotifications.map((notif, index) => (
                  <div key={notif.id}>
                    <div className="flex items-start gap-4 p-4 text-muted-foreground hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 mt-1 opacity-70">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{notif.title}</h3>
                          <span className="text-xs">{formatTime(notif.created_at)}</span>
                        </div>
                        <p className="text-sm mt-1">{notif.description}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => archiveNotification(notif.id)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < readNotifications.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;