import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Shift, ShiftsState, LocationCoordinates, ApiResponse } from '../types';

const API_BASE_URL = 'https://mobile.handswork.pro/api';

export const fetchShifts = createAsyncThunk(
  'shifts/fetchShifts',
  async (coordinates: LocationCoordinates, { rejectWithValue }) => {
    try {
      const apiUrl = `${API_BASE_URL}/shifts/map-list-unauthorized?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const shiftsArray = data.data || [];

      const shiftsWithIds = shiftsArray.map((shift: any, index: number) => ({
        ...shift,
        id: shift.id || `shift_${index}_${Date.now()}`,
      }));

      return shiftsWithIds;
    } catch (error) {
      console.error('Fetch shifts error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return rejectWithValue(
            'Request timed out. Please check your internet connection and try again.',
          );
        } else if (error.message.includes('Network')) {
          return rejectWithValue(
            'Network error. Please check your internet connection and try again.',
          );
        } else if (error.message.includes('HTTP error')) {
          return rejectWithValue(
            `Server error: ${error.message}. Please try again later.`,
          );
        } else if (error.message.includes('JSON')) {
          return rejectWithValue(
            'Invalid server response. Please try again later.',
          );
        }
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred. Please try again.');
    }
  },
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

    clearError: state => {
      state.error = null;
    },

    clearShifts: state => {
      state.data = [];
      state.selectedShift = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchShifts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch shifts';
        state.data = [];
      });
  },
});

export const { setSelectedShift, clearError, clearShifts } =
  shiftsSlice.actions;

export default shiftsSlice.reducer;
