import { AppConfig } from '@/App.config';
import { ActionPaper, Card, Linkify, NoResults } from '@/components/Base';
import {
  InitialPaginationState,
  Pagination,
  type PaginationHandler,
  PaginationReducer,
  usePagination,
} from '@/components/Base/Pagination';
import { SearchInput } from '@/components/Base/Search';
import { Table } from '@/components/Base/Table';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { ContentGrid } from '@/components/Layout';
import { CircularProgress } from '@/components/Loading';
import { withAuthLayout } from '@/core/Auth/Layout';
import { CreateCategoryDrawer, EditCategoryDrawer, useFetchCategories } from '@/core/Category';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { TCategory } from '@/types';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

interface CategoriesHandler {
  onSearch: (keyword: string) => void;
  onCategoryDelete: (category: TCategory) => void;
  onEditCategory: (category: TCategory) => void;
  pagination: PaginationHandler;
}

export const Categories = () => {
  const { categories, loading: loadingCategories } = useFetchCategories();
  const [tablePagination, setTablePagination] = React.useReducer(
    PaginationReducer,
    InitialPaginationState
  );
  const [showCreateCategoryDrawer, setShowCreateCategoryDrawer] = React.useState(false);
  const [showEditCategoryDrawer, setShowEditCategoryDrawer] = React.useState(false);
  const [editCategory, setEditcategory] = React.useState<TCategory | null>(null);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = React.useState(false);
  const [deleteCategory, setDeleteCategory] = React.useState<TCategory | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const displayedCategories = React.useMemo(() => {
    if (keyword.length == 0) return categories;
    return categories.filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()));
  }, [categories, keyword, tablePagination]);
  const currentPageCategories = usePagination(displayedCategories, tablePagination);

  const handler: CategoriesHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onEditCategory(category) {
      setShowEditCategoryDrawer(true);
      setEditcategory(category);
    },
    onCategoryDelete(category) {
      setShowDeleteCategoryDialog(true);
      setDeleteCategory(category);
    },
    pagination: {
      onPageChange(newPage) {
        setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
      },
    },
  };

  return (
    <ContentGrid title={'Categories'}>
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Categories</Card.Title>
              <Card.Subtitle>Manage your categories</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            <ul>{!loadingCategories && categories.map((t) => <li key={t.id}>{t.name}</li>)}</ul>
          </Card.Body>
        </Card>
      </Grid>

      <Grid item xs={12} md={12} lg={8} xl={6}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Categories</Card.Title>
              <Card.Subtitle>Manage your categories</Card.Subtitle>
            </Box>

            <Card.HeaderActions
              sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}
              actionPaperProps={{
                sx: { display: 'flex', flexDirection: 'category', width: { xs: '100%' } },
              }}
            >
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => setShowCreateCategoryDrawer(true)}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </Card.HeaderActions>
          </Card.Header>
          {loadingCategories && <CircularProgress />}
          {!loadingCategories && currentPageCategories.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['Name', 'Description', ''].map((cell, index) => (
                        <TableCell key={index} size={AppConfig.table.cellSize}>
                          <Typography fontWeight="bolder">{cell}</Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPageCategories.map((category) => (
                      <TableRow
                        key={category.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography>{category.name}</Typography>
                        </TableCell>
                        <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                          <Linkify>{category.description ?? 'No Description'}</Linkify>
                        </TableCell>
                        <TableCell align="right" size={AppConfig.table.cellSize}>
                          <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onEditCategory(category)}
                            >
                              <EditRounded />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onCategoryDelete(category)}
                            >
                              <DeleteRounded />
                            </IconButton>
                          </ActionPaper>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <Pagination
                  {...tablePagination}
                  count={displayedCategories.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults />
          )}
        </Card>
      </Grid>

      <CreateCategoryDrawer
        open={showCreateCategoryDrawer}
        onChangeOpen={(isOpen) => setShowCreateCategoryDrawer(isOpen)}
      />

      <EditCategoryDrawer
        open={showEditCategoryDrawer}
        onChangeOpen={(isOpen) => {
          setShowEditCategoryDrawer(isOpen);
          if (!isOpen) setEditcategory(null);
        }}
        category={editCategory}
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
        onConfirm={() => {}}
        withTransition
      />
    </ContentGrid>
  );
};

export default withAuthLayout(Categories);
