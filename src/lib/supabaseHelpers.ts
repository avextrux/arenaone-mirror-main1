import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./errorHandling";

export const createPost = async (userId: string, content: string, postType: string = "post", visibility: string = "public") => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: userId,
        content: content.trim(),
        post_type: postType,
        visibility: visibility,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "criação de post") };
  }
};

export const updateProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "atualização de perfil") };
  }
};

export const createClub = async (clubData: any, managerId: string) => {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .insert([{
        ...clubData,
        manager_id: managerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "criação de clube") };
  }
};

export const sendMessage = async (conversationId: string, senderId: string, receiverId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        read: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "envio de mensagem") };
  }
};

export const createNotification = async (userId: string, type: string, title: string, description: string, relatedEntityId?: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        description,
        related_entity_id: relatedEntityId || null,
        read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "criação de notificação") };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error, "marcação de notificação como lida") };
  }
};

export const getProfileWithClubMemberships = async (userId: string) => {
  try {
    const [profileResult, membershipsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      supabase
        .from('club_members')
        .select('*, clubs(name, logo_url)')
        .eq('user_id', userId)
        .eq('status', 'accepted')
    ]);

    if (profileResult.error) throw profileResult.error;
    
    return {
      profile: profileResult.data,
      clubMemberships: membershipsResult.data || [],
      error: null
    };
  } catch (error) {
    return {
      profile: null,
      clubMemberships: [],
      error: handleSupabaseError(error, "busca de perfil e memberships")
    };
  }
};