import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { seal } from '@/shared/client/sdk.gen';
import { Button } from '@/shared/components/common/Button';
import { ConfirmAction } from '@/shared/components/common/ConfirmAction';
import { Lock } from '@/shared/components/common/Icons';
import { useNotifications } from '@/shared/components/common/Notification';
import { useAuth } from '@/shared/hooks/useAuth';
import './SealView.css';

export function SealView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const { addNotification } = useNotifications();
  const { getAuthenticatedClient } = useAuth();
  const navigate = useNavigate();

  const handleSeal = async () => {
    const client = getAuthenticatedClient();
    if (!client) return;

    setIsSealing(true);

    try {
      const { error } = await seal({ client, throwOnError: false });
      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'OpenBao Sealed',
        message: 'OpenBao has been successfully sealed.',
      });
      navigate({ to: '/unseal' });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Seal OpenBao',
        message:
          err instanceof Error
            ? err.message
            : 'An unknown error occurred while sealing OpenBao.',
      });
      setIsSealing(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="seal-view">
      <h1>Seal OpenBao</h1>
      <p>
        Sealing an OpenBao instance tells the OpenBao server to stop responding
        to any access operations until it is unsealed again. A sealed instance
        throws away its root key to unlock the data, so it physically is blocked
        from responding to operations again until OpenBao is unsealed again with
        the "unseal" command or via the API.{' '}
      </p>
      <div className="seal-view__actions">
        <Button
          variant="outlined-danger"
          icon={<Lock size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Seal OpenBao
        </Button>

        <ConfirmAction
          isOpen={isModalOpen}
          onClose={() => !isSealing && setIsModalOpen(false)}
          onConfirm={handleSeal}
          title="Seal this Cluster?"
          message="You will not be able to read or write any data until the cluster is unsealed again."
          confirmText="Seal"
          cancelText="Cancel"
          confirmVariant="danger"
          isLoading={isSealing}
        />
      </div>
    </div>
  );
}
