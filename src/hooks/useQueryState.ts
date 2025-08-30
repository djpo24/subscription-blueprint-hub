
import { useState, useCallback } from 'react';

export function useQueryState(key: string, defaultValue: string): [string, (value: string) => void] {
  const [state, setState] = useState(defaultValue);

  const setQueryState = useCallback((value: string) => {
    setState(value);
    // In a real implementation, you might want to update the URL query params
  }, []);

  return [state, setQueryState];
}
