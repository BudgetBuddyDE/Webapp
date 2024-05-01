import {ActionPaper, Card, NoResults} from '@/components/Base';
import {AddRounded} from '@mui/icons-material';
import {Box, IconButton, Tooltip} from '@mui/material';
import React from 'react';
import {useFetchBudget} from './useFetchBudget.hook';
import {CircularProgress} from '@/components/Loading';
import {useSnackbarContext} from '@/components/Snackbar';
import {type TBudget} from '@budgetbuddyde/types';
import {CategoryBudget} from './CategoryBudget.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {BudgetDrawer, type TBudgetDrawerValues} from './BudgetDrawer.component';
import {BudgetService} from './Budget.service';

interface IBudgetListHandler {
  showCreateDialog: () => void;
  showEditDialog: (budget: TBudget) => void;
  onDelete: (budget: TBudget) => void;
}

export type TBudgetListProps = {};

export const BudgetList: React.FC<TBudgetListProps> = () => {
  const {showSnackbar} = useSnackbarContext();
  const {loading: loadingBudgets, budgets, refresh: refreshBudgets} = useFetchBudget();
  const [budgetDrawer, dispatchBudgetDrawer] = React.useReducer(
    useEntityDrawer<TBudgetDrawerValues>,
    UseEntityDrawerDefaultState<TBudgetDrawerValues>(),
  );

  const handler: IBudgetListHandler = {
    showCreateDialog() {
      dispatchBudgetDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    showEditDialog(budget) {
      const {
        id,
        expand: {category},
        budget: budgetAmount,
      } = budget;
      dispatchBudgetDrawer({
        type: 'OPEN',
        drawerAction: 'UPDATE',
        payload: {
          id: id,
          category: {id: category.id, label: category.name},
          budget: budgetAmount,
        },
      });
    },
    async onDelete(budget) {
      try {
        const deleteResponse = await BudgetService.deleteBudget(budget.id);
        console.debug('Deleting budget', deleteResponse);

        React.startTransition(() => {
          refreshBudgets();
        });
        showSnackbar({message: `Budget deleted`});
      } catch (error) {
        console.error(error);
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
                <IconButton color="primary" onClick={handler.showCreateDialog}>
                  <AddRounded />
                </IconButton>
              </Tooltip>
            </ActionPaper>
          </Card.HeaderActions>
        </Card.Header>
        <Card.Body>
          {loadingBudgets ? (
            <CircularProgress />
          ) : budgets.length > 0 ? (
            budgets.map(budget => (
              <Box key={budget.id} sx={{mt: 1}}>
                <CategoryBudget
                  budget={budget}
                  onEdit={() => handler.showEditDialog(budget)}
                  onDelete={handler.onDelete}
                />
              </Box>
            ))
          ) : (
            <NoResults sx={{mt: 2}} text="No budget found" />
          )}
        </Card.Body>
      </Card>

      <BudgetDrawer
        {...budgetDrawer}
        onClose={() => dispatchBudgetDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />
    </React.Fragment>
  );
};
