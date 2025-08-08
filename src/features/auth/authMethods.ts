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

export interface AuthMethodMeta {
  type: AuthMethodType;
  label: string;
  description: string;
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'password';
    placeholder?: string;
  }>;
  external?: boolean;
}

export const KNOWN_AUTH_METHODS: Record<AuthMethodType, AuthMethodMeta> = {
  token: {
    type: 'token',
    label: 'Token',
    description: 'Authenticate with a direct token',
    fields: [
      { name: 'token', label: 'Token', type: 'text', placeholder: 'hvb_...' },
    ],
  },
  userpass: {
    type: 'userpass',
    label: 'Username',
    description: 'Built-in username/password login',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'jane.doe',
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
      },
    ],
  },
  ldap: {
    type: 'ldap',
    label: 'LDAP',
    description: 'Authenticate via your LDAP directory',
    fields: [
      {
        name: 'ldapUsername',
        label: 'LDAP Username',
        type: 'text',
        placeholder: 'cn=jane,ou=users,...',
      },
      {
        name: 'ldapPassword',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
      },
    ],
  },
  oidc: {
    type: 'oidc',
    label: 'OIDC',
    description: 'OpenID Connect single sign-on',
    external: true,
  },
  jwt: {
    type: 'jwt',
    label: 'JWT',
    description: 'Authenticate with a JWT',
    fields: [
      {
        name: 'jwt',
        label: 'JWT (Bearer)',
        type: 'text',
        placeholder: 'eyJhbGciOi...',
      },
    ],
  },
  approle: {
    type: 'approle',
    label: 'AppRole',
    description: 'RoleID + SecretID for machines',
    fields: [
      { name: 'roleId', label: 'Role ID', type: 'text' },
      { name: 'secretId', label: 'Secret ID', type: 'password' },
    ],
  },
  kubernetes: {
    type: 'kubernetes',
    label: 'Kubernetes',
    description: 'Authenticate using a service account JWT',
    fields: [{ name: 'token', label: 'Service Account JWT', type: 'text' }],
  },
  github: {
    type: 'github',
    label: 'GitHub',
    description: 'Authenticate with your GitHub account',
    external: true,
  },
  aws: {
    type: 'aws',
    label: 'AWS',
    description: 'Authenticate with AWS IAM credentials',
    fields: [{ name: 'pkcs7', label: 'PKCS7 / Identity Doc', type: 'text' }],
  },
  azure: {
    type: 'azure',
    label: 'Azure',
    description: 'Authenticate with Azure AD workload identity',
    fields: [{ name: 'jwt', label: 'Workload JWT', type: 'text' }],
  },
  gcp: {
    type: 'gcp',
    label: 'GCP',
    description: 'Authenticate with GCP service identity',
    fields: [{ name: 'jwt', label: 'Identity Token (JWT)', type: 'text' }],
  },
  cert: {
    type: 'cert',
    label: 'TLS Certificates',
    description: 'Mutual TLS client certificate auth',
  },
  radius: {
    type: 'radius',
    label: 'RADIUS',
    description: 'Authenticate with a RADIUS server',
    fields: [
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
    ],
  },
};
