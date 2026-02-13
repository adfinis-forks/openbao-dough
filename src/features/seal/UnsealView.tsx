import { Button } from '@common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@common/Card';
import { Lock, Unlock } from '@common/Icons';
import { Input } from '@common/Input';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { createClient } from '@/shared/client/client';
import { unseal } from '@/shared/client/sdk.gen';
import { useNotifications } from '@/shared/components/common/Notification';
import { BAO_ADDR } from '@/shared/config/config';
import './UnsealView.css';

const DOCS_URL = 'https://openbao.org/docs/concepts/seal/';

export function UnsealView() {
  const [key, setKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [threshold, setThreshold] = useState(0);

  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const client = createClient({ baseUrl: BAO_ADDR });

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
      const e = err as { errors?: string[]; message?: string };
      if (e.errors?.[0]) return e.errors[0];
      if (e.message) return e.message;
    }
    return 'An unexpected error occurred';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsSubmitting(true);

    const { data, error: apiError } = await unseal({
      client,
      body: { key },
      throwOnError: false,
    });

    if (apiError) {
      addNotification({ type: 'error', title: 'Unseal Failed', message: getErrorMessage(apiError) });
      setIsSubmitting(false);
      return;
    }

    setProgress(data?.progress ?? 0);
    setThreshold(data?.t ?? 0);
    setKey('');

    if (data?.sealed === false) {
      addNotification({ type: 'success', title: 'OpenBao Unsealed' });
      navigate({ to: '/login' });
    }

    setIsSubmitting(false);
  };

  const handleReset = async () => {
    const { error: apiError } = await unseal({ client, body: { reset: true }, throwOnError: false });

    if (apiError) {
      const message = getErrorMessage(apiError);
      addNotification({ type: 'error', title: 'Reset Failed', message });
      return;
    }

    setProgress(0);
    addNotification({ type: 'info', title: 'Progress Reset' });
  };

  const progressPercent = threshold > 0 ? (progress / threshold) * 100 : 0;

  return (
    <div className="unseal-page">
      <div className="unseal-container">
        <Card className="unseal-card" variant="bordered">
          <CardHeader>
            <CardTitle>
              <Lock size={20} />
              OpenBao is sealed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Unseal OpenBao by entering portions of the unseal key. Once all portions are entered, the root key will be decrypted and OpenBao will unseal.
            </CardDescription>

            <form onSubmit={handleSubmit} className="unseal-form">
              <Input
                id="unseal-key"
                type="password"
                label="Unseal Key Portion"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter unseal key"
                disabled={isSubmitting}
                fullWidth
              />

              {threshold > 0 && (
                <div className="unseal-progress">
                  <div className="unseal-progress__bar">
                    <div
                      className="unseal-progress__fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="unseal-progress__text">
                    {progress} / {threshold} keys provided
                  </span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={!key.trim()}
                fullWidth
              >
                <Unlock size={16} />
                Unseal
              </Button>

              {progress > 0 && (
                <Button type="button" variant="ghost" onClick={handleReset} fullWidth>
                  Reset Progress
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="unseal-footer">
          Need help?{' '}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            Seal/unseal documentation
          </a>
        </div>
      </div>
    </div>
  );
}
