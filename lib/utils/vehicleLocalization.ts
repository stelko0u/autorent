type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function normalize(value?: string | null) {
  return (value || '').trim().toUpperCase();
}

export function carTypeKey(value?: string | null) {
  switch (normalize(value)) {
    case 'SEDAN':
      return 'sedan';
    case 'HATCHBACK':
      return 'hatchback';
    case 'SUV':
      return 'suv';
    case 'COUPE':
      return 'coupe';
    case 'CONVERTIBLE':
    case 'CABRIO':
      return 'convertible';
    case 'WAGON':
    case 'COMBI':
      return 'wagon';
    case 'VAN':
      return 'van';
    case 'PICKUP':
      return 'pickup';
    case 'OTHER':
      return 'other';
    default:
      return null;
  }
}

export function transmissionKey(value?: string | null) {
  switch (normalize(value)) {
    case 'AUTOMATIC':
      return 'automatic';
    case 'MANUAL':
      return 'manual';
    case 'SEMI_AUTOMATIC':
      return 'semiAutomatic';
    case 'CVT':
      return 'cvt';
    case 'OTHER':
      return 'other';
    default:
      return null;
  }
}

export function fuelTypeKey(value?: string | null) {
  switch (normalize(value)) {
    case 'PETROL':
      return 'petrol';
    case 'DIESEL':
      return 'diesel';
    case 'ELECTRICITY':
    case 'ELECTRIC':
      return 'electric';
    case 'HYBRID':
      return 'hybrid';
    case 'OTHER':
      return 'other';
    default:
      return null;
  }
}

export function localizeCarType(t: TranslateFn, value?: string | null) {
  const key = carTypeKey(value);
  return key ? t(`vehicle.bodyTypes.${key}`) : value || '-';
}

export function localizeTransmission(t: TranslateFn, value?: string | null) {
  const key = transmissionKey(value);
  return key ? t(`vehicle.transmissions.${key}`) : value || '-';
}

export function localizeFuelType(t: TranslateFn, value?: string | null) {
  const key = fuelTypeKey(value);
  return key ? t(`vehicle.fuelTypes.${key}`) : value || '-';
}
