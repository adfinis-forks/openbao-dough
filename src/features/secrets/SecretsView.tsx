import type React from 'react';
import { useState } from 'react';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent } from '../../shared/ui/Card';
import { Dropdown, DropdownMenuItem } from '../../shared/ui/Dropdown';
import {
  Copy,
  Database,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from '../../shared/ui/Icons';
import { Input } from '../../shared/ui/Input';
import './SecretsView.css';

export interface Secret {
  id: string;
  path: string;
  type: 'kv' | 'pki' | 'database';
  lastModified: string;
  version: string;
}

const mockSecrets: Secret[] = [
  {
    id: '1',
    path: 'secret/prod/database',
    type: 'kv',
    lastModified: '2 hours ago',
    version: 'v3',
  },
  {
    id: '2',
    path: 'secret/prod/api-keys',
    type: 'kv',
    lastModified: '1 day ago',
    version: 'v1',
  },
  {
    id: '3',
    path: 'secret/dev/config',
    type: 'kv',
    lastModified: '3 days ago',
    version: 'v2',
  },
  {
    id: '4',
    path: 'pki/cert/web-server',
    type: 'pki',
    lastModified: '1 week ago',
    version: 'v1',
  },
  {
    id: '5',
    path: 'database/config/postgres',
    type: 'database',
    lastModified: '2 weeks ago',
    version: 'v1',
  },
];

export const SecretsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [secrets] = useState<Secret[]>(mockSecrets);

  const filteredSecrets = secrets.filter((secret) =>
    secret.path.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getSecretIcon = (type: Secret['type']) => {
    switch (type) {
      case 'kv':
        return () => (
          <img src="/key-outline.svg" alt="Key" width={20} height={20} />
        );
      case 'pki':
        return () => (
          <img src="/shield-outline.svg" alt="Shield" width={20} height={20} />
        );
      case 'database':
        return Database;
    }
  };

  const getSecretColor = (type: Secret['type']) => {
    switch (type) {
      case 'kv':
        return 'primary';
      case 'pki':
        return 'secondary';
      case 'database':
        return 'blue';
    }
  };

  return (
    <div className="secrets-view">
      <div className="secrets-view__header">
        <div>
          <h1>Secrets</h1>
          <p className="secrets-view__subtitle">
            Manage your secrets and secret engines
          </p>
        </div>
        <Button icon={<Plus size={16} />}>New Secret</Button>
      </div>

      <div className="secrets-view__controls">
        <Input
          placeholder="Search secrets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
          fullWidth
        />
        <Button variant="secondary">Filter</Button>
      </div>

      <div className="secrets-list">
        {filteredSecrets.map((secret) => {
          const Icon = getSecretIcon(secret.type);
          const color = getSecretColor(secret.type);

          return (
            <Card key={secret.id} className="secret-card">
              <CardContent>
                <div className="secret-card__content">
                  <div className="secret-card__info">
                    <div
                      className={`secret-card__icon secret-card__icon--${color}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="secret-card__details">
                      <h3 className="secret-card__path">{secret.path}</h3>
                      <div className="secret-card__meta">
                        <Badge variant="default" size="small">
                          {secret.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" size="small">
                          {secret.version}
                        </Badge>
                        <span className="secret-card__modified">
                          Modified {secret.lastModified}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="small">
                        <MoreHorizontal size={16} />
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuItem>
                      <Eye size={16} />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit size={16} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy size={16} />
                      Copy Path
                    </DropdownMenuItem>
                    <DropdownMenuItem danger>
                      <Trash2 size={16} />
                      Delete
                    </DropdownMenuItem>
                  </Dropdown>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
