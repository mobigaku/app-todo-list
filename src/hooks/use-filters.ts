import { RootState } from "@/lib/store";
import {
    clearFilters,
    FilterState,
    setCategoryFilter,
    setDateRangeFilter,
    setPriorityFilter,
    setSearchFilter,
    setSortField,
    setSortOrder,
    setStatusFilter,
} from "@/lib/store/slices/filter-slice";
import { SortField, SortOrder } from "@/modules/task-list/types";
import { Priority, Status } from "@/src/types/prisma";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

export function useFilters() {
    const dispatch = useDispatch();
    const filters = useSelector<RootState, FilterState>(
        (state) => state.filters
    );

    const handleSetStatus = useCallback(
        (status: Status | "all") => {
            dispatch(setStatusFilter(status));
        },
        [dispatch]
    );

    const handleSetPriority = useCallback(
        (priority: Priority | "all") => {
            dispatch(setPriorityFilter(priority));
        },
        [dispatch]
    );

    const handleSetDateRange = useCallback(
        (dateRange: DateRange) => {
            dispatch(setDateRangeFilter(dateRange));
        },
        [dispatch]
    );

    const handleSetCategory = useCallback(
        (categoryId: string | "all") => {
            dispatch(setCategoryFilter(categoryId));
        },
        [dispatch]
    );

    const handleSetSearch = useCallback(
        (search: string) => {
            dispatch(setSearchFilter(search));
        },
        [dispatch]
    );

    const handleSetSortField = useCallback(
        (sortField: SortField) => {
            dispatch(setSortField(sortField));
        },
        [dispatch]
    );

    const handleSetSortOrder = useCallback(
        (sortOrder: SortOrder) => {
            dispatch(setSortOrder(sortOrder));
        },
        [dispatch]
    );

    const handleClear = useCallback(() => {
        dispatch(clearFilters());
    }, [dispatch]);

    return {
        filters,
        setStatus: handleSetStatus,
        setPriority: handleSetPriority,
        setDateRange: handleSetDateRange,
        setCategory: handleSetCategory,
        setSearch: handleSetSearch,
        setSortField: handleSetSortField,
        setSortOrder: handleSetSortOrder,
        clear: handleClear,
    };
}
