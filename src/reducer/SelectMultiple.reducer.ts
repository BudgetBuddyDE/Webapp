import type { DialogType } from '@/components';

export type SelectMultipleState = {
    selected: number[];
    dialog: { show: false } | { show: true; type: DialogType };
};

export function generateInitialState(): SelectMultipleState {
    return {
        selected: [],
        dialog: { show: false },
    };
}

export type SelectMultipleAction =
    | { type: 'SET_SELECTED'; selected: number[] }
    | { type: 'ADD_ITEM'; item: number }
    | { type: 'REMOVE_ITEM'; item: number }
    | { type: 'OPEN_DIALOG'; dialog: DialogType }
    | { type: 'CLOSE_DIALOG_AFTER_DELETE' }
    | { type: 'CLOSE_DIALOG' };

export function SelectMultipleReducer(state: SelectMultipleState, action: SelectMultipleAction): SelectMultipleState {
    switch (action.type) {
        case 'SET_SELECTED':
            return { ...state, selected: action.selected };

        case 'ADD_ITEM':
            return { ...state, selected: [...state.selected, action.item] };

        case 'REMOVE_ITEM':
            return { ...state, selected: state.selected.filter((id) => id !== action.item) };

        case 'OPEN_DIALOG':
            return { ...state, dialog: { show: true, type: action.dialog } };

        case 'CLOSE_DIALOG_AFTER_DELETE':
            return { ...state, selected: [], dialog: { show: false } };

        case 'CLOSE_DIALOG':
            return { ...state, dialog: { show: false } };

        default:
            throw new Error('Trying to execute unknown action');
    }
}
