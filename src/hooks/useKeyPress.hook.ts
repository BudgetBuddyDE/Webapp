import { useEffect } from 'react';
import { useScreenSize } from './useScreenSize.hook';

export const useKeyPress = (
  targetKey: string,
  callback: (event: KeyboardEvent) => void,
  options?: {
    requiresCtrl?: boolean;
  }
) => {
  const screenSize = useScreenSize();

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === targetKey.toLowerCase()) {
      if (options?.requiresCtrl && !event.ctrlKey) {
        return;
      }
      callback(event);
    }
  };

  useEffect(() => {
    if (screenSize === 'small') return;

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, callback, screenSize, options]);
};
