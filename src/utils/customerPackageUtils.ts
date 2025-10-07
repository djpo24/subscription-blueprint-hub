// Utility functions for customer package operations

interface PackageWithCustomer {
  customer_id: string;
  [key: string]: any;
}

/**
 * Determines if a package is the first delivery for a customer
 * @param customerId - The customer's ID
 * @param allPackages - All packages in the current view/context
 * @returns true if this is the customer's first package
 */
export function isFirstPackageForCustomer(
  customerId: string,
  allPackages: PackageWithCustomer[]
): boolean {
  if (!customerId || !allPackages || allPackages.length === 0) {
    return false;
  }

  const customerPackages = allPackages.filter(
    pkg => pkg.customer_id === customerId
  );

  return customerPackages.length === 1;
}

/**
 * Gets the count of packages for a specific customer
 * @param customerId - The customer's ID
 * @param allPackages - All packages in the current view/context
 * @returns number of packages for the customer
 */
export function getCustomerPackageCount(
  customerId: string,
  allPackages: PackageWithCustomer[]
): number {
  if (!customerId || !allPackages) {
    return 0;
  }

  return allPackages.filter(pkg => pkg.customer_id === customerId).length;
}
