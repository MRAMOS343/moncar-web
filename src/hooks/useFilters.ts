import { useState, useCallback } from 'react';

export interface FilterState {
  search: string;
  marca: string;
  categoria: string;
  metodoPago: string;
  dateRange: string;
}

const defaultFilters: FilterState = {
  search: '',
  marca: 'all',
  categoria: 'all',
  metodoPago: 'all',
  dateRange: '30d',
};

/**
 * Hook personalizado para manejar filtros
 */
export function useFilters(initialFilters: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clearFilter = useCallback((key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: defaultFilters[key] }));
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(
      key => filters[key as keyof FilterState] !== defaultFilters[key as keyof FilterState]
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
  };
}
