import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import OpenBaoLogo from '../../public/openbao.svg?react';
import {
  type AuthMethodType,
  KNOWN_AUTH_METHODS,
} from '../features/auth/authMethods';
import { useEnabledAuthMethods } from '../features/auth/useEnabledAuthMethods';
import { useAuthenticate } from '../shared/api/auth-hooks';
import { useAuthStore } from '../shared/stores/authStore';
import { BAO_ADDR } from '../shared/config';
import { Button } from '../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/Card';
import { Eye, EyeOff, ChevronDown, ChevronUp, Globe } from '../shared/ui/Icons';
import { Input } from '../shared/ui/Input';
import { Select } from '../shared/ui/Select';
import './Login.css';

export interface LoginProps {
  onLogin: () => void;
}

interface FormData {
  [key: string]: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { options, loading } = useEnabledAuthMethods();
  const { setToken } = useAuthStore();
  const [selected, setSelected] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [namespace, setNamespace] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mountPath, setMountPath] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const authenticateMutation = useAuthenticate();

  // Use BAO_ADDR from shared config (already includes /v1)
  const baseUrl = BAO_ADDR;

  // Load saved preferences
  useEffect(() => {
    const savedAuth = localStorage.getItem('openbao.lastAuth');
    const savedNamespace = localStorage.getItem('openbao.lastNamespace');

    if (savedAuth) setSelected(savedAuth);
    if (savedNamespace) setNamespace(savedNamespace);
  }, []);

  // Set default auth method when loaded
  useEffect(() => {
    if (!selected && options.length > 0 && !loading) {
      setSelected(options[0].value);
    }
  }, [options, loading, selected]);

  const selectedMeta = useMemo(() => {
    if (!selected) return null;
    const [type, path] = selected.split(':');
    const option = options.find((o) => o.value === selected);
    const meta = KNOWN_AUTH_METHODS[type as AuthMethodType];

    return {
      type: type as AuthMethodType,
      path,
      label: option?.label || meta?.label,
      description: option?.description || meta?.description,
      meta,
      isExternal: meta?.external || false,
    };
  }, [selected, options]);

  // Update mount path when auth method changes
  useEffect(() => {
    if (!selectedMeta) return;

    if (selectedMeta.type !== 'token') {
      const discoveredPath = (selectedMeta.path || '').replace(/\/$/, '');
      setMountPath(discoveredPath || selectedMeta.type);
    } else {
      setMountPath('');
    }
  }, [selectedMeta]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!selectedMeta) return;

    try {
      // Save preferences
      localStorage.setItem('openbao.lastAuth', selected);
      localStorage.setItem('openbao.lastNamespace', namespace || '/');

      // Debug logging
      console.log('Authentication attempt:', {
        baseUrl,
        authMethod: selectedMeta.type,
        credentials: formData,
        namespace: namespace || undefined,
        mountPath: mountPath || undefined,
      });

      const result = await authenticateMutation.mutateAsync({
        baseUrl,
        authMethod: selectedMeta.type,
        credentials: formData,
        namespace: namespace || undefined,
        mountPath: mountPath || undefined,
      });

      if (result.token) {
        // Store token securely in Zustand store
        setToken({
          token: result.token,
          accessor: result.accessor || '',
          ttl: result.lease_duration || 3600,
          renewable: result.renewable || false,
          policies: result.policies || [],
          metadata: result.metadata,
        });

        onLogin();
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Authentication failed',
      );
    }
  };

  const fields = useMemo(() => {
    if (!selectedMeta?.meta) return [];
    return selectedMeta.meta.fields || [];
  }, [selectedMeta]);

  const isFormValid = useMemo(() => {
    if (!selectedMeta) return false;
    if (selectedMeta.isExternal) return true;

    return fields.every((field) => {
      const value = formData[field.name];
      return value && value.trim().length > 0;
    });
  }, [selectedMeta, fields, formData]);

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-background__gradient" />
        <div className="login-background__pattern" />
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <OpenBaoLogo
              aria-label="OpenBao logo"
              className="login-logo__img"
            />
            <span className="login-logo__text">OpenBao</span>
          </div>
          <p className="login-subtitle">Secure secrets management platform</p>
        </div>

        <Card className="login-card">
          <CardHeader>
            <CardTitle>Sign in to your vault</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="login-form">
              {/* Namespace Field - Improved Design */}
              <div className="namespace-field">
                <div className="namespace-field__header">
                  <Globe size={16} className="namespace-field__icon" />
                  <span className="namespace-field__label">Namespace</span>
                  <span className="namespace-field__badge">Optional</span>
                </div>
                <Input
                  name="namespace"
                  type="text"
                  placeholder="/ (root namespace)"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  fullWidth
                  className="namespace-field__input"
                />
                <p className="namespace-field__help">
                  Leave empty to use the root namespace
                </p>
              </div>

              {/* Auth Method Selector */}
              <div className="auth-method-field">
                <label className="field-label">Authentication Method</label>
                <Select
                  options={options}
                  value={selected}
                  onChange={setSelected}
                  placeholder={loading ? 'Loading...' : 'Select method'}
                  fullWidth
                  searchable={false}
                  ariaLabel="Authentication method"
                />
                {selectedMeta?.description && (
                  <p className="field-help">{selectedMeta.description}</p>
                )}
              </div>

              {/* Dynamic Fields */}
              {fields.map((field) => {
                const isPasswordField = field.type === 'password';
                const value = formData[field.name] || '';

                return (
                  <div key={field.name} className="form-field">
                    <label className="field-label">{field.label}</label>
                    <div className="field-input-wrapper">
                      <Input
                        name={field.name}
                        type={
                          isPasswordField && !showPassword ? 'password' : 'text'
                        }
                        placeholder={field.placeholder}
                        value={value}
                        onChange={handleInputChange}
                        fullWidth
                        required
                      />
                      {isPasswordField && (
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* External Auth Info */}
              {selectedMeta?.isExternal && (
                <div className="external-auth-info">
                  <span className="external-auth-info__icon">🔗</span>
                  <span>You'll be redirected to complete authentication</span>
                </div>
              )}

              {/* Advanced Options */}
              {selectedMeta && selectedMeta.type !== 'token' && (
                <div className="advanced-options">
                  <button
                    type="button"
                    className="advanced-options__toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    aria-expanded={showAdvanced}
                  >
                    <span>Advanced options</span>
                    {showAdvanced ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="advanced-options__content">
                      <div className="form-field">
                        <label className="field-label">Mount Path</label>
                        <Input
                          name="mountPath"
                          type="text"
                          placeholder={selectedMeta.type}
                          value={mountPath}
                          onChange={(e) => setMountPath(e.target.value)}
                          fullWidth
                        />
                        <p className="field-help">
                          Custom mount path if not using default
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Authentication Error */}
              {authError && (
                <div
                  className="auth-error"
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--color-danger-50)',
                    border: '1px solid var(--color-danger-200)',
                    borderRadius: '6px',
                    color: 'var(--color-danger-700)',
                    fontSize: '14px',
                    marginBottom: '16px',
                  }}
                >
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                disabled={!isFormValid || authenticateMutation.isPending}
                className="login-submit"
              >
                {authenticateMutation.isPending
                  ? 'Signing in...'
                  : selectedMeta?.isExternal
                    ? 'Continue with Provider'
                    : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="login-footer">
          <p>
            Need help?{' '}
            <a href="#" className="login-link">
              View documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
