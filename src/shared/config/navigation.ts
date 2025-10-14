

const accessSection = {
  label: 'Access',
  icon: '/document-text-outline.svg',
  sections: [
    {
      title: 'Authentication',
      items: [
        {
          path: '/access',
          label: 'Authentication methods',
          icon: '/people-outline.svg',
        },
        {
          path: '/access/mfa',
          label: 'Multi-factor authentication',
          icon: '/shield-outline.svg',
        },
        {
          path: '/access/oidc',
          label: 'OIDC provider',
          icon: '/settings-outline.svg',
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          path: '/access/namespaces',
          label: 'Namespaces',
          icon: '/file-tray-stacked-outline.svg',
        },
        {
          path: '/access/identity/groups',
          label: 'Groups',
          icon: '/people-outline.svg',
        },
        {
          path: '/access/identity/entities',
          label: 'Entities',
          icon: '/person-outline.svg',
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          path: '/access/leases/list',
          label: 'Leases',
          icon: '/refresh-outline.svg',
        },
      ],
    },
  ],
};

const policiesSection = {
  label: 'Policies',
  icon: '/document-text-outline.svg',
  sections: [
    {
      title: 'Policies',
      items: [
        {
          path: '/policies/acl',
          label: 'ACL Policies',
          icon: '/document-text-outline.svg',
        },
      ],
    },
  ],
};

const toolsSection = {
  label: 'Tools',
  icon: '/terminal-outline.svg',
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

export const navigationConfig = [
  {
    title: 'OpenBao',
    items: [
      {
        path: '/secrets',
        label: 'Secrets engines',
        icon: '/key-outline.svg',
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
        path: '/settings/seal',
        label: 'Seal OpenBao',
        icon: '/lock-closed-outline.svg',
      },
    ],
  },
];
