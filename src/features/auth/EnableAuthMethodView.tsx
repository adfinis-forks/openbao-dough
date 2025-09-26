import { Button } from '@common/Button';
import { Card, CardContent } from '@common/Card';
import {
  ChevronDown,
  FileText,
  Globe,
  Key,
  Server,
  Shield,
  Users,
} from '@common/Icons';
import { Input } from '@common/Input';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import './EnableAuthMethodView.css';

interface AuthMethodOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'generic' | 'infra';
}

const authMethodOptions: AuthMethodOption[] = [
  // Generic methods
  {
    id: 'approle',
    name: 'AppRole',
    description: 'Application role-based authentication',
    icon: <Server size={20} />,
    category: 'generic',
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'JSON Web Token authentication',
    icon: <Users size={20} />,
    category: 'generic',
  },
  {
    id: 'oidc',
    name: 'OIDC',
    description: 'OpenID Connect authentication',
    icon: <Users size={20} />,
    category: 'generic',
  },
  {
    id: 'tls',
    name: 'TLS Certificates',
    description: 'TLS certificate-based authentication',
    icon: <FileText size={20} />,
    category: 'generic',
  },
  {
    id: 'userpass',
    name: 'Username & Password',
    description: 'Traditional username and password',
    icon: <Key size={20} />,
    category: 'generic',
  },

  // Infra methods
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: 'Kubernetes service account authentication',
    icon: <Globe size={20} />,
    category: 'infra',
  },
  {
    id: 'ldap',
    name: 'LDAP',
    description: 'LDAP directory authentication',
    icon: <Users size={20} />,
    category: 'infra',
  },
  {
    id: 'radius',
    name: 'RADIUS',
    description: 'RADIUS server authentication',
    icon: <Shield size={20} />,
    category: 'infra',
  },
];

export const EnableAuthMethodView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [methodEnabled, setMethodEnabled] = useState<boolean>(false);
  const [path, setPath] = useState<string>('');

  const handleBack = () => {
    navigate({ to: '/auth' });
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(selectedMethod === methodId ? '' : methodId);
  };

  const handleEnableMethod = () => {
    setMethodEnabled(true);
    setPath(selectedMethod); // Set default path to the selected method ID
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPath(e.target.value);
  };

  return (
    <div className="enable-auth-method-view">
      <div className="enable-auth-method-view__header">
        <Button
          variant="secondary"
          icon={<ChevronDown size={16} />}
          onClick={handleBack}
          className="back-button"
        >
          Back to Auth Methods
        </Button>
        <div>
          <h1 className="enable-auth-method-view__title">
            Enable an Authentication Method
          </h1>
          <p className="enable-auth-method-view__subtitle">
            Configure a new authentication method for your vault
          </p>
        </div>
      </div>

      <div className="enable-auth-method-view__content">
        {!methodEnabled ? (
          <>
            <div className="auth-methods-sections">
              {/* Generic Section */}
              <div className="auth-methods-section">
                <h2 className="enable-auth-method-section-title">Generic</h2>
                <div className="auth-methods-grid">
                  {authMethodOptions
                    .filter((method) => method.category === 'generic')
                    .map((method) => (
                      <Card
                        key={method.id}
                        variant="bordered"
                        className={`auth-method-option ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => handleMethodSelect(method.id)}
                      >
                        <CardContent className="auth-method-option__content">
                          <div className="auth-method-option__icon">
                            {method.icon}
                          </div>
                          <div className="auth-method-option__text">
                            <div className="auth-method-option__name">
                              {method.name}
                            </div>
                            <div className="auth-method-option__description">
                              {method.description}
                            </div>
                          </div>
                          <div className="auth-method-option__radio">
                            <input
                              type="radio"
                              name="auth-method"
                              value={method.id}
                              checked={selectedMethod === method.id}
                              onChange={() => handleMethodSelect(method.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Infra Section */}
              <div className="auth-methods-section">
                <h2 className="enable-auth-method-section-title">Infra</h2>
                <div className="auth-methods-grid">
                  {authMethodOptions
                    .filter((method) => method.category === 'infra')
                    .map((method) => (
                      <Card
                        key={method.id}
                        variant="bordered"
                        className={`auth-method-option ${selectedMethod === method.id ? 'selected' : ''}`}
                        onClick={() => handleMethodSelect(method.id)}
                      >
                        <CardContent className="auth-method-option__content">
                          <div className="auth-method-option__icon">
                            {method.icon}
                          </div>
                          <div className="auth-method-option__text">
                            <div className="auth-method-option__name">
                              {method.name}
                            </div>
                            <div className="auth-method-option__description">
                              {method.description}
                            </div>
                          </div>
                          <div className="auth-method-option__radio">
                            <input
                              type="radio"
                              name="auth-method"
                              value={method.id}
                              checked={selectedMethod === method.id}
                              onChange={() => handleMethodSelect(method.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>

            {selectedMethod && (
              <div className="enable-auth-method-view__actions">
                <Button variant="primary" onClick={handleEnableMethod}>
                  Enable Selected Method
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="method-enabled-state">
            <div className="path-configuration">
              <div className="path-form">
                <h3>Path</h3>
                <Input
                  value={path}
                  onChange={handlePathChange}
                  placeholder="Enter path for the authentication method"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
