import { Middleware, Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

const STORAGE_KEY = "filtros_tarefas";
const STORAGE_VERSION = "1.0";

interface StoredData {
  version: string;
  filters: RootState["filters"];
}

export const filterPersistenceMiddleware: Middleware<Dispatch<UnknownAction>, RootState> = (store) => (next) => (action: unknown) => {
  const result = next(action);

  if (action.type.startsWith("filters/")) {
    const state = store.getState() as RootState;
    const data: StoredData = {
      version: STORAGE_VERSION,
      filters: state.filters,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar filtros:", error);
    }
  }

  return result;
};

export function loadPersistedFilters(): RootState["filters"] | undefined {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return undefined;

    const storedData = JSON.parse(data) as StoredData;
    if (storedData.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }

    return storedData.filters;
  } catch (error) {
    console.error("Erro ao carregar filtros:", error);
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
} 