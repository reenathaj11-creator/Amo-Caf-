import { useEffect, useCallback } from 'react';

export function useKeyPress(key: string, action: () => void) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Allow lowercase and uppercase comparisons just in case, but prefer exact for F-keys
      if (e.key === key || e.code === key) {
        e.preventDefault();
        action();
      }
    },
    [action, key]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
