import { Button } from '@common/Button';
import { Input } from '@common/Input';
import type React from 'react';
import { ChevronDown } from '../../../shared/components/common/Icons';

interface CreateNamespaceViewProps {
  namespacePath: string;
  onPathChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onCreate: () => void;
  isPending: boolean;
}

export const CreateNamespaceView: React.FC<CreateNamespaceViewProps> = ({
  namespacePath,
  onPathChange,
  onBack,
  onCreate,
  isPending,
}) => {
  return (
    <div className="create-namespace-view">
      <div className="create-namespace-view__header">
        <Button
          variant="secondary"
          icon={<ChevronDown size={16} />}
          onClick={onBack}
          className="back-button"
        >
          Back to Namespaces
        </Button>
        <div>
          <h1 className="create-namespace-view__title">
            Create a New Namespace
          </h1>
          <p className="create-namespace-view__subtitle">
            Configure a new namespace for your vault
          </p>
        </div>
      </div>

      <div className="create-namespace-view__content">
        <div className="namespace-creation-state">
          <div className="path-configuration">
            <div className="path-form">
              <h3>Path</h3>
              <Input
                value={namespacePath}
                onChange={onPathChange}
                placeholder="Enter path for the namespace"
              />
              <div className="create-namespace-view__actions">
                <Button
                  variant="primary"
                  onClick={onCreate}
                  disabled={!namespacePath.trim() || isPending}
                >
                  {isPending ? 'Creating...' : 'Create Namespace'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
