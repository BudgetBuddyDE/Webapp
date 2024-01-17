import { AppConfig } from '@/app.config';
import { ActionPaper, Linkify } from '@/components/Base';
import { Table } from '@/components/Base/Table';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { useAuthContext } from '@/core/Auth';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  CategoryAnalytics,
  CategoryChip,
  CategoryService,
  CategorySpendingsChart,
  CreateCategoryDrawer,
  EditCategoryDrawer,
  type TCreateCategoryDrawerPayload,
  type TEditCategoryDrawerPayload,
  useFetchCategories,
} from '@/core/Category';
import { CategoryIncomeChart } from '@/core/Category/Chart/IncomeChart.component';
import { useSnackbarContext } from '@/core/Snackbar';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import type { TCategory } from '@budgetbuddyde/types';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import { Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { CreateEntityDrawerState, useEntityDrawer } from '@/hooks';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/Base/Search';

interface ICategoriesHandler {
  onSearch: (keyword: string) => void;
  onCreateCategory: (payload?: TCreateCategoryDrawerPayload) => void;
  onCategoryDelete: (category: TCategory) => void;
  onConfirmCategoryDelete: () => void;
  onEditCategory: (category: TCategory) => void;
}

export const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    categories,
    refresh: refreshCategories,
    loading: loadingCategories,
  } = useFetchCategories();
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const [showCreateDrawer, dispatchCreateDrawer] = React.useReducer(
    useEntityDrawer<TCreateCategoryDrawerPayload>,
    CreateEntityDrawerState<TCreateCategoryDrawerPayload>()
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TEditCategoryDrawerPayload>,
    CreateEntityDrawerState<TEditCategoryDrawerPayload>()
  );
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = React.useState(false);
  const [deleteCategory, setDeleteCategory] = React.useState<TCategory | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const displayedCategories: TCategory[] = React.useMemo(() => {
    if (keyword.length == 0) return categories;
    return categories.filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()));
  }, [categories, keyword]);

  const handler: ICategoriesHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onCreateCategory(payload) {
      dispatchCreateDrawer({ type: 'open', payload });
    },
    onEditCategory(category) {
      dispatchEditDrawer({ type: 'open', payload: category });
    },
    async onConfirmCategoryDelete() {
      try {
        if (!deleteCategory) return;
        const [deletedItem, error] = await CategoryService.delete(
          { categoryId: deleteCategory.id },
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the category" });
        }

        setShowDeleteCategoryDialog(false);
        setDeleteCategory(null);
        refreshCategories(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Deleted category ${deletedItem.name}` });
      } catch (error) {
        console.error(error);
      }
    },
    onCategoryDelete(category) {
      setShowDeleteCategoryDialog(true);
      setDeleteCategory(category);
    },
  };

  React.useEffect(() => {
    if (!location.search) return;
    const queryParams = new URLSearchParams(location.search);
    if (!queryParams.has('create') || queryParams.size < 2) return;

    const payload: TCreateCategoryDrawerPayload = {
      name: queryParams.get('category') ?? '',
      description: queryParams.get('description'),
    };
    handler.onCreateCategory(payload);
  }, [location.search]);

  return (
    <ContentGrid title={'Categories'}>
      <Grid item xs={12} md={12} lg={8} xl={8}>
        <Table<TCategory>
          isLoading={loadingCategories}
          title="Categories"
          subtitle="Manage your categories"
          data={displayedCategories}
          headerCells={['Name', 'Description', '']}
          renderHeaderCell={(headerCell) => (
            <TableCell
              key={headerCell.replaceAll(' ', '_').toLowerCase()}
              size={AppConfig.table.cellSize}
            >
              <Typography fontWeight="bolder">{headerCell}</Typography>
            </TableCell>
          )}
          renderRow={(category) => (
            <TableRow
              key={category.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                whiteSpace: 'nowrap',
              }}
            >
              <TableCell size={AppConfig.table.cellSize}>
                <CategoryChip category={category} />
              </TableCell>
              <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                <Linkify>{category.description ?? 'No Description'}</Linkify>
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <IconButton color="primary" onClick={() => handler.onEditCategory(category)}>
                    <EditRounded />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handler.onCategoryDelete(category)}>
                    <DeleteRounded />
                  </IconButton>
                </ActionPaper>
              </TableCell>
            </TableRow>
          )}
          tableActions={
            <React.Fragment>
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => handler.onCreateCategory()}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </React.Fragment>
          }
        />
      </Grid>

      <Grid container item xs={12} md={12} lg={4} xl={4} spacing={3} sx={{ height: 'max-content' }}>
        <Grid item xs={12} md={12}>
          <CategoryAnalytics />
        </Grid>

        <Grid item xs={12} md={12}>
          <CategorySpendingsChart />
        </Grid>

        <Grid item xs={12} md={12}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>

      <Grid item xs={12} md={12} lg={8} xl={6}></Grid>

      <CreateCategoryDrawer
        {...showCreateDrawer}
        onClose={() => {
          navigate(location.pathname, { replace: true });
          dispatchCreateDrawer({ type: 'close' });
        }}
      />

      <EditCategoryDrawer
        {...showEditDrawer}
        onClose={() => dispatchEditDrawer({ type: 'close' })}
      />

      <DeleteDialog
        open={showDeleteCategoryDialog}
        onClose={() => {
          setShowDeleteCategoryDialog(false);
          setDeleteCategory(null);
        }}
        onCancel={() => {
          setShowDeleteCategoryDialog(false);
          setDeleteCategory(null);
        }}
        onConfirm={() => handler.onConfirmCategoryDelete}
        withTransition
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={() => handler.onCreateCategory()} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Categories);
