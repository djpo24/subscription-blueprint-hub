
import { useState, useMemo } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  created_at: string;
  package_count: number;
}

interface UseCustomerPaginationProps {
  customers: Customer[];
  pageSize?: number;
}

export function useCustomerPagination({ customers, pageSize = 200 }: UseCustomerPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(customers.length / pageSize);
  
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return customers.slice(startIndex, endIndex);
  }, [customers, currentPage, pageSize]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when customers change
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedCustomers,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
    pageSize,
    totalCustomers: customers.length
  };
}
