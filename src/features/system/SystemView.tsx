import type React from 'react';
import { useState } from 'react';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Dropdown, DropdownMenuItem } from '../../shared/ui/Dropdown';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Server,
  Unlock,
} from '../../shared/ui/Icons';
import './SystemView.css';

interface HealthItem {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastCheck: string;
  details?: string;
}

interface ConfigItem {
  key: string;
  value: string;
  description: string;
  editable: boolean;
}

const mockHealthItems: HealthItem[] = [
  {
    id: '1',
    name: 'Storage Backend',
    status: 'healthy',
    message: 'Connected and operational',
    lastCheck: '30 seconds ago',
    details: 'Consul storage backend responding normally',
  },
  {
    id: '2',
    name: 'Replication',
    status: 'healthy',
    message: 'In sync',
    lastCheck: '1 minute ago',
    details: 'Last sync: 45 seconds ago',
  },
  {
    id: '3',
    name: 'Performance',
    status: 'warning',
    message: 'High CPU usage',
    lastCheck: '2 minutes ago',
    details: 'CPU: 75%, Memory: 68%',
  },
  {
    id: '4',
    name: 'License',
    status: 'healthy',
    message: 'Valid until 2025-12-31',
    lastCheck: '1 hour ago',
    details: 'Enterprise license active',
  },
];

const mockConfigItems: ConfigItem[] = [
  {
    key: 'default_lease_ttl',
    value: '768h',
    description: 'Default lease time-to-live',
    editable: true,
  },
  {
    key: 'max_lease_ttl',
    value: '8760h',
    description: 'Maximum lease time-to-live',
    editable: true,
  },
  {
    key: 'cluster_name',
    value: 'vault-cluster-1',
    description: 'Cluster identifier',
    editable: true,
  },
  {
    key: 'version',
    value: '2.0.0',
    description: 'OpenBao version',
    editable: false,
  },
  {
    key: 'api_addr',
    value: 'https://vault.company.com:8200',
    description: 'API address',
    editable: true,
  },
];

export const SystemView: React.FC = () => {
  const [sealStatus] = useState({
    sealed: false,
    threshold: 3,
    shares: 5,
    progress: 0,
  });

  const [healthItems, setHealthItems] = useState<HealthItem[]>(mockHealthItems);
  const [configItems] = useState<ConfigItem[]>(mockConfigItems);

  const refreshHealth = () => {
    setHealthItems((items) =>
      items.map((item) => ({
        ...item,
        lastCheck: 'Just now',
      })),
    );
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="system-view">
      <div className="system-view__header">
        <div>
          <h1 className="system-view__title">System</h1>
          <p className="system-view__subtitle">
            System configuration, health monitoring, and maintenance
          </p>
        </div>
        <Button
          variant="primary"
          icon={<RefreshCw size={16} />}
          onClick={refreshHealth}
        >
          Refresh Status
        </Button>
      </div>

      <div className="system-overview">
        <Card className="seal-status-card">
          <CardHeader>
            <CardTitle className="seal-status__title">
              {sealStatus.sealed ? <Lock size={20} /> : <Unlock size={20} />}
              Seal Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="seal-status">
              <div className="seal-status__info">
                <div
                  className={`seal-status__icon ${!sealStatus.sealed ? 'seal-status__icon--unsealed' : 'seal-status__icon--sealed'}`}
                >
                  {sealStatus.sealed ? (
                    <Lock size={32} />
                  ) : (
                    <Unlock size={32} />
                  )}
                </div>
                <div>
                  <h3 className="seal-status__state">
                    {sealStatus.sealed ? 'Sealed' : 'Unsealed'}
                  </h3>
                  <p className="seal-status__description">
                    {sealStatus.sealed
                      ? 'Vault is sealed and secured'
                      : 'Vault is operational'}
                  </p>
                </div>
              </div>

              <div className="seal-thresholds">
                <div className="seal-threshold">
                  <span className="seal-threshold__label">Seal Threshold</span>
                  <span className="seal-threshold__value">
                    {sealStatus.threshold} of {sealStatus.shares}
                  </span>
                </div>
                <div className="seal-threshold">
                  <span className="seal-threshold__label">Progress</span>
                  <span className="seal-threshold__value">
                    {sealStatus.progress} of {sealStatus.threshold}
                  </span>
                </div>
              </div>

              {!sealStatus.sealed && (
                <Button variant="overlay-danger" icon={<Lock size={16} />}>
                  Seal Vault
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="config-card">
          <CardHeader>
            <CardTitle className="config__title">
              <img
                src="/settings-outline.svg"
                alt="Settings"
                width={20}
                height={20}
              />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="config-items">
              {configItems.map((item) => (
                <div key={item.key} className="config-item">
                  <div className="config-item__info">
                    <span className="config-item__key">{item.key}</span>
                    <span className="config-item__description">
                      {item.description}
                    </span>
                  </div>
                  <div className="config-item__value-row">
                    <Badge variant="default" className="config-item__value">
                      {item.value}
                    </Badge>
                    {item.editable && (
                      <Button variant="ghost" size="small">
                        <Edit size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" fullWidth icon={<Edit size={16} />}>
              Edit Configuration
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="health-card">
        <CardHeader>
          <CardTitle className="health__title">
            <Server size={20} />
            System Health
            <Button variant="ghost" size="small" onClick={refreshHealth}>
              <RefreshCw size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="health-items">
            {healthItems.map((item) => {
              const Icon = getHealthIcon(item.status);
              return (
                <div
                  key={item.id}
                  className={`health-item health-item--${item.status}`}
                >
                  <div className="health-item__main">
                    <div className="health-item__info">
                      <Icon size={20} className="health-item__icon" />
                      <div className="health-item__details">
                        <h4 className="health-item__name">{item.name}</h4>
                        <p className="health-item__message">{item.message}</p>
                        {item.details && (
                          <p className="health-item__extra">{item.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="health-item__status">
                      <Badge variant={getHealthColor(item.status)}>
                        {item.status}
                      </Badge>
                      <span className="health-item__check">
                        Last check: {item.lastCheck}
                      </span>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Run Health Check</DropdownMenuItem>
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                  </Dropdown>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
