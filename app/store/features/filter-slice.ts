import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Priority, Status } from "@/types/prisma";

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface FilterState {
  status: Status | "all";
  priority: Priority | "all";
  dateRange: DateRange;
  categoryId: string | "all";
  search: string;
}

const initialState: FilterState = {
  status: "all",
  priority: "all",
  dateRange: {
    startDate: null,
    endDate: null,
  },
  categoryId: "all",
  search: "",
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<Status | "all">) => {
      state.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<Priority | "all">) => {
      state.priority = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | "all">) => {
      state.categoryId = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    clearFilters: (state) => {
      state.status = "all";
      state.priority = "all";
      state.dateRange = {
        startDate: null,
        endDate: null,
      };
      state.categoryId = "all";
      state.search = "";
    },
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setDateRangeFilter,
  setCategoryFilter,
  setSearchFilter,
  clearFilters,
} = filterSlice.actions;

export default filterSlice.reducer; 