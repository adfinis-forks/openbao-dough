export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
  active: boolean;
}

export interface Secret {
  id: string;
  path: string;
  name: string;
  engine: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthMethod {
  id: string;
  type: string;
  path: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface SystemHealth {
  sealed: boolean;
  standby: boolean;
  version: string;
  clusterName: string;
  clusterId: string;
  initialized: boolean;
  serverTimeUtc: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  auth: {
    clientToken: string;
    accessor: string;
    displayName: string;
    policies: string[];
  };
  request: {
    operation: string;
    path: string;
    data?: Record<string, any>;
  };
  response?: {
    data?: Record<string, any>;
  };
  error?: string;
}
