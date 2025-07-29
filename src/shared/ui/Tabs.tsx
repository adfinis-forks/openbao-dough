import type React from 'react';
import { createContext, type ReactNode, useContext, useState } from 'react';
import './Tabs.css';

interface TabsContextValue {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  onValueChange,
  className = '',
}) => {
  const [activeValue, setActiveValue] = useState(defaultValue);

  const handleValueChange = (value: string) => {
    setActiveValue(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider
      value={{ activeValue, onValueChange: handleValueChange }}
    >
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = '',
}) => {
  return <div className={`tabs__list ${className}`}>{children}</div>;
};

export interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  value,
  className = '',
}) => {
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      className={`tabs__trigger ${isActive ? 'tabs__trigger--active' : ''} ${className}`}
      onClick={() => onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  children,
  value,
  className = '',
}) => {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  if (!isActive) return null;

  return <div className={`tabs__content ${className}`}>{children}</div>;
};
