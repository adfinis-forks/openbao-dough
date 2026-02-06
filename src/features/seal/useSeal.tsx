import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { seal, sealStatus } from '@/shared/client/sdk.gen';
import { useNotifications } from '@/shared/components/common/Notification';
import { useAuth } from '@/shared/hooks/useAuth';

export function useSeal() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();

  const sealStatusQuery = useQuery({
    queryKey: ['seal-status'],
    queryFn: async () => {
      if (!client) throw new Error('No authenticated client available');
      const { data, error } = await sealStatus({ client, throwOnError: false });
      if (error) throw error;
      return data;
    },
    enabled: !!client,
    refetchInterval: 5000, // Refetch every 5 seconds to keep the status updated
  });

  const sealMutation = useMutation({
    mutationFn: async () => {
      if (!client) throw new Error('Not authenticated');
      const { error } = await seal({ client, throwOnError: false });
      if (error) throw error;
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Bao Sealed',
      });
      navigate({ to: '/unseal' });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to Seal Bao',
        message: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return {
    sealStatus: sealStatusQuery.data,
    isLoading: sealStatusQuery.isLoading,
    isError: sealStatusQuery.isError,
    error: sealStatusQuery.error,
    seal: sealMutation.mutate,
    isSealing: sealMutation.isPending,
  };
}
