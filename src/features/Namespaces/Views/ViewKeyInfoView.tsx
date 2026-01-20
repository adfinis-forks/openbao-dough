import { Button } from '@common/Button';
import type React from 'react';
import { ChevronDown } from '../../../shared/components/common/Icons';
import type { Namespace } from '../useNamespaces';

interface ViewKeyInfoViewProps {
  namespace: Namespace;
  onBack: () => void;
  getKeyInfoData: (namespace: Namespace) => {
    key_info: Record<string, unknown>;
  };
}

export const ViewKeyInfoView: React.FC<ViewKeyInfoViewProps> = ({
  namespace,
  onBack,
  getKeyInfoData,
}) => {
  const keyInfoData = getKeyInfoData(namespace);
  const jsonString = JSON.stringify(keyInfoData, null, 2);

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
            Key Info: {namespace.path}
          </h1>
          <p className="create-namespace-view__subtitle">
            View key information for this namespace
          </p>
        </div>
      </div>

      <div className="create-namespace-view__content">
        <div className="namespace-creation-state">
          <div className="path-configuration">
            <div className="path-form">
              <h3>Key Info</h3>
              <pre className="key-info-display">{jsonString}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
