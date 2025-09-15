import type React from 'react';
import { Badge } from '../../shared/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { CheckCircle, Server, TrendingUp } from '../../shared/ui/Icons';
import './Dashboard.css';

// Mock data
const mockStats = {
  activeSecrets: 1247,
  authMethods: 8,
  policies: 23,
  uptime: 99.9,
};

const mockActivities = [
  {
    id: '1',
    action: 'Secret created',
    path: 'secret/prod/database',
    time: '2 minutes ago',
    type: 'Create',
  },
  {
    id: '2',
    action: 'Policy updated',
    path: 'admin-policy',
    time: '15 minutes ago',
    type: 'Update',
  },
  {
    id: '3',
    action: 'User authenticated',
    path: 'userpass/john.doe',
    time: '1 hour ago',
    type: 'Auth',
  },
  {
    id: '4',
    action: 'Secret deleted',
    path: 'secret/dev/api-key',
    time: '2 hours ago',
    type: 'Delete',
  },
];

const mockSystemHealth = [
  {
    label: 'Vault Status',
    status: 'healthy',
    message: 'Unsealed',
    icon: CheckCircle,
  },
  {
    label: 'HA Status',
    status: 'healthy',
    message: 'Active',
    icon: CheckCircle,
  },
  {
    label: 'Last Backup',
    status: 'warning',
    message: '2 hours ago',
    icon: Server,
  },
  {
    label: 'API Status',
    status: 'healthy',
    message: 'Healthy',
    icon: CheckCircle,
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">
            Overview of your OpenBao instance
          </p>
        </div>
        <Badge variant="success">
          <CheckCircle size={14} />
          Healthy
        </Badge>
      </div>

      <div className="dashboard__stats">
        <Card className="stat-card stat-card--primary">
          <CardContent>
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Active Secrets</p>
                <p className="stat-card__value">
                  {mockStats.activeSecrets.toLocaleString()}
                </p>
              </div>
              <img
                src="/key-outline.svg"
                alt="Key"
                width={32}
                height={32}
                className="stat-card__icon"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card--secondary">
          <CardContent>
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Auth Methods</p>
                <p className="stat-card__value">{mockStats.authMethods}</p>
              </div>
              <img
                src="/people-outline.svg"
                alt="Users"
                width={32}
                height={32}
                className="stat-card__icon"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card--blue">
          <CardContent>
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Policies</p>
                <p className="stat-card__value">{mockStats.policies}</p>
              </div>
              <img
                src="/document-text-outline.svg"
                alt="Policies"
                width={32}
                height={32}
                className="stat-card__icon"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card--purple">
          <CardContent>
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Uptime</p>
                <p className="stat-card__value">{mockStats.uptime}%</p>
              </div>
              <TrendingUp size={32} className="stat-card__icon" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="dashboard__content">
        <Card className="dashboard__card">
          <CardHeader>
            <CardTitle className="dashboard__card-title">
              <img
                src="/analytics-outline.svg"
                alt="Activity"
                width={20}
                height={20}
              />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="activity-list">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div
                    className={`activity-dot activity-dot--${activity.type}`}
                  />
                  <div className="activity-content">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-path">{activity.path}</p>
                  </div>
                  <p className="activity-time">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard__card">
          <CardHeader>
            <CardTitle className="dashboard__card-title">
              <Server size={20} />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="system-status">
              {mockSystemHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`system-status__item system-status__item--${item.status}`}
                  >
                    <div className="system-status__info">
                      <Icon size={20} />
                      <span className="system-status__label">{item.label}</span>
                    </div>
                    <Badge
                      variant={
                        item.status === 'healthy' ? 'success' : 'warning'
                      }
                    >
                      {item.message}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
