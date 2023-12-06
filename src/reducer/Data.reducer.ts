import { uuid } from '@/type';

export type DataReducerState<T> = {
  data: T | null;
  fetched: boolean;
  fetchedAt: Date | null;
  fetchedBy: uuid;
};

export function GenerateDefaultDataState<T>(): DataReducerState<T> {
  return {
    data: null,
    fetched: false,
    fetchedAt: null,
    fetchedBy: '',
  };
}

export type DataReducerAction<T> =
  | { type: 'FETCH_DATA'; data: DataReducerState<T>['data']; fetchedBy: DataReducerState<T>['fetchedBy'] }
  | { type: 'UPDATE_DATA'; data: DataReducerState<T>['data'] }
  | { type: 'CLEAR_DATA' };

export function DataReducer<T>(state: DataReducerState<T>, action: DataReducerAction<T>): DataReducerState<T> {
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
      return GenerateDefaultDataState<T>();

    default:
      throw new Error('Trying to execute unknown action');
  }
}
