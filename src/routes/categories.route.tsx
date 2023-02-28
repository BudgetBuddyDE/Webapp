import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ActionPaper,
  Card,
  CircularProgress,
  CreateCategory,
  EarningsByCategory,
  EditCategory,
  InitialTablePaginationState,
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
  TablePagination,
  TablePaginationHandler,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { useFetchCategories, useFetchTransactions } from '../hooks';
import { Category } from '../models';
import { TablePaginationReducer } from '../reducer';

interface CategoryHandler {
  onSearch: (keyword: string) => void;
  pagination: TablePaginationHandler;
  category: {
    onDelete: (category: Category) => void;
  };
}

export const Categories = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { setCategories } = React.useContext(StoreContext);
  const fetchTransactions = useFetchTransactions();
  const fetchCategories = useFetchCategories();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const [, startTransition] = React.useTransition();
  const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);

  const handler: CategoryHandler = {
    onSearch(text) {
      setKeyword(text.toLowerCase());
    },
    pagination: {
      onPageChange(newPage) {
        setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
      },
    },
    category: {
      async onDelete(category) {
        try {
          const deletedCategories = await category.delete();
          if (!deletedCategories || deletedCategories.length < 1) throw new Error('No category deleted');
          startTransition(() => {
            setCategories({ type: 'REMOVE_BY_ID', id: deletedCategories[0].id });
          });
          showSnackbar({ message: `Category ${deletedCategories[0].name} deleted` });
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: `Could'nt delete category`,
            action: <Button onClick={() => handler.category.onDelete(category)}>Retry</Button>,
          });
        }
      },
    },
  };

  const shownCategories: Category[] = React.useMemo(() => {
    if (keyword === '') return fetchCategories.categories;
    return fetchCategories.categories.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [keyword, fetchCategories.categories]);

  const currentPageCategories: Category[] = React.useMemo(() => {
    const { page, rowsPerPage } = tablePagination;
    return shownCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownCategories, tablePagination]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Categories" description="What kind of labels u wanna use?" />

      <Grid item xs={12} md={12} lg={8} xl={6}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Categories</Card.Title>
              <Card.Subtitle>Manage your categories</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Category">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {fetchCategories.loading ? (
            <CircularProgress />
          ) : fetchCategories.categories.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Category Table">
                    <TableHead>
                      <TableRow>
                        {['Name', 'Description', ''].map((cell, index) => (
                          <TableCell key={index}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPageCategories.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell>
                            <Typography>{row.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Linkify>{row.description ?? 'No Description'}</Linkify>
                          </TableCell>
                          <TableCell align="right">
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton color="primary" onClick={() => setEditCategory(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton color="primary" onClick={() => handler.category.onDelete(row)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ActionPaper>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <TablePagination
                  {...tablePagination}
                  count={shownCategories.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ m: 2 }} text="No categories found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={3} lg={4} xl={3}>
        {!fetchTransactions.loading && !fetchCategories.loading && (
          <EarningsByCategory categories={fetchCategories.categories} transactions={fetchTransactions.transactions} />
        )}
      </Grid>

      <CreateCategory open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditCategory
        open={editCategory !== null}
        setOpen={(show) => {
          if (!show) setEditCategory(null);
        }}
        category={editCategory}
      />
    </Grid>
  );
};
