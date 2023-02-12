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
  EditCategory,
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { Category } from '../models';

export const Categories = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, categories, setCategories } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [shownCategories, setShownCategories] = React.useState<readonly Category[]>(categories);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const [, startTransition] = React.useTransition();

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (category: Category) => {
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
        action: <Button onClick={() => handleDelete(category)}>Retry</Button>,
      });
    }
  };

  React.useEffect(() => setShownCategories(categories), [categories]);

  React.useEffect(() => {
    if (keyword === '') setShownCategories(categories);
    setShownCategories(categories.filter((item) => item.name.toLowerCase().includes(keyword)));
  }, [keyword, categories]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Categories" description="What kind of labels u wanna use?" />

      <Grid item xs={12} md={12} lg={8} xl={6}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Categories</Card.Title>
              <Card.Subtitle>Manage your categories</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <SearchInput onSearch={handleOnSearch} />
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
            <>
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
                                  <IconButton color="primary" onClick={() => handleDelete(row)}>
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
              <Card.Footer>
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownCategories.length}
                    page={page}
                    onPageChange={handlePageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No categories found" />
          )}
        </Card>
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
