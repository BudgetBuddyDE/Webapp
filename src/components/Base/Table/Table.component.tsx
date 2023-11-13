import React from 'react';
import {
  TableContainer,
  type TableContainerProps,
  Table as MuiTable,
  type TableProps as MuiTableProps,
} from '@mui/material';

export type TTable = React.PropsWithChildren<{
  tableContainerProps?: TableContainerProps;
  tableProps?: MuiTableProps;
}>;

export const Table: React.FC<TTable> = ({ tableProps, tableContainerProps, children }) => {
  return (
    <TableContainer {...tableContainerProps}>
      <MuiTable aria-label="Table" {...tableProps} sx={{ minWidth: 650, ...tableProps?.sx }}>
        {children}
      </MuiTable>
    </TableContainer>
  );
};
