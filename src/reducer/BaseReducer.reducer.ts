import type { uuid } from '@/types';

export type BaseReducerState<T> = {
    data: T | null;
    fetched: boolean;
    fetchedAt: Date | null;
    fetchedBy: uuid;
};

export type BaseReducerAction<T> =
    | { type: 'FETCH_DATA'; data: BaseReducerState<T>['data']; fetchedBy: BaseReducerState<T>['fetchedBy'] }
    | { type: 'UPDATE_DATA'; data: BaseReducerState<T>['data'] }
    | { type: 'CLEAR_DATA' };

export function generateBaseState<T>(): BaseReducerState<T> {
    return {
        data: null,
        fetched: false,
        fetchedAt: null,
        fetchedBy: '',
    };
}

export function BaseReducer<T>(state: BaseReducerState<T>, action: BaseReducerAction<T>): BaseReducerState<T> {
    switch (action.type) {
        case 'FETCH_DATA':
            return {
                ...state,
                fetched: true,
                fetchedAt: new Date(),
                fetchedBy: action.fetchedBy,
                data: action.data,
            };

        case 'UPDATE_DATA':
            return {
                ...state,
                fetched: true,
                fetchedAt: new Date(),
                data: action.data,
            };

        case 'CLEAR_DATA':
            return generateBaseState<T>();

        default:
            throw new Error('Trying to execute unknown action');
    }
}
