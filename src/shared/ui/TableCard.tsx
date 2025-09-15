import type React from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import './TableCard.css';

export interface TableCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const TableCard: React.FC<TableCardProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <Card className={`table-card ${className}`}>
      <CardHeader>
        <CardTitle className="table-card__title">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
