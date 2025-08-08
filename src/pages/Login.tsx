import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import OpenBaoLogo from '../../public/openbao.svg';
import {
  type AuthMethodType,
  KNOWN_AUTH_METHODS,
} from '../features/auth/authMethods';
import { useEnabledAuthMethods } from '../features/auth/useEnabledAuthMethods';
import { Button } from '../shared/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../shared/ui/Card';
import { Eye, EyeOff } from '../shared/ui/Icons';
import { Input } from '../shared/ui/Input';
import { Select } from '../shared/ui/Select';
import './Login.css';

export interface LoginProps {
  onLogin: () => void;
}

interface FormData {
  username?: string;
  password?: string;
  token?: string;
  ldapUsername?: string;
  ldapPassword?: string;
  roleId?: string;
  secretId?: string;
  jwt?: string;
  pkcs7?: string;
}

const initialFormData: FormData = {};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { options, loading } = useEnabledAuthMethods();
  const [selected, setSelected] = useState<string | undefined>(
    () => localStorage.getItem('login.selectedAuth') || undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Always-visible namespace (top of form)
  const [namespace, setNamespace] = useState<string>(
    localStorage.getItem('login.namespace') || '/',
  );

  // More options
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [mountPath, setMountPath] = useState<string>('');

  // Default to first available option
  useEffect(() => {
    if (!selected && options.length > 0 && !loading) {
      setSelected(options[0].value);
    }
  }, [options, loading, selected]);

  const selectedMeta = useMemo(() => {
    if (!selected) return null;
    const [type, path] = selected.split(':');
    const opt = options.find((o) => o.value === selected);
    const meta = KNOWN_AUTH_METHODS[type as AuthMethodType];
    return {
      type: type as AuthMethodType,
      path,
      label: opt?.label ?? meta?.label,
      description: opt?.description ?? meta?.description,
      meta,
    };
  }, [selected, options]);

  // Update default mount path based on discovered path or fallback to the type
  useEffect(() => {
    if (!selectedMeta) return;
    const needsMount = selectedMeta.type !== 'token';
    if (needsMount) {
      const discovered = (selectedMeta.path || '').replace(/\/$/, '');
      const defaultMount = discovered || selectedMeta.type;
      setMountPath(defaultMount);
    } else {
      setMountPath('');
    }
  }, [selectedMeta?.type, selectedMeta?.path]);

  const needsMountPath = !!selectedMeta && selectedMeta.type !== 'token';
  const showSSOInfo = !!selectedMeta?.meta?.external;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you’d call your OpenBao login endpoint according to selectedMeta.type and mountPath.
    // Examples:
    // - userpass:  POST /v1/auth/<mountPath>/login/<username>
    // - token:     Header X-Vault-Token: <token>
    // - ldap:      POST /v1/auth/<mountPath>/login/<ldapUsername>
    // - jwt:       POST /v1/auth/<mountPath>/login  (body: { jwt })
    // - oidc:      Redirect via /v1/auth/<mountPath>/oidc/auth_url
    // - approle:   POST /v1/auth/<mountPath>/login  (body: { role_id, secret_id })
    //
    // Namespace header:
    // - If namespace !== '/' include header: X-Vault-Namespace: <namespace>
    // - If namespace === '/', omit the header.
    //
    // This demo just persists selection and continues:
    localStorage.setItem('login.selectedAuth', selected || '');
    localStorage.setItem('login.namespace', namespace || '/');
    onLogin();
  };

  const fields = useMemo(() => {
    if (!selectedMeta?.meta) return [];
    return selectedMeta.meta.fields || [];
  }, [selectedMeta]);

  const passwordFieldToggleIcon = (
    <Button
      type="button"
      variant="ghost"
      size="small"
      onClick={() => setShowPassword((s) => !s)}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );

  return (
    <div className="login-page">
      <div className="login-page__gradient" />
      <div className="login-page__container">
        <div className="login-page__header">
          <div className="login-page__logo">
            <img
              src={OpenBaoLogo}
              alt="OpenBao Logo"
              className="login-page__logo-img"
            />
            <span className="login-page__logo-text">OpenBao</span>
          </div>
          <p className="login-page__subtitle">
            Secure secrets management platform
          </p>
        </div>

        <Card className="login-card">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your vault securely</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form__content">
                {/* Namespace (always visible, at the very top) */}
                <div className="login-namespace">
                  <div className="login-namespace__label">Namespace</div>
                  <Input
                    label=""
                    name="namespace"
                    type="text"
                    placeholder="/ (Root)"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    fullWidth
                  />
                  <div className="login-namespace__help">
                    You are signing into this namespace. Leave “/” for root.
                  </div>
                </div>

                {/* Auth method selector */}
                <div className="login-select-row">
                  <Select
                    options={options}
                    value={selected}
                    onChange={(val) => setSelected(val)}
                    searchable={false}
                    fullWidth
                    placeholder={
                      loading ? 'Loading auth methods...' : 'Select auth method'
                    }
                    ariaLabel="Authentication method"
                  />
                </div>

                {selectedMeta?.description && (
                  <p className="login-help">{selectedMeta.description}</p>
                )}

                {/* Dynamic fields per auth method */}
                {fields.map((f) => {
                  const isPassword = f.type === 'password';
                  const name = f.name as keyof FormData;
                  const value = (formData[name] as string) || '';
                  const inputType = isPassword
                    ? showPassword
                      ? 'text'
                      : 'password'
                    : 'text';

                  const icon =
                    isPassword &&
                    (f.name === 'password' || f.name === 'ldapPassword')
                      ? passwordFieldToggleIcon
                      : undefined;

                  return (
                    <div
                      key={f.name}
                      className={isPassword ? 'auth-form__password-field' : ''}
                    >
                      <Input
                        label={f.label}
                        name={f.name}
                        type={inputType}
                        placeholder={f.placeholder}
                        value={value}
                        onChange={handleInputChange}
                        fullWidth
                        icon={icon}
                        iconPosition={icon ? 'right' : 'left'}
                      />
                    </div>
                  );
                })}

                {/* More options placed under input fields, above submit */}
                <div className="login-more-toggle">
                  <button
                    type="button"
                    className="login-more-toggle__btn"
                    onClick={() => setMoreOpen((v) => !v)}
                    aria-expanded={moreOpen}
                  >
                    {moreOpen ? 'Hide options' : 'More options'}
                  </button>
                </div>

                {moreOpen && (
                  <div className="login-more">
                    {needsMountPath && (
                      <div className="login-more__row">
                        <Input
                          label="Mount path"
                          name="mountPath"
                          type="text"
                          placeholder={selectedMeta?.type || 'userpass'}
                          value={mountPath}
                          onChange={(e) => setMountPath(e.target.value)}
                          title="If this backend was mounted using a non-default path, enter it here."
                          fullWidth
                        />
                        <p className="login-help">
                          Tip: if this backend was mounted using a non-default
                          path, enter it here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* External SSO-style flows: show a continue note */}
                {showSSOInfo && (
                  <div className="login-sso-info">
                    You will be redirected to complete authentication.
                  </div>
                )}
              </div>

              <Button type="submit" variant="overlay" size="large" fullWidth>
                {showSSOInfo ? 'Continue' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
