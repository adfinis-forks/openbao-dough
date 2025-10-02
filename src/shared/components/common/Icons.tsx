import type React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const defaultProps: IconProps = {
  size: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Shield: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Key: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l2.25-2.25L21 2l-2.25 3.75L15.5 7.5z" />
  </svg>
);

export const Users: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Activity: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const Database: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const Lock: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Unlock: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const Plus: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const MoreHorizontal: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const Clock: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const TrendingUp: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const Server: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

export const Globe: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const FileText: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const Copy: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const Edit: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const Trash2: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const Download: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
);

export const X: React.FC<IconProps> = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUp: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
