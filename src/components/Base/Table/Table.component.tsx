import {DeleteRounded} from '@mui/icons-material';
import {Box, Button, Skeleton, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {CircularProgress} from '@/components/Loading';

import {
  type IPaginationHandler,
  InitialPaginationState,
  Pagination,
  PaginationReducer,
  usePagination,
} from '../Pagination';
import {type ISelectionHandler, SelectAll} from '../Select';
import {ActionPaper, Card, NoResults, type TNoResultsProps} from '../index';
import {TableContainer} from './TableContainer.component';

export type TTableProps<T> = {
  title?: string;
  subtitle?: string;
  headerCells: string[];
  renderHeaderCell?: (headerCell: string) => React.ReactNode;
  data: T[];
  renderRow: (row: T) => React.ReactNode;
  tableActions?: React.ReactNode;
  isLoading?: boolean;
  noResultsMessage?: TNoResultsProps['text'];
} & (
  | {
      withSelection: true;
      onSelectAll: ISelectionHandler<T>['onSelectAll'];
      onDelete?: () => void;
      amountOfSelectedEntities: number;
    }
  | {withSelection?: false}
);

interface ITableHandler {
  pagination: IPaginationHandler;
}

export const Table = <T,>({
  title,
  subtitle,
  headerCells,
  renderHeaderCell,
  data,
  renderRow,
  tableActions,
  isLoading = false,
  noResultsMessage = 'No records found',
  ...props
}: TTableProps<T>) => {
  const [state, dispatch] = React.useReducer(PaginationReducer, InitialPaginationState);
  const [checked, setChecked] = React.useState(false);
  const currentPageData = usePagination(data, state);

  const handler: ITableHandler = {
    pagination: {
      onPageChange(newPage) {
        dispatch({type: 'CHANGE_PAGE', page: newPage});
      },
      onRowsPerPageChange(rowsPerPage) {
        dispatch({type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage});
      },
    },
  };

  React.useLayoutEffect(() => {
    setChecked(false);
    if (!props.withSelection) return;
    if (props.amountOfSelectedEntities === data.length) {
      setChecked(true);
    }
  }, [props, data]);

  return (
    <Card sx={{p: 0}}>
      {(title || subtitle) && (
        <Card.Header sx={{px: 2, pt: 2}}>
          <Box>
            {title && <Card.Title>{title || 'Table'}</Card.Title>}
            {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
          </Box>
          {tableActions && (
            <Card.HeaderActions sx={{mt: {xs: 1, md: 0}, width: {md: 'unset'}}}>
              <ActionPaper sx={{display: 'flex', flexDirection: 'row'}}>
                {isLoading ? (
                  <Skeleton variant="rounded" sx={{width: {xs: '5rem', md: '10rem'}, height: '2.3rem'}} />
                ) : (
                  tableActions
                )}
              </ActionPaper>
            </Card.HeaderActions>
          )}
        </Card.Header>
      )}
      <Card.Body sx={{px: 0}}>
        {isLoading ? (
          <CircularProgress />
        ) : currentPageData.length > 0 ? (
          <React.Fragment>
            {props.withSelection && props.amountOfSelectedEntities > 0 && (
              <Box sx={{px: 2, pt: 1.5}}>
                {props.onDelete && (
                  <Button
                    startIcon={<DeleteRounded />}
                    onClick={() => {
                      if (props.onDelete) props.onDelete();
                    }}
                    sx={{mr: 1}}>
                    Delete
                  </Button>
                )}
              </Box>
            )}

            <TableContainer>
              <TableHead>
                <TableRow>
                  {props.withSelection && (
                    <SelectAll
                      checked={checked}
                      indeterminate={props.amountOfSelectedEntities > 0 && props.amountOfSelectedEntities < data.length}
                      onChange={(_event, checked) => {
                        const indeterminate =
                          props.amountOfSelectedEntities > 0 && props.amountOfSelectedEntities < data.length;
                        props.onSelectAll(indeterminate ? false : checked);
                      }}
                      wrapWithTableCell
                    />
                  )}

                  {headerCells.map(headerCell =>
                    renderHeaderCell ? (
                      renderHeaderCell(headerCell)
                    ) : (
                      <TableCell
                        key={headerCell.replaceAll(' ', '_').toLowerCase()}
                        size={AppConfig.table.cellSize}
                        sx={{whiteSpace: 'nowrap'}}>
                        <Typography fontWeight={'bold'}>{headerCell}</Typography>
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>{currentPageData.map(renderRow)}</TableBody>
            </TableContainer>
          </React.Fragment>
        ) : (
          <NoResults text={noResultsMessage} sx={{mx: 2, mt: 2}} />
        )}
      </Card.Body>
      <Card.Footer sx={{p: 2}}>
        <Pagination
          {...state}
          count={data.length}
          onPageChange={handler.pagination.onPageChange}
          onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
        />
      </Card.Footer>
    </Card>
  );
};
