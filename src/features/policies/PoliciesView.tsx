import { Badge } from '@common/Badge';
import { Button } from '@common/Button';
import { Card, CardContent } from '@common/Card';
import { Dropdown, DropdownMenuItem } from '@common/Dropdown';
import {
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from '@common/Icons';
import { Input } from '@common/Input';
import type React from 'react';
import { useState } from 'react';
import { PolicyEditModal } from './PolicyEditModal';
import { PolicyViewModal } from './PolicyViewModal';
import './PoliciesView.css';

interface Policy {
  id: string;
  name: string;
  description: string;
  rules: number;
  lastModified: string;
  type: 'Built-in' | 'Custom';
  rulesContent?: string;
}

const mockPolicies: Policy[] = [
  {
    id: '1',
    name: 'admin',
    description: 'Full administrative access to all resources',
    rules: 15,
    lastModified: '1 day ago',
    type: 'Built-in',
    rulesContent: `# Admin policy - full access
path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Root path access
path "sys/*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}`,
  },
  {
    id: '2',
    name: 'developer',
    description: 'Development environment access with read/write permissions',
    rules: 8,
    lastModified: '3 days ago',
    type: 'Custom',
    rulesContent: `# Developer policy
path "secret/data/dev/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "secret/data/shared/*" {
  capabilities = ["read"]
}`,
  },
  {
    id: '3',
    name: 'readonly',
    description: 'Read-only access to secrets and configuration',
    rules: 3,
    lastModified: '1 week ago',
    type: 'Custom',
    rulesContent: `# Read-only policy
path "secret/data/*" {
  capabilities = ["read"]
}

path "auth/token/lookup-self" {
  capabilities = ["read"]
}`,
  },
  {
    id: '4',
    name: 'prod-deploy',
    description: 'Production deployment access with specific permissions',
    rules: 12,
    lastModified: '2 weeks ago',
    type: 'Custom',
    rulesContent: `# Production deployment policy
path "secret/data/prod/*" {
  capabilities = ["read"]
  allowed_parameters = {
    "version" = []
  }
}

path "database/creds/prod-role" {
  capabilities = ["read"]
}`,
  },
  {
    id: '5',
    name: 'backup-operator',
    description: 'Backup and restore operations',
    rules: 6,
    lastModified: '3 weeks ago',
    type: 'Custom',
    rulesContent: `# Backup operator policy
path "sys/storage/raft/snapshot" {
  capabilities = ["read"]
}

path "secret/data/*" {
  capabilities = ["read"]
}`,
  },
];

export const PoliciesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsEditModalOpen(true);
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const handleDuplicatePolicy = (policy: Policy) => {
    setSelectedPolicy({
      ...policy,
      id: '',
      name: `${policy.name}-copy`,
      type: 'Custom',
    });
    setIsCreateModalOpen(true);
  };

  const handleDeletePolicy = (policy: Policy) => {
    if (
      window.confirm(
        `Are you sure you want to delete the policy "${policy.name}"?`,
      )
    ) {
      setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
    }
  };

  const handleSavePolicy = (
    policyData: Omit<Policy, 'id' | 'rules' | 'lastModified'> & {
      rulesContent: string;
    },
  ) => {
    const rulesCount = (policyData.rulesContent.match(/path\s+"/g) || [])
      .length;

    if (selectedPolicy?.id) {
      // Edit existing policy
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === selectedPolicy.id
            ? {
                ...p,
                ...policyData,
                rules: rulesCount,
                lastModified: 'Just now',
              }
            : p,
        ),
      );
    } else {
      // Create new policy
      const newPolicy: Policy = {
        id: Date.now().toString(),
        ...policyData,
        rules: rulesCount,
        lastModified: 'Just now',
      };
      setPolicies((prev) => [...prev, newPolicy]);
    }
  };

  return (
    <div className="policies-view">
      <div className="policies-view__header">
        <div>
          <h1 className="policies-view__title">Policies</h1>
          <p className="policies-view__subtitle">
            Manage access control policies and permissions
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleCreatePolicy}
        >
          New Policy
        </Button>
      </div>

      <div className="policies-view__controls">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <Input
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <Button variant="secondary">Filter</Button>
        <Button variant="secondary">Export</Button>
      </div>

      <div className="policies-grid">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} variant="elevated" className="policy-card">
            <CardContent>
              <div className="policy-card__content">
                <div className="policy-card__header">
                  <img
                    src="/document-text-outline.svg"
                    alt="Policy"
                    width={24}
                    height={24}
                    className="policy-card__icon"
                  />
                  <div className="policy-card__info">
                    <div className="policy-card__title-row">
                      <h3 className="policy-card__name">{policy.name}</h3>
                      <Badge
                        variant={
                          policy.type === 'Built-in' ? 'primary' : 'secondary'
                        }
                        size="small"
                      >
                        {policy.type}
                      </Badge>
                    </div>
                    <p className="policy-card__description">
                      {policy.description}
                    </p>
                  </div>
                </div>

                <div className="policy-card__meta">
                  <div className="policy-card__stats">
                    <Badge variant="success" size="small">
                      {policy.rules} rules
                    </Badge>
                    <span className="policy-card__modified">
                      Modified {policy.lastModified}
                    </span>
                  </div>

                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="small">
                        <MoreHorizontal size={16} />
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuItem onClick={() => handleViewPolicy(policy)}>
                      <Eye size={16} />
                      View Policy
                    </DropdownMenuItem>
                    {policy.type === 'Custom' && (
                      <DropdownMenuItem
                        onClick={() => handleEditPolicy(policy)}
                      >
                        <Edit size={16} />
                        Edit Policy
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDuplicatePolicy(policy)}
                    >
                      <Copy size={16} />
                      Duplicate
                    </DropdownMenuItem>
                    {policy.type === 'Custom' && (
                      <DropdownMenuItem
                        danger
                        onClick={() => handleDeletePolicy(policy)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </Dropdown>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="empty-state">
          <img
            src="/document-text-outline.svg"
            alt="Policies"
            width={64}
            height={64}
            className="empty-state__icon"
          />
          <h3 className="empty-state__title">No policies found</h3>
          <p className="empty-state__description">
            {searchQuery
              ? `No policies match "${searchQuery}"`
              : 'Create your first policy to get started'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleCreatePolicy}
            >
              Create Policy
            </Button>
          )}
        </div>
      )}

      <PolicyEditModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPolicy(null);
        }}
        policy={isEditModalOpen ? selectedPolicy : null}
        onSave={handleSavePolicy}
      />

      <PolicyViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPolicy(null);
        }}
        policy={selectedPolicy}
        onEdit={handleEditPolicy}
        onDuplicate={handleDuplicatePolicy}
        onDelete={handleDeletePolicy}
      />
    </div>
  );
};
