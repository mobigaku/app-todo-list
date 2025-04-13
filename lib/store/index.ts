import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./slices/filter-slice";
import { filterPersistenceMiddleware, loadPersistedFilters } from "./middleware/filter-persistence";

export const store = configureStore({
  reducer: {
    filters: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(filterPersistenceMiddleware),
  preloadedState: {
    filters: loadPersistedFilters() ?? undefined,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 