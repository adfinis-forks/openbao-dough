import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@common/Card';
import { Input, Label } from '@common/Input';
import { TextArea } from '@common/TextArea';
import { Select, type SelectOption } from '@common/Select';
import { Button } from '@common/Button';
import { X } from '@common/Icons';
import './EnableAuthMethodOptionsView.css';

export interface AuthMethodOptions {
  description?: string;
  listWhenUnauthenticated?: boolean;
  local?: boolean;
  sealWrap?: boolean;
  defaultLeaseTtl?: string;
  maxLeaseTtl?: string;
  tokenType?: string;
  auditNonHmacRequestKeys?: string[];
  auditNonHmacResponseKeys?: string[];
  passthroughRequestHeaders?: string[];
}

interface EnableAuthMethodOptionsViewProps {
  onOptionsChange?: (options: AuthMethodOptions) => void;
}

export const EnableAuthMethodOptionsView: React.FC<EnableAuthMethodOptionsViewProps> = ({
  onOptionsChange,
}) => {
  const [description, setDescription] = useState('');
  const [listWhenUnauthenticated, setListWhenUnauthenticated] = useState(false);
  const [local, setLocal] = useState(false);
  const [sealWrap, setSealWrap] = useState(false);
  const [defaultLeaseTtlEnabled, setDefaultLeaseTtlEnabled] = useState(false);
  const [defaultLeaseTtl, setDefaultLeaseTtl] = useState('');
  const [maxLeaseTtlEnabled, setMaxLeaseTtlEnabled] = useState(false);
  const [maxLeaseTtl, setMaxLeaseTtl] = useState('');
  const [tokenType, setTokenType] = useState<string>('');
  const [auditNonHmacRequestKeys, setAuditNonHmacRequestKeys] = useState<Array<{ id: string; value: string }>>([]);
  const [auditNonHmacResponseKeys, setAuditNonHmacResponseKeys] = useState<Array<{ id: string; value: string }>>([]);
  const [passthroughRequestHeaders, setPassthroughRequestHeaders] = useState<Array<{ id: string; value: string }>>([]);

  // Notify parent of options changes
  useEffect(() => {
    if (onOptionsChange) {
      onOptionsChange({
        description: description || undefined,
        listWhenUnauthenticated: listWhenUnauthenticated || undefined,
        local: local || undefined,
        sealWrap: sealWrap || undefined,
        defaultLeaseTtl: defaultLeaseTtlEnabled && defaultLeaseTtl ? defaultLeaseTtl : undefined,
        maxLeaseTtl: maxLeaseTtlEnabled && maxLeaseTtl ? maxLeaseTtl : undefined,
        tokenType: tokenType || undefined,
        auditNonHmacRequestKeys: auditNonHmacRequestKeys.length > 0 ? auditNonHmacRequestKeys.map(item => item.value) : undefined,
        auditNonHmacResponseKeys: auditNonHmacResponseKeys.length > 0 ? auditNonHmacResponseKeys.map(item => item.value) : undefined,
        passthroughRequestHeaders: passthroughRequestHeaders.length > 0 ? passthroughRequestHeaders.map(item => item.value) : undefined,
      });
    }
  }, [
    description,
    listWhenUnauthenticated,
    local,
    sealWrap,
    defaultLeaseTtlEnabled,
    defaultLeaseTtl,
    maxLeaseTtlEnabled,
    maxLeaseTtl,
    tokenType,
    auditNonHmacRequestKeys,
    auditNonHmacResponseKeys,
    passthroughRequestHeaders,
    onOptionsChange,
  ]);

  const tokenTypeOptions: SelectOption[] = [
    { value: 'default-service', label: 'default-service' },
    { value: 'default-batch', label: 'default-batch' },
    { value: 'batch', label: 'batch' },
    { value: 'service', label: 'service' },
  ];

  const addListItem = (
    list: Array<{ id: string; value: string }>,
    setList: (list: Array<{ id: string; value: string }>) => void,
    value: string,
  ) => {
    if (value.trim()) {
      setList([...list, { id: `${Date.now()}-${Math.random()}`, value: value.trim() }]);
    }
  };

  const removeListItem = (
    list: Array<{ id: string; value: string }>,
    setList: (list: Array<{ id: string; value: string }>) => void,
    id: string,
  ) => {
    setList(list.filter((item) => item.id !== id));
  };

  const ListInputField: React.FC<{
    label: string;
    items: Array<{ id: string; value: string }>;
    onAdd: (value: string) => void;
    onRemove: (id: string) => void;
  }> = ({ label, items, onAdd, onRemove }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      if (inputValue.trim()) {
        onAdd(inputValue);
        setInputValue('');
      }
    };

    return (
      <div className="method-options__field method-options__list-field">
        <div className="method-options__field-header">
          <Label>{label}</Label>
        </div>
        <div className="method-options__list-input-container">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add one item per row"
            fullWidth
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleAdd}
            className="method-options__add-button"
          >
            Add
          </Button>
        </div>
        {items.length > 0 && (
          <div className="method-options__list-items">
            {items.map((item) => (
              <div key={item.id} className="method-options__list-item">
                <span>{item.value}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="method-options__remove-button"
                  aria-label={`Remove ${item.value}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="enable-auth-method-options-view">
      <CardContent className="enable-auth-method-options-view__content">
        <CardTitle className="enable-auth-method-options-view__title">
          Method Options
        </CardTitle>
        <CardDescription className="enable-auth-method-options-view__description">
          Configure additional options for this authentication method.
        </CardDescription>

        <div className="method-options__fields">

          <div className="method-options__field">
            <TextArea
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              fullWidth
            />
          </div>


          <div className="method-options__field method-options__checkbox-field">
            <label className="method-options__checkbox-label">
              <input
                type="checkbox"
                checked={listWhenUnauthenticated}
                onChange={(e) => setListWhenUnauthenticated(e.target.checked)}
                className="method-options__checkbox"
              />
              <span>List method when unauthenticated</span>
            </label>
          </div>

          <div className="method-options__field method-options__checkbox-field">
            <label className="method-options__checkbox-label">
              <input
                type="checkbox"
                checked={local}
                onChange={(e) => setLocal(e.target.checked)}
                className="method-options__checkbox"
              />
              <span>Local</span>
            </label>
          </div>

          <div className="method-options__field method-options__checkbox-field">
            <label className="method-options__checkbox-label">
              <input
                type="checkbox"
                checked={sealWrap}
                onChange={(e) => setSealWrap(e.target.checked)}
                className="method-options__checkbox"
              />
              <span>Seal wrap</span>
            </label>
          </div>

          <div className="method-options__field method-options__toggle-field">
            <label className="method-options__toggle-label">
              <input
                type="checkbox"
                checked={defaultLeaseTtlEnabled}
                onChange={(e) => setDefaultLeaseTtlEnabled(e.target.checked)}
                className="method-options__toggle"
              />
              <span>Default Lease TTL</span>
            </label>
            {defaultLeaseTtlEnabled ? (
              <div className="method-options__toggle-content">
                <Input
                  value={defaultLeaseTtl}
                  onChange={(e) => setDefaultLeaseTtl(e.target.value)}
                  placeholder="e.g., 30s, 5m, 1h"
                  fullWidth
                />
              </div>
            ) : (
              <p className="method-options__toggle-hint">
                OpenBao will use the default lease duration.
              </p>
            )}
          </div>

          <div className="method-options__field method-options__toggle-field">
            <label className="method-options__toggle-label">
              <input
                type="checkbox"
                checked={maxLeaseTtlEnabled}
                onChange={(e) => setMaxLeaseTtlEnabled(e.target.checked)}
                className="method-options__toggle"
              />
              <span>Max Lease TTL</span>
            </label>
            {maxLeaseTtlEnabled ? (
              <div className="method-options__toggle-content">
                <Input
                  value={maxLeaseTtl}
                  onChange={(e) => setMaxLeaseTtl(e.target.value)}
                  placeholder="e.g., 30s, 5m, 1h"
                  fullWidth
                />
              </div>
            ) : (
              <p className="method-options__toggle-hint">
                OpenBao will use the default lease duration.
              </p>
            )}
          </div>

          <div className="method-options__field">
            <Label htmlFor="token-type">Token Type</Label>
            <Select
              options={tokenTypeOptions}
              value={tokenType}
              onChange={(value) => setTokenType(value)}
              placeholder="Select one"
            />
          </div>

          <ListInputField
            label="Request keys excluded from HMACing in audit"
            items={auditNonHmacRequestKeys}
            onAdd={(value) => addListItem(auditNonHmacRequestKeys, setAuditNonHmacRequestKeys, value)}
            onRemove={(index) => removeListItem(auditNonHmacRequestKeys, setAuditNonHmacRequestKeys, index)}
          />

          <ListInputField
            label="Response keys excluded from HMACing in audit"
            items={auditNonHmacResponseKeys}
            onAdd={(value) => addListItem(auditNonHmacResponseKeys, setAuditNonHmacResponseKeys, value)}
            onRemove={(index) => removeListItem(auditNonHmacResponseKeys, setAuditNonHmacResponseKeys, index)}
          />

          <ListInputField
            label="Allowed passthrough request headers"
            items={passthroughRequestHeaders}
            onAdd={(value) => addListItem(passthroughRequestHeaders, setPassthroughRequestHeaders, value)}
            onRemove={(index) => removeListItem(passthroughRequestHeaders, setPassthroughRequestHeaders, index)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

