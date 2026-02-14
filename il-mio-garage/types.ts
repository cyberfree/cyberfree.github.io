
export enum TireType {
  SUMMER = 'Estivi',
  WINTER = 'Invernali',
  ALL_SEASON = 'Quattro Stagioni'
}

export interface Car {
  id: string;
  owner: string;
  plate: string;
  chassis: string;
  photoUrl: string;
  registrationDate: string;
  taxExpiry: string;
  insuranceExpiry: string;
  revisionExpiry: string;
  serviceExpiry: string;
  tires: TireType;
  tireSize: string;
  notes?: string;
}

export type ViewState = 'dashboard' | 'list' | 'add' | 'detail' | 'settings';
