import type React from 'react';
import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent } from '../../shared/ui/Card';
import { ChevronDown, ChevronUp } from '../../shared/ui/Icons';
import './AuthMethodOptions.css';

interface AuthMethodOptionsProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuthMethodOptions: React.FC<AuthMethodOptionsProps> = ({
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`auth-method-options ${className}`}>
      <Card className="auth-method-options__card">
        <Button
          variant="ghost"
          onClick={toggleDropdown}
          className="auth-method-options__toggle"
          icon={isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          iconPosition="right"
        >
          {isOpen ? 'Hide Method Options' : 'Method Options'}
        </Button>

        {isOpen && (
          <CardContent className="auth-method-options__content">
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
