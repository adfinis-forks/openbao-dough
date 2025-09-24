import type React from 'react';
import { useState } from 'react';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Dropdown, DropdownMenuItem } from '../../shared/ui/Dropdown';
import { Input } from '../../shared/ui/Input';
import {
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from '../../shared/ui/Icons';
import './AuditView.css';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  path: string;
  result: 'Success' | 'Failure';
  ip: string;
  details?: string;
}

interface AuditDevice {
  id: string;
  type: 'file' | 'syslog' | 'socket';
  path: string;
  enabled: boolean;
  description: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-15 14:30:25',
    user: 'john.doe',
    action: 'Read',
    path: 'secret/prod/database',
    result: 'Success',
    ip: '192.168.1.100',
    details: 'Secret read successfully',
  },
  {
    id: '2',
    timestamp: '2024-01-15 14:28:12',
    user: 'admin',
    action: 'Create',
    path: 'secret/dev/api-key',
    result: 'Success',
    ip: '192.168.1.50',
    details: 'New secret created',
  },
  {
    id: '3',
    timestamp: '2024-01-15 14:25:45',
    user: 'jane.smith',
    action: 'Update',
    path: 'auth/userpass/users/jane.smith',
    result: 'Success',
    ip: '192.168.1.75',
    details: 'User password updated',
  },
  {
    id: '4',
    timestamp: '2024-01-15 14:22:33',
    user: 'unknown',
    action: 'Auth',
    path: 'auth/userpass/login/test',
    result: 'Failure',
    ip: '10.0.0.123',
    details: 'Invalid credentials',
  },
  {
    id: '5',
    timestamp: '2024-01-15 14:20:18',
    user: 'admin',
    action: 'Delete',
    path: 'secret/temp/test',
    result: 'Success',
    ip: '192.168.1.50',
    details: 'Temporary secret deleted',
  },
  {
    id: '6',
    timestamp: '2024-01-15 14:18:05',
    user: 'deploy-user',
    action: 'Read',
    path: 'secret/prod/config',
    result: 'Success',
    ip: '192.168.1.200',
    details: 'Configuration accessed for deployment',
  },
];

const mockAuditDevices: AuditDevice[] = [
  {
    id: '1',
    type: 'file',
    path: '/vault/logs/audit.log',
    enabled: true,
    description: 'Primary audit log file',
  },
  {
    id: '2',
    type: 'syslog',
    path: 'syslog://localhost:514',
    enabled: true,
    description: 'System log integration',
  },
  {
    id: '3',
    type: 'socket',
    path: 'tcp://audit-server:8080',
    enabled: false,
    description: 'Remote audit server',
  },
];

export const AuditView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'Success' | 'Failure'
  >('all');
  const [auditEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [auditDevices] = useState<AuditDevice[]>(mockAuditDevices);

  const filteredEvents = auditEvents.filter((event) => {
    const matchesSearch =
      event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.path.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' || event.result === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'read':
        return 'info';
      case 'update':
        return 'warning';
      case 'delete':
        return 'danger';
      case 'auth':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="audit-view">
      <div className="audit-view__header">
        <div>
          <h1 className="audit-view__title">Audit Logs</h1>
          <p className="audit-view__subtitle">
            Monitor and review system activity and security events
          </p>
        </div>
        <div className="audit-view__actions">
          <Button variant="outline" icon={<Download size={16} />}>
            Export Logs
          </Button>
          <Button variant="primary" icon={<Plus size={16} />}>
            Enable Audit Device
          </Button>
        </div>
      </div>

      <div className="audit-devices">
        <Card>
          <CardHeader>
            <CardTitle className="audit-devices__title">
              <img
                src="/shield-outline.svg"
                alt="Shield"
                width={20}
                height={20}
              />
              Audit Devices ({auditDevices.filter((d) => d.enabled).length}{' '}
              enabled)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="audit-devices__grid">
              {auditDevices.map((device) => (
                <div
                  key={device.id}
                  className={`audit-device ${!device.enabled ? 'audit-device--disabled' : ''}`}
                >
                  <div className="audit-device__info">
                    <div className="audit-device__header">
                      <img
                        src="/document-text-outline.svg"
                        alt="Device"
                        width={20}
                        height={20}
                        className="audit-device__icon"
                      />
                      <div>
                        <h4 className="audit-device__type">
                          {device.type.toUpperCase()}
                        </h4>
                        <p className="audit-device__description">
                          {device.description}
                        </p>
                      </div>
                    </div>
                    <p className="audit-device__path">{device.path}</p>
                  </div>
                  <div className="audit-device__status">
                    <Badge variant={device.enabled ? 'success' : 'default'}>
                      {device.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="audit-controls">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <Input
            placeholder="Search logs by user, action, or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="secondary" icon={<Filter size={16} />}>
              {selectedFilter === 'all'
                ? 'All Events'
                : selectedFilter === 'Success'
                  ? 'Success Only'
                  : 'Failures Only'}
            </Button>
          }
        >
          <DropdownMenuItem onClick={() => setSelectedFilter('all')}>
            All Events
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedFilter('Success')}>
            Success Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedFilter('Failure')}>
            Failures Only
          </DropdownMenuItem>
        </Dropdown>
      </div>

      <Card variant="table" className="audit-events-card">
        <CardHeader>
          <CardTitle>Recent Audit Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="audit-events">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <img
                  src="/shield-outline.svg"
                  alt="Shield"
                  width={48}
                  height={48}
                  className="empty-state__icon"
                />
                <p className="empty-state__message">
                  {searchQuery || selectedFilter !== 'all'
                    ? 'No events match your criteria'
                    : 'No audit events available'}
                </p>
              </div>
            ) : (
              <div className="audit-events__table">
                <div className="audit-events__header">
                  <span className="audit-events__column audit-events__column--timestamp">
                    Timestamp
                  </span>
                  <span className="audit-events__column audit-events__column--user">
                    User
                  </span>
                  <span className="audit-events__column audit-events__column--action">
                    Action
                  </span>
                  <span className="audit-events__column audit-events__column--path">
                    Path
                  </span>
                  <span className="audit-events__column audit-events__column--result">
                    Result
                  </span>
                  <span className="audit-events__column audit-events__column--ip">
                    IP Address
                  </span>
                  <span className="audit-events__column audit-events__column--actions">
                    Actions
                  </span>
                </div>

                {filteredEvents.map((event) => (
                  <div key={event.id} className="audit-event">
                    <div
                      className={`audit-event__status audit-event__status--${event.result}`}
                    />
                    <div className="audit-event__details">
                      <span className="audit-event__timestamp">
                        {event.timestamp}
                      </span>
                      <span className="audit-event__user">{event.user}</span>
                      <Badge
                        variant={getActionColor(event.action)}
                        size="small"
                      >
                        {event.action}
                      </Badge>
                      <span className="audit-event__path">{event.path}</span>
                      <Badge
                        variant={
                          event.result === 'Success' ? 'success' : 'danger'
                        }
                        size="small"
                      >
                        {event.result}
                      </Badge>
                      <span className="audit-event__ip">{event.ip}</span>
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="small">
                            <MoreHorizontal size={14} />
                          </Button>
                        }
                        align="end"
                      >
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Event</DropdownMenuItem>
                      </Dropdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
