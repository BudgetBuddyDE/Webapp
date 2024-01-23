import React from 'react';
import {
  Box,
  Button,
  Skeleton,
  Slide,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ActionPaper, Card, NoResults } from '../index';
import {
  type IPaginationHandler,
  InitialPaginationState,
  Pagination,
  usePagination,
  PaginationReducer,
} from '../Pagination';
import { TableContainer } from './TableContainer.component';
import { CircularProgress } from '@/components/Loading';
import { type ISelectionHandler, SelectAll } from '../Select';
import { DeleteRounded } from '@mui/icons-material';

export type TTableProps<T> = {
  title?: string;
  subtitle?: string;
  headerCells: string[];
  renderHeaderCell?: (headerCell: string) => React.ReactNode;
  data: T[];
  renderRow: (row: T) => React.ReactNode;
  tableActions?: React.ReactNode;
  isLoading?: boolean;
} & (
  | {
      withSelection: true;
      onSelectAll: ISelectionHandler<T>['onSelectAll'];
      onDelete?: () => void;
      amountOfSelectedEntities: number;
    }
  | { withSelection?: false }
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
  ...props
}: TTableProps<T>) => {
  const [state, dispatch] = React.useReducer(PaginationReducer, InitialPaginationState);
  const [checked, setChecked] = React.useState(false);
  const currentPageData = usePagination(data, state);

  const handler: ITableHandler = {
    pagination: {
      onPageChange(newPage) {
        dispatch({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        dispatch({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
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
    <React.Fragment>
      {props.withSelection && props.onDelete && (
        // render using portal
        <Slide
          direction="up"
          in={props.withSelection && props.amountOfSelectedEntities > 0}
          mountOnEnter
          unmountOnExit
        >
          <ActionPaper
            sx={{
              zIndex: 1,
              // position: 'absolute',
              // bottom: { xs: '1rem', md: '2rem' },
              // left: { xs: '50%', md: '50%' },
              // transform: 'translateX(-50%)',
              px: 3,
              py: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: '2rem',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Typography fontWeight={'bolder'} sx={{ mr: 1 }}>
                Actions
              </Typography>
              {props.onDelete && (
                <Button
                  startIcon={<DeleteRounded />}
                  onClick={() => {
                    if (props.withSelection && props.onDelete) props.onDelete();
                  }}
                >
                  Delete
                </Button>
              )}
              {props.onDelete && (
                <Button
                  startIcon={<DeleteRounded />}
                  onClick={() => {
                    if (props.withSelection && props.onDelete) props.onDelete();
                  }}
                >
                  Delete
                </Button>
              )}
              {props.onDelete && (
                <Button
                  startIcon={<DeleteRounded />}
                  onClick={() => {
                    if (props.withSelection && props.onDelete) props.onDelete();
                  }}
                >
                  Delete
                </Button>
              )}
            </Box>
          </ActionPaper>
        </Slide>
      )}

      <Card sx={{ p: 0 }}>
        {(title || subtitle) && (
          <Card.Header sx={{ px: 2, pt: 2 }}>
            <Box>
              {title && <Card.Title>{title || 'Table'}</Card.Title>}
              {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
            </Box>
            {tableActions && (
              <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { md: 'unset' } }}>
                <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                  {isLoading ? (
                    <Skeleton
                      variant="rounded"
                      sx={{ width: { xs: '5rem', md: '10rem' }, height: '2.3rem' }}
                    />
                  ) : (
                    tableActions
                  )}
                </ActionPaper>
              </Card.HeaderActions>
            )}
          </Card.Header>
        )}
        <Card.Body sx={{ px: 0 }}>
          {isLoading ? (
            <CircularProgress />
          ) : currentPageData.length > 0 ? (
            <React.Fragment>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    {props.withSelection && (
                      <SelectAll
                        checked={checked}
                        indeterminate={
                          props.amountOfSelectedEntities > 0 &&
                          props.amountOfSelectedEntities < data.length
                        }
                        onChange={(_event, checked) => {
                          const indeterminate =
                            props.amountOfSelectedEntities > 0 &&
                            props.amountOfSelectedEntities < data.length;
                          props.onSelectAll(indeterminate ? false : checked);
                        }}
                        wrapWithTableCell
                      />
                    )}

                    {headerCells.map((headerCell) =>
                      renderHeaderCell ? (
                        renderHeaderCell(headerCell)
                      ) : (
                        <TableCell key={headerCell.replaceAll(' ', '_').toLowerCase()}>
                          <Typography fontWeight={'bold'}>{headerCell}</Typography>
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>{currentPageData.map(renderRow)}</TableBody>
              </TableContainer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mx: 2, mt: 2 }} />
          )}
        </Card.Body>
        <Card.Footer sx={{ p: 2 }}>
          <Pagination
            {...state}
            count={data.length}
            onPageChange={handler.pagination.onPageChange}
            onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
          />
        </Card.Footer>
      </Card>
    </React.Fragment>
  );
};
