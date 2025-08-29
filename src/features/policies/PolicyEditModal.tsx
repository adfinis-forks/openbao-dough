import type React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Badge } from '../../shared/ui/Badge';
import { CheckCircle, AlertTriangle } from '../../shared/ui/Icons';

interface Policy {
  id: string;
  name: string;
  description: string;
  rules: number;
  lastModified: string;
  type: 'Built-in' | 'Custom';
  rulesContent?: string;
}

interface PolicyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: Policy | null;
  onSave: (
    policy: Omit<Policy, 'id' | 'rules' | 'lastModified'> & {
      rulesContent: string;
    },
  ) => void;
}

const defaultRules = `# Example policy rules
# Allow read access to secret/data/*
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

export const PolicyEditModal: React.FC<PolicyEditModalProps> = ({
  isOpen,
  onClose,
  policy,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rulesContent: defaultRules,
    type: 'Custom' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!policy;

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        description: policy.description,
        rulesContent: policy.rulesContent || defaultRules,
        type: policy.type,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        rulesContent: defaultRules,
        type: 'Custom',
      });
    }
    setErrors({});
  }, [policy, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name =
        'Policy name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Policy description is required';
    }

    if (!formData.rulesContent.trim()) {
      newErrors.rulesContent = 'Policy rules are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? `Edit Policy: ${policy?.name}` : 'Create New Policy'}
      size="large"
    >
      <div className="policy-edit-modal">
        <div className="policy-edit-form">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="policy-name" className="form-label">
                  Policy Name
                </label>
                <Input
                  id="policy-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter policy name"
                  disabled={isEditing && policy?.type === 'Built-in'}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                  <div className="form-error">
                    <AlertTriangle size={16} />
                    {errors.name}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <Badge
                  variant={
                    formData.type === 'Built-in' ? 'primary' : 'secondary'
                  }
                  size="medium"
                >
                  {formData.type}
                </Badge>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="policy-description" className="form-label">
                Description
              </label>
              <Input
                id="policy-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter policy description"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && (
                <div className="form-error">
                  <AlertTriangle size={16} />
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="policy-rules" className="form-label">
              Policy Rules
            </label>
            <div className="code-editor-wrapper">
              <textarea
                id="policy-rules"
                value={formData.rulesContent}
                onChange={(e) =>
                  setFormData({ ...formData, rulesContent: e.target.value })
                }
                className={`code-editor ${errors.rulesContent ? 'error' : ''}`}
                placeholder="Enter policy rules using HCL syntax..."
                rows={20}
              />
              {errors.rulesContent && (
                <div className="form-error">
                  <AlertTriangle size={16} />
                  {errors.rulesContent}
                </div>
              )}
            </div>
            <div className="code-help">
              <p>
                Use HashiCorp Configuration Language (HCL) to define access
                policies. Specify paths and capabilities like "read", "create",
                "update", "delete", or "deny".
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<CheckCircle size={16} />}
            disabled={isEditing && policy?.type === 'Built-in'}
          >
            {isEditing ? 'Save Changes' : 'Create Policy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
