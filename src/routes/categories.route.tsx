import { ChangeEvent, useContext, useEffect, useState } from 'react';
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
import type { ICategory } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';
import { StoreContext } from '../context/store.context';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export async function getCategories(): Promise<ICategory[] | null> {
  return new Promise(async (res, rej) => {
    const { data, error } = await supabase
      .from<ICategory>('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) rej(error);
    res(data);
  });
}

export const Categories = () => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, categories, setCategories } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [shownCategories, setShownCategories] = useState<readonly ICategory[]>(categories);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [addForm, setAddForm] = useState<Record<string, string | number>>({});
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const addFormHandler = {
    open: () => setShowAddForm(true),
    close: () => {
      setShowAddForm(false);
      setAddForm({});
      setErrorMessage('');
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    save: async () => {
      try {
        const values = Object.keys(addForm);
        if (!values.includes('name')) throw new Error('Provide an name');

        const { data, error } = await supabase.from('categories').insert([
          {
            name: addForm.name,
            description: addForm.description || null,
            // @ts-ignore
            created_by: session?.user.id,
          },
        ]);
        if (error) throw error;

        setCategories((prev) => [...prev, ...data]);
        addFormHandler.close();
        showSnackbar({
          message: 'Category added',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const editFormHandler = {
    open: ({ id, name, description }: ICategory) => {
      setEditForm({ id, name, description: description || '' });
    },
    close: () => {
      setEditForm({});
      setErrorMessage('');
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    save: async () => {
      try {
        const values = Object.keys(editForm);
        if (!values.includes('id')) throw new Error('Provide an id');
        if (!values.includes('name')) throw new Error('Provide an name');

        const update = {
          name: editForm.name,
          description: editForm.description || null,
          // @ts-ignore
          created_by: session?.user.id,
        };

        const { data, error } = await supabase
          .from<ICategory>('categories')
          // @ts-ignore
          .update(update)
          .match({ id: editForm.id });
        if (error) throw error;

        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === data[0].id) {
              return {
                ...category,
                name: editForm.name.toString(),
                description: editForm.description.toString(),
              };
            }
            return category;
          })
        );
        editFormHandler.close();
        showSnackbar({
          message: 'Category updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
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
                <IconButton aria-label="add-category" onClick={addFormHandler.open}>
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
                              <IconButton onClick={() => editFormHandler.open(row)}>
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
        onClose={addFormHandler.close}
        onSave={addFormHandler.save}
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
            name="name"
            sx={FormStyle}
            onChange={addFormHandler.inputChange}
          />

          <TextField
            id="add-category-description"
            variant="outlined"
            label="Description"
            name="description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            onChange={addFormHandler.inputChange}
          />
        </form>
      </FormDrawer>

      {/* Edit Category */}
      <FormDrawer
        open={Object.keys(editForm).length > 0}
        heading="Edit Category"
        onClose={editFormHandler.close}
        onSave={editFormHandler.save}
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
            name="name"
            sx={FormStyle}
            defaultValue={editForm.name}
            onChange={editFormHandler.inputChange}
          />

          <TextField
            id="add-category-description"
            variant="outlined"
            label="Description"
            name="description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            defaultValue={editForm.description}
            onChange={editFormHandler.inputChange}
          />
        </form>
      </FormDrawer>
    </Grid>
  );
};
