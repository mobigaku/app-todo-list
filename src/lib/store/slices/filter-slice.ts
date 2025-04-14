import { SortField, SortOrder } from "@/modules/task-list/types";
import { Priority, Status } from "@/src/types/prisma";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

export interface FilterState {
    status: Status | "all";
    priority: Priority | "all";
    dateRange: DateRange;
    categoryId: string | "all";
    search: string;
    sortField: SortField;
    sortOrder: SortOrder;
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
    sortField: "name",
    sortOrder: "asc",
};

export const filterSlice = createSlice({
    name: "filters",
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
        setSortField: (state, action: PayloadAction<SortField>) => {
            state.sortField = action.payload;
        },
        setSortOrder: (state, action: PayloadAction<SortOrder>) => {
            state.sortOrder = action.payload;
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
            state.sortField = "name";
            state.sortOrder = "asc";
        },
    },
});

export const {
    setStatusFilter,
    setPriorityFilter,
    setDateRangeFilter,
    setCategoryFilter,
    setSearchFilter,
    setSortField,
    setSortOrder,
    clearFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
