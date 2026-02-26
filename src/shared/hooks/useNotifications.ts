import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';
import { useAuth } from './useAuth';
import type { Notification } from '@/shared/types/notification.types';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar contagem de não lidas
  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('notif_notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('lida', false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setUnreadCount(countData ?? 0);
  }, [countData]);

  // Escutar novas notificações via Realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notif_notificacoes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notif_notificacoes',
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Buscar últimas notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notif_notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Marcar como lida
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notif_notificacoes')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marcar todas como lidas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notif_notificacoes')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('usuario_id', user.id)
        .eq('lida', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
