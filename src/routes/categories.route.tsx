import { useContext, useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Tooltip,
  IconButton,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/inputs/search-input.component';
import type { ICategory } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { StoreContext } from '../context/store.context';
import { CategoryService } from '../services/category.service';
import { NoResults } from '../components/no-results.component';
import { CreateCategory } from '../components/create-forms/create-category.component';
import { EditCategory } from '../components/edit-forms/edit-category.component';

export const Categories = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, categories, setCategories } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [shownCategories, setShownCategories] = useState<readonly ICategory[]>(categories);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      const data = await CategoryService.deleteCategoryById(id);
      if (data === null) throw new Error('No category deleted');
      setCategories((prev) => prev.filter((category) => category.id !== id));
      showSnackbar({ message: `Category ${data[0].name} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete category`,
        action: <Button onClick={() => handleDelete(id)}>Retry</Button>,
      });
    }
  };

  useEffect(() => setShownCategories(categories), [categories]);

  useEffect(() => {
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
              <SearchInput sx={{ mr: '.5rem' }} onSearch={handleOnSearch} />
              <Tooltip title="Add Category">
                <IconButton aria-label="add-category" onClick={() => setShowAddForm(true)}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
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
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell></TableCell>
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
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.description || 'No Description'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit" placement="top">
                                <IconButton onClick={() => setEditCategory(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton onClick={() => handleDelete(row.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer>
                <TablePagination
                  component="div"
                  count={shownCategories.length}
                  page={page}
                  onPageChange={handlePageChange}
                  labelRowsPerPage="Rows:"
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No categories found" />
          )}
        </Card>
      </Grid>

      {/* Add Category */}
      <CreateCategory open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      {/* Edit Category */}
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
