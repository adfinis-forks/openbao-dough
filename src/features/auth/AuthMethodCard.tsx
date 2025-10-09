import { Badge } from '@common/Badge';
import { Button } from '@common/Button';
import { Card, CardContent } from '@common/Card';
import { Dropdown, DropdownMenuItem } from '@common/Dropdown';
import { Lock, MoreHorizontal, Unlock } from '@common/Icons';
import type React from 'react';
import { SUPPORTED_AUTH_BACKENDS } from './authMethods';

interface AuthMethod {
  id: string;
  type: string;
  path: string;
  description: string;
  enabled: boolean;
  users: number;
  config: Record<string, unknown>;
}

interface AuthMethodCardProps {
  method: AuthMethod;
  onToggle: (id: string) => void;
}

export const AuthMethodCard: React.FC<AuthMethodCardProps> = ({
  method,
  onToggle,
}) => {
  const authMeta = SUPPORTED_AUTH_BACKENDS.find((b) => b.type === method.type);
  const icon = authMeta?.icon || '🔐';

  return (
    <Card
      variant="elevated"
      className={`auth-method-card ${!method.enabled ? 'auth-method-card--disabled' : ''}`}
    >
      <CardContent>
        <div className="auth-method-card__content">
          <div className="auth-method-card__header">
            <div
              className={`auth-method-card__icon ${method.enabled ? 'auth-method-card__icon--enabled' : 'auth-method-card__icon--disabled'}`}
            >
              <span style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            <div className="auth-method-card__info">
              <div className="auth-method-card__title-row">
                <h3 className="auth-method-card__name">{method.type}</h3>
                <Badge variant={method.enabled ? 'success' : 'default'}>
                  {method.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="auth-method-card__description">
                {method.description}
              </p>
              <p className="auth-method-card__path">Path: {method.path}</p>
              {method.enabled && method.users > 0 && (
                <p className="auth-method-card__users">
                  {method.users} active users
                </p>
              )}
            </div>
          </div>

          <div className="auth-method-card__actions">
            <Button
              variant={method.enabled ? 'secondary' : 'primary'}
              size="small"
              onClick={() => onToggle(method.id)}
              icon={method.enabled ? <Lock size={16} /> : <Unlock size={16} />}
            >
              {method.enabled ? 'Disable' : 'Enable'}
            </Button>

            <Dropdown
              trigger={
                <Button variant="ghost" size="small">
                  <MoreHorizontal size={16} />
                </Button>
              }
              align="end"
            >
              <DropdownMenuItem>
                <img
                  src="/settings-outline.svg"
                  alt="Settings"
                  width={16}
                  height={16}
                />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem>
                <img
                  src="/people-outline.svg"
                  alt="Users"
                  width={16}
                  height={16}
                />
                Manage Users
              </DropdownMenuItem>
              {method.enabled ? (
                <DropdownMenuItem danger>
                  <Lock size={16} />
                  Disable
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Unlock size={16} />
                  Enable
                </DropdownMenuItem>
              )}
            </Dropdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
