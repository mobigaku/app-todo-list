import { Dispatch, Middleware, UnknownAction } from "@reduxjs/toolkit";
import { FilterState } from "../slices/filter-slice";

const STORAGE_KEY = "filtros_tarefas";
const STORAGE_VERSION = "1.0";

interface StoredData {
    version: string;
    filters: FilterState;
}

interface AppState {
    filters: FilterState;
}

const isBrowser = typeof window !== "undefined";

export const filterPersistenceMiddleware: Middleware<
    Dispatch<UnknownAction>,
    AppState,
    Dispatch<UnknownAction>
> = (api) => (next) => (action) => {
    const result = next(action);

    if (
        isBrowser &&
        typeof action === "object" &&
        action !== null &&
        "type" in action &&
        typeof action.type === "string" &&
        action.type.startsWith("filters/")
    ) {
        const state = api.getState();
        const data: StoredData = {
            version: STORAGE_VERSION,
            filters: state.filters,
        };

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Erro ao salvar filtros:", error);
        }
    }

    return result;
};

export function loadPersistedFilters(): FilterState | undefined {
    if (!isBrowser) {
        return undefined;
    }

    try {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (!data) return undefined;

        const storedData = JSON.parse(data) as StoredData;
        if (storedData.version !== STORAGE_VERSION) {
            window.localStorage.removeItem(STORAGE_KEY);
            return undefined;
        }

        return storedData.filters;
    } catch (error) {
        console.error("Erro ao carregar filtros:", error);
        window.localStorage.removeItem(STORAGE_KEY);
        return undefined;
    }
}
