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
  TablePagination,
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
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { Category } from '../models';

interface CategoryHandler {
  onSearch: (keyword: string) => void;
  pagination: {
    onPageChange: (event: unknown, newPage: number) => void;
    onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  category: {
    onDelete: (category: Category) => void;
  };
}

export const Categories = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, categories, transactions, setCategories } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const [, startTransition] = React.useTransition();

  const handler: CategoryHandler = {
    onSearch(text) {
      setKeyword(text.toLowerCase());
    },
    pagination: {
      onPageChange(event, newPage) {
        setPage(newPage);
      },
      onChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      },
    },
    category: {
      async onDelete(category) {
        try {
          const deletedCategories = await category.delete();
          if (!deletedCategories || deletedCategories.length < 1)
            throw new Error('No category deleted');
          startTransition(() => {
            setCategories((prev) => prev.filter(({ id }) => id !== deletedCategories[0].id));
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
    if (keyword === '') return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [keyword, categories]);

  const currentPageCategories: Category[] = React.useMemo(() => {
    return shownCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownCategories, page, rowsPerPage]);

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
          {loading ? (
            <CircularProgress />
          ) : categories.length > 0 ? (
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
                      {shownCategories
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
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
                                  <IconButton
                                    color="primary"
                                    onClick={() => handler.category.onDelete(row)}
                                  >
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
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownCategories.length}
                    page={page}
                    onPageChange={handler.pagination.onPageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handler.pagination.onChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No categories found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={3} lg={4} xl={3} order={{ xs: 0, md: 1 }}>
        {!loading && <EarningsByCategory categories={categories} transactions={transactions} />}
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
