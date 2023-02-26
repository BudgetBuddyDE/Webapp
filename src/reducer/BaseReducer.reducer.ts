export type BaseReducerState<T> = {
  data: T | null;
  fetched: boolean;
  fetchedAt: Date | null;
};

export type BaseReducerAction<T> =
  | { type: 'FETCH_DATA'; data: BaseReducerState<T>['data'] }
  | { type: 'REFRESH_DATA'; data: BaseReducerState<T>['data'] }
  | { type: 'CLEAR_DATA'; data: BaseReducerState<T>['data'] };

export function generateBaseState<T>(): BaseReducerState<T> {
  return {
    data: null,
    fetched: false,
    fetchedAt: null,
  };
}

export function BaseReducer<T>(
  state: BaseReducerState<T>,
  action: BaseReducerAction<T>
): BaseReducerState<T> {
  switch (action.type) {
    case 'FETCH_DATA':
    case 'REFRESH_DATA':
      return {
        ...state,
        fetched: true,
        fetchedAt: new Date(),
        data: action.data,
      };

    case 'CLEAR_DATA':
      return {
        ...state,
        fetched: false,
        fetchedAt: null,
        data: null,
      };

    default:
      throw new Error('Trying to execute unknown action');
  }
}
