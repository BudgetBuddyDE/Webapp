import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';
import { Card } from '@/components/Base';
import { ActionPaper } from '@/components/Base/ActionPaper.component';
import { CreateCategoryDrawer } from '@/components/Category/CreateCategoryDrawer.component';
import { EditCategoryDrawer } from '@/components/Category/EditCategoryDrawer.component';
import { CircularProgress } from '@/components/Core/CircularProgress.component';
import { AddFab } from '@/components/Core/FAB/AddFab.component';
import { FabContainer } from '@/components/Core/FAB/FabContainer.component';
import { Linkify } from '@/components/Core/Linkify.component';
import { NoResults } from '@/components/Core/NoResults.component';
import {
    InitialTablePaginationState,
    TablePagination,
    type TablePaginationHandler,
} from '@/components/Core/TablePagination.component';
import { SearchInput } from '@/components/Inputs/SearchInput.component';
import { PageHeader } from '@/components/Layout/PageHeader.component';
import { RedirectChip } from '@/components/RedirectChip.component';
import { SelectMultiple, type SelectMultipleHandler } from '@/components/SelectMultiple';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { Category } from '@/models/Category.model';
import { SelectMultipleReducer, generateInitialState } from '@/reducer/SelectMultuple.reducer';
import { TablePaginationReducer } from '@/reducer/TablePagination.reducer';
import { CategoryService } from '@/services/Category.service';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { AddRounded as AddIcon, DeleteRounded as DeleteIcon, EditRounded as EditIcon } from '@mui/icons-material';
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

