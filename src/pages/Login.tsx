import { Button } from '@common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@common/Card';
import { ChevronDown, ChevronUp, Eye, EyeOff } from '@common/Icons';
import { Input } from '@common/Input';
import { Select } from '@common/Select';
import FileTrayStackedOutlineIcon from '@public/file-tray-stacked-outline.svg?react';
import OpenBaoLogo from '@public/openbao.svg?react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { AuthMethodType } from '../features/auth/authMethods';
import { SUPPORTED_AUTH_BACKENDS } from '../features/auth/authMethods';
import { useNotifications } from '../shared/components/common/Notification';
import { ThemeToggle } from '../shared/components/theme/ThemeToggle';
import { useAuthenticate } from '../shared/hooks/useAuthMethods';
import './Login.css';

interface FormData {
  [key: string]: string;
}

export function Login() {
  // Get URL search params first
  const search = useSearch({ from: '/login' });
  const navigate = useNavigate();

  const authMethodFromUrl = search.with as AuthMethodType | undefined;

  const [selected, setSelected] = useState<AuthMethodType>('token');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize namespace from URL or fallback to last-used from localStorage
  const [namespaceInput, setNamespaceInput] = useState(
    search.namespace || localStorage.getItem('openbao.lastNamespace') || '',
  );

  const { addNotification } = useNotifications();
  const authenticateMutation = useAuthenticate();

  // Set auth method from URL parameter or localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem(
      'openbao.lastAuth',
    ) as AuthMethodType | null;
    const initialAuth = authMethodFromUrl || savedAuth || 'token';

    if (SUPPORTED_AUTH_BACKENDS.some((b) => b.type === initialAuth)) {
      setSelected(initialAuth);
    }
  }, [authMethodFromUrl]);

  // Update mount path when auth method changes
  const mountPath = selected !== 'token' ? selected : '';

  const selectedAuthMethod = useMemo(
    () =>
      SUPPORTED_AUTH_BACKENDS.find((b) => b.type === selected) ||
      SUPPORTED_AUTH_BACKENDS[0],
    [selected],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = namespaceInput.trim().replace(/^\/+|\/+$/g, '');

      // Save last used namespace
      if (normalized) {
        localStorage.setItem('openbao.lastNamespace', normalized);
      } else {
        localStorage.removeItem('openbao.lastNamespace');
      }

      // Update URL if changed
      if (normalized !== search.namespace) {
        navigate({
          to: '/login',
          search: (prev) => ({
            ...prev,
            namespace: normalized || undefined,
          }),
          replace: true,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [namespaceInput, search.namespace, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize namespace from input field - if empty, use root namespace (undefined)
    const normalized = namespaceInput.trim().replace(/^\/+|\/+$/g, '');
    const namespace = normalized || undefined;

    try {
      // Save last used auth method
      localStorage.setItem('openbao.lastAuth', selected);

      await authenticateMutation.mutateAsync({
        method: selected,
        credentials: formData,
        namespace,
        mountPath: mountPath || undefined,
      });

      addNotification({
        type: 'success',
        title: 'Authentication successful',
        message: 'You have been successfully signed in',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Authentication failed',
        message:
          error instanceof Error
            ? error.message
            : 'Please check your credentials and try again',
      });
    }
  };

  const fields = selectedAuthMethod.fields || [];

  const isFormValid = useMemo(() => {
    if (selectedAuthMethod.external) return true;

    return fields.every((field) => {
      const value = formData[field.name];
      return value && value.trim().length > 0;
    });
  }, [selectedAuthMethod, fields, formData]);

  return (
    <div className="login-page">
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
                  <FileTrayStackedOutlineIcon
                    width="16"
                    height="16"
                    className="namespace-field__icon"
                  />
                  <span className="namespace-field__label">Namespace</span>
                  <span className="namespace-field__badge">Optional</span>
                </div>
                <Input
                  name="namespace"
                  type="text"
                  placeholder="/ (root namespace)"
                  value={namespaceInput}
                  onChange={(e) => setNamespaceInput(e.target.value)}
                  fullWidth
                  className="namespace-field__input"
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="namespace-field__help">
                  Leave empty to use the root namespace
                </p>
              </div>

              {/* Auth Method Selector */}
              <div className="auth-method-field">
                <label className="field-label">Authentication Method</label>
                <Select
                  options={SUPPORTED_AUTH_BACKENDS.map((backend) => ({
                    value: backend.type,
                    label: backend.label,
                    description: backend.description,
                    icon: backend.icon,
                  }))}
                  value={selected}
                  onChange={setSelected}
                  placeholder="Select method"
                  fullWidth
                  searchable={false}
                  ariaLabel="Authentication method"
                />
                {selectedAuthMethod.description && (
                  <p className="field-help">{selectedAuthMethod.description}</p>
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
              {selectedAuthMethod.external && (
                <div className="external-auth-info">
                  <span className="external-auth-info__icon">🔗</span>
                  <span>You'll be redirected to complete authentication</span>
                </div>
              )}

              {/* Advanced Options */}
              {selected && selected !== 'token' && (
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
                          placeholder={selected}
                          value={mountPath}
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

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outlined"
                size="large"
                fullWidth
                disabled={!isFormValid || authenticateMutation.isPending}
                className="login-submit"
              >
                {authenticateMutation.isPending
                  ? 'Signing in...'
                  : selectedAuthMethod.external
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
          <div className="login-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
