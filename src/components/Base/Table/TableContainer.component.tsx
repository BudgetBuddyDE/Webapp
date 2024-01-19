import React from 'react';
import {
  TableContainer as MuiTableContainer,
  type TableContainerProps,
  Table as MuiTable,
  type TableProps as MuiTableProps,
} from '@mui/material';

export type TTableContainerProps = React.PropsWithChildren<{
  tableContainerProps?: TableContainerProps;
  tableProps?: MuiTableProps;
}>;

export const TableContainer: React.FC<TTableContainerProps> = ({
  tableProps,
  tableContainerProps,
  children,
}) => {
  return (
    <MuiTableContainer {...tableContainerProps}>
      <MuiTable aria-label="Table" {...tableProps} sx={{ width: '100%', ...tableProps?.sx }}>
        {children}
      </MuiTable>
    </MuiTableContainer>
  );
};
