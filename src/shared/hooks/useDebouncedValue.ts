import { useEffect, useState } from 'react';

// Hook: useDebouncedValue
// Delays updating the returned value until after the specified delay has passed
// since the last time the input value changed.
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
