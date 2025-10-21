import {
  AnalyticsIcon,
  DocumentTextIcon,
  FileTrayStackedIcon,
  type Icon,
  KeyIcon,
  LockClosedIcon,
  PeopleIcon,
  PersonIcon,
  RefreshIcon,
  SettingsIcon,
  ShieldIcon,
  TerminalIcon,
} from '@icons';

export type NavigationLink = {
  path: string;
  label: string;
  icon?: Icon;
};

export type NavigationSection = {
  label: string;
  icon?: Icon;
  sections: Array<{
    title: string;
    items: NavigationLink[];
  }>;
};

export type NavigationItem = NavigationLink | NavigationSection;

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

const accessSection: NavigationSection = {
  label: 'Access',
  icon: DocumentTextIcon,
  sections: [
    {
      title: 'Authentication',
      items: [
        {
          path: '/access',
          label: 'Authentication methods',
          icon: PeopleIcon,
        },
        {
          path: '/access/mfa',
          label: 'Multi-factor authentication',
          icon: ShieldIcon,
        },
        {
          path: '/access/oidc',
          label: 'OIDC provider',
          icon: SettingsIcon,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          path: '/access/namespaces',
          label: 'Namespaces',
          icon: FileTrayStackedIcon,
        },
        {
          path: '/access/identity/groups',
          label: 'Groups',
          icon: PeopleIcon,
        },
        {
          path: '/access/identity/entities',
          label: 'Entities',
          icon: PersonIcon,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          path: '/access/leases/list',
          label: 'Leases',
          icon: RefreshIcon,
        },
      ],
    },
  ],
};

const policiesSection: NavigationSection = {
  label: 'Policies',
  icon: DocumentTextIcon,
  sections: [
    {
      title: 'Policies',
      items: [
        {
          path: '/policies/acl',
          label: 'ACL Policies',
          icon: DocumentTextIcon,
        },
      ],
    },
  ],
};

const toolsSection: NavigationSection = {
  label: 'Tools',
  icon: TerminalIcon,
  sections: [
    {
      title: 'Tools',
      items: [
        {
          path: '/tools/wrap',
          label: 'Wrap',
        },
        {
          path: '/tools/lookup',
          label: 'Lookup',
        },
        {
          path: '/tools/unwrap',
          label: 'Unwrap',
        },
        {
          path: '/tools/rewrap',
          label: 'Rewrap',
        },
        {
          path: '/tools/random',
          label: 'Random',
        },
        {
          path: '/tools/hash',
          label: 'Hash',
        },
      ],
    },
  ],
};

export const navigationConfig: NavigationGroup[] = [
  {
    title: 'OpenBao',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: AnalyticsIcon,
      },
      {
        path: '/secrets',
        label: 'Secrets engines',
        icon: KeyIcon,
      },
      accessSection,
      policiesSection,
      toolsSection,
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        path: 'audit',
        label: 'Audit Logs',
        icon: ShieldIcon,
      },
      {
        path: '/settings/seal',
        label: 'Seal OpenBao',
        icon: LockClosedIcon,
      },
    ],
  },
];