export interface CategoriesRouteHandler {
    clearLocationState: () => void;
    onSearch: (keyword: string) => void;
    pagination: TablePaginationHandler;
    category: {
        onDelete: (category: Category) => void;
    };
    selectMultiple: SelectMultipleHandler;
}
const CategoriesRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { loading: loadingCategories, categories, refresh: refreshCategories } = useFetchCategories();
    const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);
    const [selectedCategories, setSelectedCategories] = React.useReducer(SelectMultipleReducer, generateInitialState());
    const [keyword, setKeyword] = React.useState('');
    const [showAddForm, setShowAddForm] = React.useState(
        location.state !== null &&
            (location.state as any).create !== undefined &&
            (location.state as any).create === true
    );
    const [editCategory, setEditCategory] = React.useState<Category | null>(null);

    const handler: CategoriesRouteHandler = {
        clearLocationState() {
            window.history.replaceState(null, '');
        },
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
                    await refreshCategories();
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
        selectMultiple: {
            onSelectAll: (_event, _checked) => {
                setSelectedCategories({
                    type: 'SET_SELECTED',
                    selected:
                        selectedCategories.selected.length > 0 &&
                        (selectedCategories.selected.length < shownCategories.length ||
                            shownCategories.length === selectedCategories.selected.length)
                            ? []
                            : shownCategories.map(({ id }) => id),
                });
            },
            onSelectSingle: (event, checked) => {
                const item = Number(event.target.value);
                setSelectedCategories(checked ? { type: 'ADD_ITEM', item: item } : { type: 'REMOVE_ITEM', item: item });
            },
            actionBar: {
                onEdit: () => {
                    setSelectedCategories({ type: 'OPEN_DIALOG', dialog: 'EDIT' });
                },
                onDelete: () => {
                    setSelectedCategories({ type: 'OPEN_DIALOG', dialog: 'DELETE' });
                },
            },
            dialog: {
                onDeleteCancel: () => {
                    setSelectedCategories({ type: 'CLOSE_DIALOG' });
                },
                onDeleteConfirm: async () => {
                    try {
                        if (selectedCategories.selected.length == 0) throw new Error('No categories were selected');
                        const result = await CategoryService.delete(selectedCategories.selected);
                        if (selectedCategories.selected.length != result.length)
                            throw new Error("Couldn't delete all selected categories");
                        await refreshCategories();
                        setSelectedCategories({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
                        showSnackbar({ message: `${selectedCategories.selected.length} categories deleted` });
                    } catch (error) {
                        console.error(error);
                        showSnackbar({
                            message: "Couln't delete the categories",
                            action: <Button onClick={handler.selectMultiple.dialog.onDeleteConfirm}>Retry</Button>,
                        });
                        setSelectedCategories({ type: 'CLOSE_DIALOG' });
                    }
                },
            },
        },
    };

    const shownCategories: Category[] = React.useMemo(() => {
        if (keyword === '') return categories;
        return categories.filter((item) => item.name.toLowerCase().includes(keyword));
    }, [keyword, categories]);

    const currentPageCategories: Category[] = React.useMemo(() => {
        const { page, rowsPerPage } = tablePagination;
        return shownCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [shownCategories, tablePagination]);

    React.useEffect(() => {
        return () => handler.clearLocationState();
    }, []);

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
                        <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}>
                            <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
                                <SearchInput onSearch={handler.onSearch} />
                                <Tooltip title="Add Category">
                                    <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                                        <AddIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </ActionPaper>
                        </Card.HeaderActions>
                    </Card.Header>
                    {loadingCategories ? (
                        <CircularProgress />
                    ) : shownCategories.length > 0 ? (
                        <React.Fragment>
                            <Card.Body>
                                <SelectMultiple.Actions
                                    amount={selectedCategories.selected.length}
                                    onDelete={handler.selectMultiple.actionBar.onDelete}
                                />
                                <TableContainer>
                                    <Table sx={{ minWidth: 650 }} aria-label="Category Table">
                                        <TableHead>
                                            <TableRow>
                                                <SelectMultiple.SelectAllCheckbox
                                                    onChange={handler.selectMultiple.onSelectAll}
                                                    indeterminate={
                                                        selectedCategories.selected.length > 0 &&
                                                        selectedCategories.selected.length < shownCategories.length
                                                    }
                                                    checked={
                                                        selectedCategories.selected.length === shownCategories.length &&
                                                        selectedCategories.selected.length > 0
                                                    }
                                                    withTableCell
                                                />
                                                {['Name', 'Description', ''].map((cell, index) => (
                                                    <TableCell key={index} size={'small'}>
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
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <SelectMultiple.SelectSingleCheckbox
                                                            value={row.id}
                                                            onChange={handler.selectMultiple.onSelectSingle}
                                                            checked={selectedCategories.selected.includes(row.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <RedirectChip item={row} />
                                                    </TableCell>
                                                    <TableCell
                                                        sx={DescriptionTableCellStyle}
                                                        size={AppConfig.table.cellSize}
                                                    >
                                                        <Linkify>{row.description ?? 'No Description'}</Linkify>
                                                    </TableCell>
                                                    <TableCell align="right" size={AppConfig.table.cellSize}>
                                                        <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                                            <Tooltip title="Edit" placement="top">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => setEditCategory(row)}
                                                                >
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

            <FabContainer>
                <AddFab onClick={() => setShowAddForm(true)} />
            </FabContainer>

            <SelectMultiple.ConfirmDeleteDialog
                open={selectedCategories.dialog.show && selectedCategories.dialog.type === 'DELETE'}
                onCancel={handler.selectMultiple.dialog.onDeleteCancel!}
                onConfirm={handler.selectMultiple.dialog.onDeleteConfirm!}
            />

            <CreateCategoryDrawer
                open={showAddForm}
                setOpen={(show) => {
                    // If we have an location.state we're gonna clear it on close
                    if (
                        !show &&
                        location.state !== null &&
                        (location.state as any).create === true &&
                        (location.state as any).category !== undefined
                    ) {
                        navigate(location.pathname, { replace: true, state: null });
                    }
                    setShowAddForm(show);
                }}
                category={
                    location.state &&
                    (location.state as any).create !== undefined &&
                    (location.state as any).category !== undefined
                        ? (location.state as any).category
                        : undefined
                }
            />

            <EditCategoryDrawer
                open={editCategory !== null}
                setOpen={(show) => {
                    if (!show) setEditCategory(null);
                }}
                category={editCategory}
            />
        </Grid>
    );
};

export default CategoriesRoute;
