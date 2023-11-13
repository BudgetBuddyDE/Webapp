import React from 'react';
import {
  TablePagination as MuiTablePagination,
  type TablePaginationProps as MuiTablePaginationProps,
} from '@mui/material';
import { type TPaginationState } from './Pagination.reducer';
import { ActionPaper } from '../ActionPaper.component';

export type TPaginationProps = Pick<
  MuiTablePaginationProps,
  'count' | 'page' | 'rowsPerPage' | 'labelRowsPerPage'
> & {
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

export interface PaginationHandler {
  onPageChange: TPaginationProps['onPageChange'];
  onRowsPerPageChange: TPaginationProps['onRowsPerPageChange'];
}

export const RowsPerPageOptions = [10, 25, 50, 100];

export const InitialPaginationState: TPaginationState = {
  page: 0,
  rowsPerPage: RowsPerPageOptions[0],
};

export const Pagination: React.FC<TPaginationProps> = ({
  count,
  page,
  onPageChange,
  rowsPerPage = RowsPerPageOptions[0],
  labelRowsPerPage = 'Rows:',
  onRowsPerPageChange,
}) => {
  return (
    <ActionPaper sx={{ width: 'fit-content', ml: 'auto', pr: 0.5 }}>
      <MuiTablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_event, page) => onPageChange(page)}
        labelRowsPerPage={labelRowsPerPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
      />
    </ActionPaper>
  );
};
