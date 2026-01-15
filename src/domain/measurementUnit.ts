
// Single source of truth for the app code.
// Keep this in sync with the Prisma enum in schema.prisma.
export type MeasurementUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'piece'
  | 'slice'
  | 'pinch'
  | 'can'
  | 'packet'
  | 'to_taste'
  | 'other';