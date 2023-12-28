import { ActionPaper, Card, NoResults } from '@/components/Base';
import { AddRounded } from '@mui/icons-material';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { useFetchBudget } from './useFetchBudget.hook';
import { CircularProgress } from '@/components/Loading';
import { CategoryBudget, TCategoryBudgetProps } from './CategoryBudget.component';
import { BudgetService, CreateBudgetDrawer, EditBudgetDrawer, useFetchBudgetProgress } from '.';
import { useSnackbarContext } from '../Snackbar';
import { useAuthContext } from '../Auth';
import { TBudget } from '@budgetbuddyde/types';

export type TBudgetListProps = {};

export const BudgetList: React.FC<TBudgetListProps> = () => {
  const { authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { refresh: refreshBudgets } = useFetchBudget();
  const {
    loading: loadingBudgets,
    budgetProgress,
    refresh: refreshBudgetProgress,
  } = useFetchBudgetProgress();
  const [showCreateBudgetDrawer, setShowCreateBudgetDrawer] = React.useState(false);
  const [showEditBudgetDrawer, setShowEditBudgetDrawer] = React.useState(false);
  const [editBudget, setEditBudget] = React.useState<TBudget | null>(null);

  const handler: Pick<TCategoryBudgetProps, 'onEdit' | 'onDelete'> = {
    async onEdit(budget) {
      setEditBudget(budget);
      setShowEditBudgetDrawer(true);
    },
    async onDelete(budget) {
      try {
        const [deletedBudget, error] = await BudgetService.delete(budget, authOptions);
        if (error) throw error;
        if (!deletedBudget) throw new Error("Couldn't remove the budgets for this category");

        refreshBudgetProgress();
        refreshBudgets();
        showSnackbar({ message: 'The budget got deleted' });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: (error as Error).message,
          action: (
            <Button
              onClick={() => {
                if (handler.onDelete) {
                  handler.onDelete(budget);
                }
              }}
            >
              Retry
            </Button>
          ),
        });
      }
    },
  };

  return (
    <React.Fragment>
      <Card>
        <Card.Header>
          <Box>
            <Card.Title>Category Budgets</Card.Title>
            <Card.Subtitle>Set a limit for your spending</Card.Subtitle>
          </Box>
          <Card.HeaderActions>
            <ActionPaper>
              <Tooltip title="Set Budget">
                <IconButton color="primary" onClick={() => setShowCreateBudgetDrawer(true)}>
                  <AddRounded />
                </IconButton>
              </Tooltip>
            </ActionPaper>
          </Card.HeaderActions>
        </Card.Header>
        <Card.Body>
          {loadingBudgets ? (
            <CircularProgress />
          ) : budgetProgress.length > 0 ? (
            budgetProgress.map((item) => (
              <Box key={item.id} sx={{ mt: 1 }}>
                <CategoryBudget budget={item} onEdit={handler.onEdit} onDelete={handler.onDelete} />
              </Box>
            ))
          ) : (
            <NoResults sx={{ mt: 2 }} text="No budget found" />
          )}
        </Card.Body>
      </Card>

      <CreateBudgetDrawer open={showCreateBudgetDrawer} onChangeOpen={setShowCreateBudgetDrawer} />

      <EditBudgetDrawer
        open={showEditBudgetDrawer}
        onChangeOpen={(isOpen) => {
          if (!isOpen) setEditBudget(null);
          setShowEditBudgetDrawer(isOpen);
        }}
        budget={editBudget}
      />
    </React.Fragment>
  );
};
