import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  setStatusFilter,
  setPriorityFilter,
  setDateRangeFilter,
  setCategoryFilter,
  setSearchFilter,
  clearFilters,
} from "@/lib/store/slices/filter-slice";
import { Priority, Status } from "@/app/types/prisma";

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export function useFilters() {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const setStatus = (status: Status | "all") => {
    dispatch(setStatusFilter(status));
  };

  const setPriority = (priority: Priority | "all") => {
    dispatch(setPriorityFilter(priority));
  };

  const setDateRange = (dateRange: DateRange) => {
    dispatch(setDateRangeFilter(dateRange));
  };

  const setCategory = (categoryId: string | "all") => {
    dispatch(setCategoryFilter(categoryId));
  };

  const setSearch = (search: string) => {
    dispatch(setSearchFilter(search));
  };

  const clear = () => {
    dispatch(clearFilters());
  };

  return {
    filters,
    setStatus,
    setPriority,
    setDateRange,
    setCategory,
    setSearch,
    clear,
  };
} 