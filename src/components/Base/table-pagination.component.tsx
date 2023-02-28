import { TablePagination as MuiTablePagination, TablePaginationProps as MuiTablePaginationProps } from '@mui/material';
import React from 'react';
import { TablePaginationState } from '../../reducer';
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
