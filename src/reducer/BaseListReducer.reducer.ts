import { genericObjectHasNumericId } from '../utils/';
import { BaseReducer, BaseReducerAction, BaseReducerState } from './BaseReducer.reducer';

export type BaseListReducerState<T> = BaseReducerState<T[]>;

export type BaseListReducerAction<T> =
    | BaseReducerAction<T[]>
    | { type: 'ADD_ITEM'; entry: T }
    | { type: 'UPDATE_BY_ID'; entry: T }
    | { type: 'REMOVE_BY_ID'; id: number }
    | { type: 'REMOVE_MULTIPLE_BY_ID'; ids: number[] };

export function BaseListReducer<T>(
    state: BaseListReducerState<T>,
    action: BaseListReducerAction<T>
): BaseListReducerState<T> {
    switch (action.type) {
        case 'CLEAR_DATA':
        case 'FETCH_DATA':
        case 'UPDATE_DATA':
            return BaseReducer(state, action);

        case 'ADD_ITEM':
            return {
                ...state,
                data: state.data !== null ? [action.entry, ...state.data] : [action.entry],
            };

        case 'UPDATE_BY_ID':
            if (state.data === null) {
                console.warn("Can't update an item when the state is NULL");
                return state;
            }
            if (state.data.length === 0) {
                console.warn("Can't update an item from an empty list");
                return state;
            }

            if (genericObjectHasNumericId(action.entry)) {
                return {
                    ...state,
                    data: state.data.map((value) => {
                        if (genericObjectHasNumericId(value) && (value as any).id === (action.entry as any).id) {
                            return action.entry;
                        } else return value;
                    }),
                };
            } else return state;

        case 'REMOVE_BY_ID':
            if (state.data === null) {
                console.warn("Can't remove an item from NULL");
                return state;
            }

            if (state.data.length === 0) {
                console.warn("Can't remove an item from an empty list");
                return state;
            }
            return {
                ...state,
                data: state.data.filter((entry) => {
                    return genericObjectHasNumericId(entry) && (entry as any).id !== action.id;
                }),
            };

        case 'REMOVE_MULTIPLE_BY_ID':
            if (state.data === null) {
                console.warn("Can't remove an item from NULL");
                return state;
            }

            if (state.data.length === 0) {
                console.warn("Can't remove an item from an empty list");
                return state;
            }

            return {
                ...state,
                data: state.data.filter(
                    (entry) => genericObjectHasNumericId(entry) && !action.ids.includes((entry as any).id)
                ),
            };

        default:
            throw new Error('Trying to execute unknown action');
    }
}
