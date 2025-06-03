
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { CustomerFormDialog } from './CustomerFormDialog';
import { CustomerSearchInput } from './CustomerSearchInput';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';

interface CustomerSearchSelectorEditableProps {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
}

export function CustomerSearchSelectorEditable({ 
  selectedCustomerId, 
  onCustomerChange 
}: CustomerSearchSelectorEditableProps) {
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  const {
    searchTerm,
    showResults,
    filteredCustomers,
    selectedCustomerId: hookSelectedCustomerId,
    handleCustomerSelect,
    handleSearchChange,
    handleCustomerCreated,
    handleFocus,
    handleBlur
  } = useCustomerSearch(selectedCustomerId, onCustomerChange);

  return (
    <>
      <div className="relative">
        <Label htmlFor="customer-search">Cliente</Label>
        <div className="flex gap-2 mt-1">
          <CustomerSearchInput
            searchTerm={searchTerm}
            filteredCustomers={filteredCustomers}
            showResults={showResults}
            onSearchChange={handleSearchChange}
            onCustomerSelect={handleCustomerSelect}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerDialog(true)}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Selected customer validation */}
        {searchTerm && !hookSelectedCustomerId && (
          <div className="text-xs text-red-600 mt-1">
            Debe seleccionar un cliente de la lista
          </div>
        )}
      </div>

      <CustomerFormDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSuccess={handleCustomerCreated}
      />
    </>
  );
}
