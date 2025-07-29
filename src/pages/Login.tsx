import type React from 'react';
import { useState } from 'react';
import OpenBaoLogo from '../../public/openbao.svg';
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
import './Login.css';

export interface LoginProps {
  onLogin: () => void;
}

type AuthMethod = 'userpass' | 'token' | 'ldap';

interface FormData {
  username: string;
  password: string;
  token: string;
  ldapUsername: string;
  ldapPassword: string;
}

const initialFormData: FormData = {
  username: '',
  password: '',
  token: '',
  ldapUsername: '',
  ldapPassword: '',
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<AuthMethod>('userpass');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
          {/* Remove duplicate OpenBao title, now in logo */}
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
            <div className="auth-tabs">
              <div className="auth-tabs__list">
                <button
                  type="button"
                  className={`auth-tabs__trigger ${activeTab === 'userpass' ? 'auth-tabs__trigger--active' : ''}`}
                  onClick={() => setActiveTab('userpass')}
                >
                  Username
                </button>
                <button
                  type="button"
                  className={`auth-tabs__trigger ${activeTab === 'token' ? 'auth-tabs__trigger--active' : ''}`}
                  onClick={() => setActiveTab('token')}
                >
                  Token
                </button>
                <button
                  type="button"
                  className={`auth-tabs__trigger ${activeTab === 'ldap' ? 'auth-tabs__trigger--active' : ''}`}
                  onClick={() => setActiveTab('ldap')}
                >
                  LDAP
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {activeTab === 'userpass' && (
                  <div className="auth-form__content">
                    <Input
                      label="Username"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <div className="auth-form__password-field">
                      <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        icon={
                          <Button
                            type="button"
                            variant="ghost"
                            size="small"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        }
                        iconPosition="right"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'token' && (
                  <div className="auth-form__content">
                    <Input
                      label="Token"
                      name="token"
                      placeholder="Enter your token"
                      value={formData.token}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </div>
                )}

                {activeTab === 'ldap' && (
                  <div className="auth-form__content">
                    <Input
                      label="LDAP Username"
                      name="ldapUsername"
                      placeholder="Enter LDAP username"
                      value={formData.ldapUsername}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <Input
                      label="Password"
                      name="ldapPassword"
                      type="password"
                      placeholder="Enter password"
                      value={formData.ldapPassword}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </div>
                )}

                <Button type="submit" variant="overlay" size="large" fullWidth>
                  Sign In
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// src/features/auth/types.ts
export interface AuthUser {
  username: string;
  token: string;
  policies: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
