import React from 'react';
import { ActionPaper } from '@/components/Base';
import { TablePaginationState } from '@/reducer';
import { TablePagination as MuiTablePagination } from '@mui/material';
import type { TablePaginationProps as MuiTablePaginationProps } from '@mui/material';

export type TablePaginationProps = {
    count: MuiTablePaginationProps['count'];
    page: MuiTablePaginationProps['page'];
    onPageChange: (newPage: number) => void;
    rowsPerPage?: MuiTablePaginationProps['rowsPerPage'];
    labelRowsPerPage?: MuiTablePaginationProps['labelRowsPerPage'];
    onRowsPerPageChange: (rowsPerPage: number) => void;
};

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
