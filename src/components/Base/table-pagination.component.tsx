import {
  TablePagination as MuiTablePagination,
  TablePaginationProps as MuiTablePaginationProps,
} from '@mui/material';
import React from 'react';
import { ActionPaper } from './action-paper.component';

export interface TablePaginationProps {
  count: MuiTablePaginationProps['count'];
  page: MuiTablePaginationProps['page'];
  onPageChange: (newPage: number) => void;
  rowsPerPage?: MuiTablePaginationProps['rowsPerPage'];
  labelRowsPerPage?: MuiTablePaginationProps['labelRowsPerPage'];
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export interface TablePaginationHandler {
  onPageChange: TablePaginationProps['onPageChange'];
  onRowsPerPageChange: TablePaginationProps['onRowsPerPageChange'];
}

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

export const RowsPerPageOptions = [10, 25, 50, 100];

export const InitialTablePaginationState: TablePaginationState = {
  page: 0,
  rowsPerPage: RowsPerPageOptions[0],
};

export const TablePagination: React.FC<TablePaginationProps> = ({
  count,
  page,
  onPageChange,
  rowsPerPage = RowsPerPageOptions[0],
  labelRowsPerPage = 'Rows:',
  onRowsPerPageChange,
}) => {
  return (
    <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
      <MuiTablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(event, page) => onPageChange(page)}
        labelRowsPerPage={labelRowsPerPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
      />
    </ActionPaper>
  );
};
