import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterState {
  [categoryId: string]: {
    status: string | null;
    startDate: string | null;
    endDate: string | null;
    priority: string | null;
  };
}

const initialState: FilterState = {};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{
        categoryId: string;
        filters: {
          status: string | null;
          startDate: string | null;
          endDate: string | null;
          priority: string | null;
        };
      }>
    ) => {
      const { categoryId, filters } = action.payload;
      state[categoryId] = filters;
    },
    clearFilters: (state, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      delete state[categoryId];
    },
  },
});

export const { setFilters, clearFilters } = filterSlice.actions;
export default filterSlice.reducer; 