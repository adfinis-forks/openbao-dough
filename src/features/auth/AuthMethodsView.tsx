import { Button } from '@common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@common/Card';
import { Plus, Unlock } from '@common/Icons';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useMemo } from 'react';
import { useEnabledAuthMethods } from './useEnabledAuthMethods';
import { AuthMethodCard } from './AuthMethodCard';
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

export const AuthMethodsView: React.FC = () => {
  const navigate = useNavigate();
  const { enabled, loading, error } = useEnabledAuthMethods();

  // Map enabled auth methods from API to AuthMethod interface
  const authMethods = useMemo<AuthMethod[]>(() => {
    return enabled.map((method, index) => ({
      id: `${method.type}-${method.path}-${index}`,
      type: method.type,
      path: method.path.endsWith('/') ? method.path : `${method.path}/`,
      description: method.description || `${method.type} authentication`,
      enabled: true, // All methods from API are enabled
      users: 0, // User count would require additional API calls per method
      config: {},
    }));
  }, [enabled]);

  const toggleAuthMethod = (id: string) => {
    // TODO: Implement disable functionality when needed
    console.log('Toggle auth method:', id);
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
                  {loading ? '...' : authMethods.length}
                </span>
                <span className="auth-stat__label">Enabled</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat__value">
                  {loading
                    ? '...'
                    : authMethods.reduce((sum, method) => sum + method.users, 0)}
                </span>
                <span className="auth-stat__label">Total Users</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardContent>
              <div className="auth-methods-loading">
                <p>Loading authentication methods...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardContent>
              <div className="auth-methods-error">
                <p className="auth-methods-error__message">
                  Error loading authentication methods
                </p>
                <p className="auth-methods-error__description">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : authMethods.length === 0 ? (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardContent>
              <div className="auth-methods-empty">
                <p className="auth-methods-empty__message">
                  No authentication methods enabled
                </p>
                <p className="auth-methods-empty__description">
                  Enable your first authentication method to get started.
                </p>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => navigate({ to: '/enable-auth-method' })}
                >
                  Enable Auth Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="auth-methods-section">
          <Card className="auth-methods-section-card">
            <CardHeader>
              <CardTitle className="auth-methods-section-title">
                <Unlock size={20} className="section-icon" />
                Enabled Methods ({authMethods.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="auth-methods-grid">
                {authMethods.map((method) => (
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
