export interface Shift {
  id: string;
  logo: string;
  address: string;
  companyName: string;
  dateStartByCity: string;
  timeStartByCity: string;
  timeEndByCity: string;
  currentWorkers: number;
  planWorkers: number;
  workTypes: { name: string }[];
  priceWorker: number;
  customerFeedbacksCount: number;
  customerRating: number;
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
