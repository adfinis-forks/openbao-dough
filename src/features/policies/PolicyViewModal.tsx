import type React from 'react';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Edit, Copy, Trash2, Clock } from '../../shared/ui/Icons';

interface Policy {
  id: string;
  name: string;
  description: string;
  rules: number;
  lastModified: string;
  type: 'Built-in' | 'Custom';
  rulesContent?: string;
}

interface PolicyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onEdit: (policy: Policy) => void;
  onDuplicate: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
}

const sampleRulesContent = `# Allow read access to secret/data/*
path "secret/data/*" {
  capabilities = ["read"]
}

# Allow write access to secret/data/myapp/*
path "secret/data/myapp/*" {
  capabilities = ["create", "update", "read", "delete"]
  allowed_parameters = {
    "max_versions" = [5]
  }
}

# Deny access to secret/data/admin/*
path "secret/data/admin/*" {
  capabilities = ["deny"]
}`;

export const PolicyViewModal: React.FC<PolicyViewModalProps> = ({
  isOpen,
  onClose,
  policy,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (!policy) return null;

  const handleEdit = () => {
    onEdit(policy);
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate(policy);
    onClose();
  };

  const handleDelete = () => {
    onDelete(policy);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Policy Details"
      size="large"
    >
      <div className="policy-view-modal">
        <div className="policy-header">
          <div className="policy-info">
            <div className="policy-title-row">
              <img
                src="/document-text-outline.svg"
                alt="Policy"
                width={24}
                height={24}
                className="policy-icon"
              />
              <h3 className="policy-name">{policy.name}</h3>
              <Badge
                variant={policy.type === 'Built-in' ? 'primary' : 'secondary'}
                size="medium"
              >
                {policy.type}
              </Badge>
            </div>
            <p className="policy-description">{policy.description}</p>
          </div>
        </div>

        <div className="policy-metadata">
          <div className="metadata-item">
            <Clock size={16} />
            <span className="metadata-label">Last Modified:</span>
            <span className="metadata-value">{policy.lastModified}</span>
          </div>
          <div className="metadata-item">
            <img
              src="/document-text-outline.svg"
              alt="Rules"
              width={16}
              height={16}
            />
            <span className="metadata-label">Rules Count:</span>
            <Badge variant="success" size="small">
              {policy.rules} rules
            </Badge>
          </div>
        </div>

        <div className="policy-content">
          <div className="content-header">
            <h4 className="content-title">Policy Rules</h4>
            <div className="content-actions">
              <Button
                variant="ghost"
                size="small"
                onClick={() =>
                  navigator.clipboard.writeText(
                    policy.rulesContent || sampleRulesContent,
                  )
                }
              >
                <Copy size={16} />
                Copy
              </Button>
            </div>
          </div>
          <div className="code-viewer">
            <pre className="code-content">
              {policy.rulesContent || sampleRulesContent}
            </pre>
          </div>
        </div>

        <div className="modal-actions">
          <div className="actions-left">
            {policy.type === 'Custom' && (
              <Button
                variant="danger"
                onClick={handleDelete}
                icon={<Trash2 size={16} />}
              >
                Delete Policy
              </Button>
            )}
          </div>
          <div className="actions-right">
            <Button
              variant="outline"
              onClick={handleDuplicate}
              icon={<Copy size={16} />}
            >
              Duplicate
            </Button>
            {policy.type === 'Custom' && (
              <Button
                variant="primary"
                onClick={handleEdit}
                icon={<Edit size={16} />}
              >
                Edit Policy
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
