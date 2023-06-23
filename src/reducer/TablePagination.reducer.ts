export type TablePaginationState = {
    page: number;
    rowsPerPage: number;
};

export type TablePaginationAction =
    | { type: 'CHANGE_PAGE'; page: number }
    | { type: 'CHANGE_ROWS_PER_PAGE'; rowsPerPage: number };

export function TablePaginationReducer(state: TablePaginationState, action: TablePaginationAction) {
    switch (action.type) {
        case 'CHANGE_PAGE':
            return {
                ...state,
                page: action.page,
            };

        case 'CHANGE_ROWS_PER_PAGE':
            return {
                ...state,
                rowsPerPage: action.rowsPerPage,
                page: 0,
            };

        default:
            throw new Error('Trying to execute unknown action');
    }
}
