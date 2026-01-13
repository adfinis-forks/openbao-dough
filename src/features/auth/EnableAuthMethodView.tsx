import { Button } from '@common/Button';
import { Card, CardContent } from '@common/Card';
import { Dropdown } from '@common/Dropdown';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authEnableMethodMutation, authListEnabledMethodsQueryKey } from '@/shared/client/@tanstack/react-query.gen';
import type { AuthEnableMethodRequest } from '@/shared/client/types.gen';
import { useAuthenticatedMutationOptions } from '@/shared/hooks/useAuthenticatedQuery';
import { useNotifications } from '@/shared/components/common/Notification';
import type { AuthMethodOptions } from './Views/EnableAuthMethodOptionsView';
import { EnableAuthMethodOptionsView } from './Views/EnableAuthMethodOptionsView';
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
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [methodEnabled, setMethodEnabled] = useState<boolean>(false);
  const [path, setPath] = useState<string>('');
  const [options, setOptions] = useState<AuthMethodOptions>({});

  const mutationOptions = useAuthenticatedMutationOptions();
  const enableMethodMutation = useMutation({
    ...authEnableMethodMutation(mutationOptions),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Authentication method enabled',
        message: `Successfully enabled ${selectedMethod} at path ${path || selectedMethod}`,
      });
      // Invalidate enabled auth methods query to refresh the list
      // Invalidate all queries that start with the authListEnabledMethods query key
      // This includes namespace-specific queries
      const baseQueryKey = authListEnabledMethodsQueryKey();
      queryClient.invalidateQueries({
        queryKey: baseQueryKey,
        exact: false, // Match all queries that start with this key (including namespace variants)
      });
      // Navigate back to auth methods view
      navigate({ to: '/access' });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Failed to enable authentication method',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while enabling the authentication method',
      });
    },
  });

  const handleBack = () => {
    navigate({ to: '/access' });
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

  const handleSubmit = async () => {
    // Validate path
    const finalPath = path.trim() || selectedMethod;
    if (!finalPath) {
      addNotification({
        type: 'error',
        title: 'Validation error',
        message: 'Path is required',
      });
      return;
    }

    // Build request body
    const requestBody: AuthEnableMethodRequest = {
      type: selectedMethod,
    };

    // Add description if provided
    if (options.description) {
      requestBody.description = options.description;
    }

    // Add local flag
    if (options.local) {
      requestBody.local = true;
    }

    // Add seal_wrap flag
    if (options.sealWrap) {
      requestBody.seal_wrap = true;
    }

    // Build options object for backend-specific options
    const backendOptions: Record<string, unknown> = {};
    
    // Add list_when_unauthenticated if set
    if (options.listWhenUnauthenticated) {
      backendOptions.list_when_unauthenticated = 'true';
    }

    // Add token type if set
    if (options.tokenType) {
      backendOptions.token_type = options.tokenType;
    }

    // Add audit non-HMAC keys if provided
    if (options.auditNonHmacRequestKeys && options.auditNonHmacRequestKeys.length > 0) {
      backendOptions.audit_non_hmac_request_keys = options.auditNonHmacRequestKeys.join(',');
    }

    if (options.auditNonHmacResponseKeys && options.auditNonHmacResponseKeys.length > 0) {
      backendOptions.audit_non_hmac_response_keys = options.auditNonHmacResponseKeys.join(',');
    }

    // Add passthrough request headers if provided
    if (options.passthroughRequestHeaders && options.passthroughRequestHeaders.length > 0) {
      backendOptions.passthrough_request_headers = options.passthroughRequestHeaders.join(',');
    }

    // Add options if any were set
    if (Object.keys(backendOptions).length > 0) {
      requestBody.options = backendOptions;
    }

    // Build config object for TTL settings (these go in config, not options)
    const config: Record<string, unknown> = {};
    
    if (options.defaultLeaseTtl) {
      config.default_lease_ttl = options.defaultLeaseTtl;
    }

    if (options.maxLeaseTtl) {
      config.max_lease_ttl = options.maxLeaseTtl;
    }

    if (Object.keys(config).length > 0) {
      requestBody.config = config;
    }

    try {
      await enableMethodMutation.mutateAsync({
        path: { path: finalPath },
        body: requestBody,
      });
    } catch (error) {
      // Error handling is done in onError callback
      console.error('Failed to enable auth method:', error);
    }
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
            <div className="enable-auth-method-view__actions">
              <Dropdown
                trigger={
                  <Button variant="secondary">
                    Method options
                  </Button>
                }
                align="start"
              >
                <EnableAuthMethodOptionsView onOptionsChange={setOptions} />
              </Dropdown>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={enableMethodMutation.isPending}
              >
                {enableMethodMutation.isPending ? 'Enabling...' : 'Enable Method'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
