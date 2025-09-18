export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface WorkType {
  id: number;
  name: string;
  nameGt5: string;
  nameLt5: string;
  nameOne: string;
}

export interface Shift {
  id: string;
  logo: string;
  coordinates: Coordinates;
  address: string;
  companyName: string;
  dateStartByCity: string;
  timeStartByCity: string;
  timeEndByCity: string;
  currentWorkers: number;
  planWorkers: number;
  workTypes: WorkType[];
  priceWorker: number;
  bonusPriceWorker: number;
  customerFeedbacksCount: string;
  customerRating: number | null;
  isPromotionEnabled: boolean;
}

export interface ApiResponse {
  data: Shift[];
  status: number;
}

export interface ShiftsState {
  data: Shift[];
  loading: boolean;
  error: string | null;
  selectedShift: Shift | null;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}
