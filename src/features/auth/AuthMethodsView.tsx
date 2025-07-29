import type React from 'react';
import { useState } from 'react';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Dropdown, DropdownMenuItem } from '../../shared/ui/Dropdown';
import { Lock, MoreHorizontal, Plus, Unlock } from '../../shared/ui/Icons';
import './AuthMethodsView.css';

interface AuthMethod {
  id: string;
  type: string;
  path: string;
  description: string;
  enabled: boolean;
  users: number;
  config: Record<string, unknown>;
}

const mockAuthMethods: AuthMethod[] = [
  {
    id: '1',
    type: 'userpass',
    path: 'userpass/',
    description: 'Username and password authentication',
    enabled: true,
    users: 12,
    config: { default_lease_ttl: '1h', max_lease_ttl: '24h' },
  },
  {
    id: '2',
    type: 'ldap',
    path: 'ldap/',
    description: 'LDAP directory authentication',
    enabled: true,
    users: 45,
    config: { url: 'ldap://ldap.company.com', base_dn: 'dc=company,dc=com' },
  },
  {
    id: '3',
    type: 'jwt',
    path: 'jwt/',
    description: 'JSON Web Token authentication',
    enabled: true,
    users: 8,
    config: { bound_audiences: ['vault'], default_role: 'default' },
  },
  {
    id: '4',
    type: 'kubernetes',
    path: 'kubernetes/',
    description: 'Kubernetes service account authentication',
    enabled: false,
    users: 0,
    config: { kubernetes_host: 'https://kubernetes.default.svc' },
  },
  {
    id: '5',
    type: 'aws',
    path: 'aws/',
    description: 'AWS IAM authentication',
    enabled: true,
    users: 23,
    config: { region: 'us-east-1', iam_endpoint: 'https://iam.amazonaws.com' },
  },
  {
    id: '6',
    type: 'github',
    path: 'github/',
    description: 'GitHub authentication',
    enabled: false,
    users: 0,
    config: { organization: 'company-org' },
  },
];

export const AuthMethodsView: React.FC = () => {
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>(mockAuthMethods);

  const toggleAuthMethod = (id: string) => {
    setAuthMethods((methods) =>
      methods.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method,
      ),
    );
  };

  const enabledMethods = authMethods.filter((method) => method.enabled);
  const disabledMethods = authMethods.filter((method) => !method.enabled);

  const getAuthMethodIcon = (type: string) => {
    switch (type) {
      case 'userpass':
      case 'ldap':
        return () => (
          <img src="/people-outline.svg" alt="Users" width={24} height={24} />
        );
      case 'jwt':
      case 'github':
        return Lock;
      default:
        return () => (
          <img
            src="/settings-outline.svg"
            alt="Settings"
            width={24}
            height={24}
          />
        );
    }
  };

  const AuthMethodCard: React.FC<{ method: AuthMethod }> = ({ method }) => {
    const Icon = getAuthMethodIcon(method.type);

    return (
      <Card
        className={`auth-method-card ${!method.enabled ? 'auth-method-card--disabled' : ''}`}
      >
        <CardContent>
          <div className="auth-method-card__content">
            <div className="auth-method-card__header">
              <div
                className={`auth-method-card__icon ${method.enabled ? 'auth-method-card__icon--enabled' : 'auth-method-card__icon--disabled'}`}
              >
                <Icon size={24} />
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
                variant={method.enabled ? 'outline' : 'primary'}
                size="small"
                onClick={() => toggleAuthMethod(method.id)}
                icon={
                  method.enabled ? <Lock size={16} /> : <Unlock size={16} />
                }
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

  return (
    <div className="auth-methods-view">
      <div className="auth-methods-view__header">
        <div>
          <h1 className="auth-methods-view__title">Authentication Methods</h1>
          <p className="auth-methods-view__subtitle">
            Configure and manage authentication methods for your vault
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          Enable Auth Method
        </Button>
      </div>

      <div className="auth-methods-view__stats">
        <Card className="auth-stats-card">
          <CardContent>
            <div className="auth-stats">
              <div className="auth-stat">
                <span className="auth-stat__value">
                  {enabledMethods.length}
                </span>
                <span className="auth-stat__label">Enabled</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat__value">
                  {enabledMethods.reduce(
                    (sum, method) => sum + method.users,
                    0,
                  )}
                </span>
                <span className="auth-stat__label">Total Users</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat__value">
                  {disabledMethods.length}
                </span>
                <span className="auth-stat__label">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {enabledMethods.length > 0 && (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardHeader>
              <CardTitle className="section-title">
                <Unlock size={20} className="section-icon" />
                Enabled Methods ({enabledMethods.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="auth-methods-grid">
                {enabledMethods.map((method) => (
                  <AuthMethodCard key={method.id} method={method} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {disabledMethods.length > 0 && (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardHeader>
              <CardTitle className="section-title">
                <Lock size={20} className="section-icon" />
                Disabled Methods ({disabledMethods.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="auth-methods-grid">
                {disabledMethods.map((method) => (
                  <AuthMethodCard key={method.id} method={method} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
