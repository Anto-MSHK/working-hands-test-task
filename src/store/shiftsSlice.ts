import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Shift, ShiftsState, LocationCoordinates } from '../types';

const API_BASE_URL = 'https://mobile.handswork.pro/api';

export const fetchShifts = createAsyncThunk(
  'shifts/fetchShifts',
  async (coordinates: LocationCoordinates, { rejectWithValue }) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${API_BASE_URL}/shifts/map-list-unauthorized?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const shiftsWithIds = data.map((shift: any, index: number) => ({
        ...shift,
        id: shift.id || `shift_${index}_${Date.now()}`,
      }));

      return shiftsWithIds;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const initialState: ShiftsState = {
  data: [],
  loading: false,
  error: null,
  selectedShift: null,
};

const shiftsSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    setSelectedShift: (state, action: PayloadAction<Shift | null>) => {
      state.selectedShift = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
    
    clearShifts: (state) => {
      state.data = [];
      state.selectedShift = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shifts pending
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Fetch shifts fulfilled
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      
      // Fetch shifts rejected
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch shifts';
        state.data = [];
      });
  },
});

export const { setSelectedShift, clearError, clearShifts } = shiftsSlice.actions;

export default shiftsSlice.reducer;
