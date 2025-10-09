export type AuthMethodType =
  | 'token'
  | 'userpass'
  | 'ldap'
  | 'oidc'
  | 'jwt'
  | 'approle'
  | 'kubernetes'
  | 'github'
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'cert'
  | 'radius';

export interface AuthField {
  name: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
}

export interface AuthMethod {
  type: AuthMethodType;
  label: string;
  description: string;
  icon?: string;
  formAttributes: string[];
  fields?: AuthField[];
  external?: boolean;
}

// Supported authentication backends for login
export const SUPPORTED_AUTH_BACKENDS: AuthMethod[] = [
  {
    type: 'token',
    label: 'Token',
    description: 'Token authentication.',
    icon: '🔑',
    formAttributes: ['token'],
    fields: [
      { name: 'token', label: 'Token', type: 'password', placeholder: 's.token' },
    ],
  },
  {
    type: 'userpass',
    label: 'Username',
    description: 'A simple username and password backend.',
    icon: '👤',
    formAttributes: ['username', 'password'],
    fields: [
      { name: 'username', label: 'Username', type: 'text', placeholder: 'jane.doe' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    ],
  },
  {
    type: 'ldap',
    label: 'LDAP',
    description: 'LDAP authentication.',
    icon: '📇',
    formAttributes: ['username', 'password'],
    fields: [
      { name: 'username', label: 'Username', type: 'text', placeholder: 'jane.doe' },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    ],
  },
  {
    type: 'jwt',
    label: 'JWT',
    description: 'Authenticate using JWT or OIDC provider.',
    icon: '🎫',
    formAttributes: ['role', 'jwt'],
    fields: [
      { name: 'role', label: 'Role', type: 'text', placeholder: 'my-role' },
      { name: 'jwt', label: 'JWT', type: 'text', placeholder: 'eyJhbGciOi...' },
    ],
  },
  {
    type: 'oidc',
    label: 'OIDC',
    description: 'Authenticate using JWT or OIDC provider.',
    icon: '🌐',
    formAttributes: ['role', 'jwt'],
    external: true,
  },
  {
    type: 'radius',
    label: 'RADIUS',
    description: 'Authenticate with your RADIUS username and password.',
    icon: '📡',
    formAttributes: ['username', 'password'],
    fields: [
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
    ],
  },
];
