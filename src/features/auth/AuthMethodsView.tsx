import type React from 'react';
import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Lock, Plus, Unlock } from '../../shared/ui/Icons';
import { AuthMethodCard } from './AuthMethodCard';
import { useNavigate } from '@tanstack/react-router';
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
  const navigate = useNavigate();

  const toggleAuthMethod = (id: string) => {
    setAuthMethods((methods) =>
      methods.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method,
      ),
    );
  };

  const enabledMethods = authMethods.filter((method) => method.enabled);
  const disabledMethods = authMethods.filter((method) => !method.enabled);

  return (
    <div className="auth-methods-view">
      <div className="auth-methods-view__header">
        <div>
          <h1 className="auth-methods-view__title">Authentication Methods</h1>
          <p className="auth-methods-view__subtitle">
            Configure and manage authentication methods for your vault
          </p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={16} />}
          onClick={() => navigate({ to: '/enable-auth-method' })}
        >
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
                  <AuthMethodCard
                    key={method.id}
                    method={method}
                    onToggle={toggleAuthMethod}
                  />
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
                  <AuthMethodCard
                    key={method.id}
                    method={method}
                    onToggle={toggleAuthMethod}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
