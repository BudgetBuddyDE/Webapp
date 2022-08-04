import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '../components/card.component';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/search-input.component';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import { IBaseCategory, ICategory } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export const Categories = () => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [shownCategories, setShownCategories] = useState<readonly ICategory[]>(categories);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [addCategory, setAddCategory] = useState({} as IBaseCategory);
  const [editCategory, setEditCategory] = useState<null | ICategory>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddFormOpen = () => setShowAddForm(true);

  const handleAddFormClose = () => {
    setShowAddForm(false);
    setErrorMessage('');
  };

  const handleAddFormSubmit = async () => {
    try {
      const { name } = addCategory;
      if (!name) throw 'Provide an valid name';

      const { data, error } = await supabase
        .from('categories')
        // FIXME: Why do we have to add created_by for the categories to pass RLS (not required for the payment-methods)
        // @ts-ignore
        .insert([{ ...addCategory, created_by: session?.user.id }]);
      if (error) throw error;

      setCategories((prev) => [...prev, ...data]);
      handleAddFormClose();
      showSnackbar({
        message: 'Category added',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from<ICategory>('categories')
        .delete()
        .match({ id: id });
      if (error) throw error;
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

  const handleEdit = (paymentMethod: ICategory) => setEditCategory(paymentMethod);

  const handleEditFormClose = () => {
    setEditCategory(null);
    setErrorMessage('');
  };

  const handleEditFormSubmit = async () => {
    try {
      if (!editCategory) throw 'No Category provided';
      const { name } = editCategory;

      if (!name) throw 'Provide an valid name';

      const { data, error } = await supabase.from<ICategory>('categories').upsert(editCategory);
      if (error) throw error;

      setCategories((prev) => {
        let updatedCategories = prev;
        const outdatedItemIndex = updatedCategories.findIndex(
          (category) => category.id === data[0].id
        );
        updatedCategories[outdatedItemIndex] = data[0];
        return updatedCategories;
      });
      handleEditFormClose();
      showSnackbar({
        message: 'Category updated',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  useEffect(() => setShownCategories(categories), [categories]);

  useEffect(() => {
    if (keyword === '') setShownCategories(categories);
    setShownCategories(categories.filter((item) => item.name.toLowerCase().includes(keyword)));
  }, [keyword]);

  useEffect(() => {
    getCategories()
      .then((data) => {
        if (data) {
          setCategories(data);
        } else setCategories([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session]);

  async function getCategories(): Promise<ICategory[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<ICategory>('categories').select('*');
      if (error) rej(error);
      res(data);
    });
  }

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
                <IconButton aria-label="add-category" onClick={handleAddFormOpen}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
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
                              <IconButton onClick={() => handleEdit(row)}>
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
            )}
          </Card.Body>
          <Card.Footer>
            {!loading && (
              <TablePagination
                component="div"
                count={shownCategories.length}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage="Rows:"
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card.Footer>
        </Card>
      </Grid>

      {/* Add Category */}
      <FormDrawer
        open={showAddForm}
        heading="Add Category"
        onClose={handleAddFormClose}
        onSave={handleAddFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form>
          <TextField
            id="add-category-name"
            variant="outlined"
            label="Name"
            sx={FormStyle}
            onChange={(e) => setAddCategory((prev) => ({ ...prev, name: e.target.value }))}
          />

          <TextField
            id="add-category-description"
            variant="outlined"
            label="Description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            onChange={(e) =>
              setAddCategory((prev) => ({
                ...prev,
                description: e.target.value === '' ? null : e.target.value,
              }))
            }
          />
        </form>
      </FormDrawer>

      {/* Edit Category */}
      <FormDrawer
        open={editCategory !== null}
        heading="Edit Category"
        onClose={handleEditFormClose}
        onSave={handleEditFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {editCategory && (
          <form>
            <TextField
              id="add-category-name"
              variant="outlined"
              label="Name"
              sx={FormStyle}
              defaultValue={editCategory?.name}
              // @ts-ignore
              onChange={(e) => setEditCategory((prev) => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              id="add-category-description"
              variant="outlined"
              label="Description"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              defaultValue={editCategory?.description}
              onChange={(e) =>
                // @ts-ignore
                setEditCategory((prev) => ({
                  ...prev,
                  description: e.target.value === '' ? null : e.target.value,
                }))
              }
            />
          </form>
        )}
      </FormDrawer>
    </Grid>
  );
};
