import { useState, useEffect } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  minLoadingTime?: number;
}

export function useLoadingState({ 
  initialLoading = true, 
  minLoadingTime = 800 
}: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [initialLoading, minLoadingTime]);

  return { isLoading, setIsLoading };
}
