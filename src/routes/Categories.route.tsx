import {AppConfig} from '@/app.config';
import {ActionPaper, Linkify} from '@/components/Base';
import {Table} from '@/components/Base/Table';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {
  CategoryChip,
  CategoryDrawer,
  CategoryService,
  CategorySpendingsChart,
  useFetchCategories,
  type TCategoryDrawerValues,
} from '@/components/Category';
import {CategoryIncomeChart} from '@/components/Category/Chart/IncomeChart.component';
import {useSnackbarContext} from '@/components/Snackbar';
import {DescriptionTableCellStyle} from '@/style/DescriptionTableCell.style';
import {AddRounded, DeleteRounded, EditRounded} from '@mui/icons-material';
import {Checkbox, Grid, IconButton, TableCell, TableRow} from '@mui/material';
import React from 'react';
import {SearchInput} from '@/components/Base/Search';
import {type ISelectionHandler} from '@/components/Base/Select';
import {ToggleFilterDrawerButton} from '@/components/Filter';
import {pb} from '@/pocketbase';
import {PocketBaseCollection, type TCategory} from '@budgetbuddyde/types';
import {DownloadButton} from '@/components/Download';
import {format} from 'date-fns';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';

interface ICategoriesHandler {
  showCreateDialog: () => void;
  showEditDialog: (category: TCategory) => void;

  onSearch: (keyword: string) => void;
  onCategoryDelete: (category: TCategory) => void;
  onConfirmCategoryDelete: () => void;
  selection: ISelectionHandler<TCategory>;
}

export const Categories = () => {
  const {categories, refresh: refreshCategories, loading: loadingCategories} = useFetchCategories();
  const {showSnackbar} = useSnackbarContext();
  const [categoryDrawer, dispatchCategoryDrawer] = React.useReducer(
    useEntityDrawer<TCategoryDrawerValues>,
    UseEntityDrawerDefaultState<TCategoryDrawerValues>(),
  );
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = React.useState(false);
  const [deleteCategories, setDeleteCategories] = React.useState<TCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<TCategory[]>([]);
  const [keyword, setKeyword] = React.useState('');

  const displayedCategories: TCategory[] = React.useMemo(() => {
    if (keyword.length == 0) return categories;
    return CategoryService.filter(categories, keyword);
  }, [categories, keyword]);

  const handler: ICategoriesHandler = {
    showCreateDialog() {
      dispatchCategoryDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    showEditDialog(category) {
      const {id, name, description} = category;
      dispatchCategoryDrawer({
        type: 'OPEN',
        drawerAction: 'UPDATE',
        payload: {id, name, description},
      });
    },
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    async onConfirmCategoryDelete() {
      try {
        if (deleteCategories.length === 0) return;

        const deleteResponses = Promise.allSettled(
          deleteCategories.map(category => pb.collection(PocketBaseCollection.CATEGORY).delete(category.id)),
        );
        console.debug('Deleting categories', deleteResponses);

        setShowDeleteCategoryDialog(false);
        setDeleteCategories([]);
        React.startTransition(() => {
          refreshCategories();
        });
        showSnackbar({message: `Categories we're deleted`});
        setSelectedCategories([]);
      } catch (error) {
        console.error(error);
      }
    },
    onCategoryDelete(category) {
      setShowDeleteCategoryDialog(true);
      setDeleteCategories([category]);
    },
    selection: {
      onSelectAll(shouldSelectAll) {
        setSelectedCategories(shouldSelectAll ? displayedCategories : []);
      },
      onSelect(entity) {
        if (this.isSelected(entity)) {
          setSelectedCategories(prev => prev.filter(({id}) => id !== entity.id));
        } else setSelectedCategories(prev => [...prev, entity]);
      },
      isSelected(entity) {
        return selectedCategories.find(elem => elem.id === entity.id) !== undefined;
      },
      onDeleteMultiple() {
        setShowDeleteCategoryDialog(true);
        setDeleteCategories(selectedCategories);
      },
    },
  };

  return (
    <ContentGrid title={'Categories'}>
      <Grid item xs={12} md={12} lg={8} xl={8}>
        <Table<TCategory>
          isLoading={loadingCategories}
          title="Categories"
          subtitle="Manage your categories"
          data={displayedCategories}
          headerCells={['Name', 'Description', '']}
          renderRow={category => (
            <TableRow
              key={category.id}
              sx={{
                '&:last-child td, &:last-child th': {border: 0},
                whiteSpace: 'nowrap',
              }}>
              <TableCell>
                <Checkbox
                  checked={handler.selection.isSelected(category)}
                  onChange={() => handler.selection.onSelect(category)}
                />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <CategoryChip category={category} showUsage />
              </TableCell>
              <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                <Linkify>{category.description ?? 'No description available'}</Linkify>
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <ActionPaper sx={{width: 'fit-content', ml: 'auto'}}>
                  <IconButton color="primary" onClick={() => handler.showEditDialog(category)}>
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
              <ToggleFilterDrawerButton />

              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={handler.showCreateDialog}>
                <AddRounded fontSize="inherit" />
              </IconButton>
              {categories.length > 0 && (
                <DownloadButton
                  data={categories}
                  exportFileName={`bb_categories_${format(new Date(), 'yyyy_mm_dd')}`}
                  exportFormat="JSON"
                  withTooltip>
                  Export
                </DownloadButton>
              )}
            </React.Fragment>
          }
          withSelection
          onSelectAll={handler.selection.onSelectAll}
          amountOfSelectedEntities={selectedCategories.length}
          onDelete={() => {
            if (handler.selection.onDeleteMultiple) handler.selection.onDeleteMultiple();
          }}
        />
      </Grid>

      <Grid container item xs={12} md={12} lg={4} xl={4} spacing={3} sx={{height: 'max-content'}}>
        <Grid item xs={12} md={12}>
          <CategorySpendingsChart />
        </Grid>

        <Grid item xs={12} md={12}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>

      <CategoryDrawer
        {...categoryDrawer}
        onClose={() => dispatchCategoryDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <DeleteDialog
        open={showDeleteCategoryDialog}
        onClose={() => {
          setShowDeleteCategoryDialog(false);
          setDeleteCategories([]);
        }}
        onCancel={() => {
          setShowDeleteCategoryDialog(false);
          setDeleteCategories([]);
        }}
        onConfirm={() => handler.onConfirmCategoryDelete()}
        withTransition
      />
      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={handler.showCreateDialog} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Categories);
