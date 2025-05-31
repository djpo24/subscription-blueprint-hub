
import { locationData, City, Department } from '@/types/LocationData';

export interface CityWithDepartment extends City {
  departmentName: string;
  departmentId: string;
}

export const getAllCities = (): CityWithDepartment[] => {
  const allCities: CityWithDepartment[] = [];
  
  // Solo incluir Colombia que tiene departamentos
  const colombia = locationData.find(country => country.id === 'CO');
  
  if (colombia?.departments) {
    colombia.departments.forEach(department => {
      department.cities.forEach(city => {
        allCities.push({
          ...city,
          departmentName: department.name,
          departmentId: department.id
        });
      });
    });
  }
  
  // Ordenar ciudades alfabéticamente
  return allCities.sort((a, b) => a.name.localeCompare(b.name));
};

export const findCityById = (cityId: string): CityWithDepartment | undefined => {
  return getAllCities().find(city => city.id === cityId);
};

export const findDepartmentByCity = (cityId: string): Department | undefined => {
  const cityWithDept = findCityById(cityId);
  if (!cityWithDept) return undefined;
  
  const colombia = locationData.find(country => country.id === 'CO');
  return colombia?.departments?.find(dept => dept.id === cityWithDept.departmentId);
};
