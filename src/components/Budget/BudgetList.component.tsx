import {ActionPaper, Card, NoResults} from '@/components/Base';
import {AddRounded} from '@mui/icons-material';
import {Box, IconButton, Tooltip} from '@mui/material';
import React from 'react';
import {useFetchBudget} from './useFetchBudget.hook';
import {CircularProgress} from '@/components/Loading';
import {useSnackbarContext} from '@/components/Snackbar';
import {CreateBudgetDrawer} from './CreateBudgetDrawer.component';
import {EditBudgetDrawer} from './EditBudgetDrawer.component';
import {type TBudget, PocketBaseCollection} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';
import {CategoryBudget} from './CategoryBudget.component';

interface IBudgetListHandler {
  onEdit: (budget: TBudget) => void;
  onDelete: (budget: TBudget) => void;
}

export type TBudgetListProps = {};

export const BudgetList: React.FC<TBudgetListProps> = () => {
  const {showSnackbar} = useSnackbarContext();
  const {loading: loadingBudgets, budgets, refresh: refreshBudgets} = useFetchBudget();
  const [showCreateBudgetDrawer, setShowCreateBudgetDrawer] = React.useState(false);
  const [showEditBudgetDrawer, setShowEditBudgetDrawer] = React.useState(false);
  const [editBudget, setEditBudget] = React.useState<TBudget | null>(null);

  const handler: IBudgetListHandler = {
    async onEdit(budget) {
      setEditBudget(budget);
      setShowEditBudgetDrawer(true);
    },
    async onDelete(budget) {
      try {
        const deleteResponse = await pb.collection(PocketBaseCollection.BUDGET).delete(budget.id);
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
          ) : budgets.length > 0 ? (
            budgets.map(budget => (
              <Box key={budget.id} sx={{mt: 1}}>
                <CategoryBudget budget={budget} onEdit={handler.onEdit} onDelete={handler.onDelete} />
              </Box>
            ))
          ) : (
            <NoResults sx={{mt: 2}} text="No budget found" />
          )}
        </Card.Body>
      </Card>

      <CreateBudgetDrawer open={showCreateBudgetDrawer} onChangeOpen={setShowCreateBudgetDrawer} />

      <EditBudgetDrawer
        open={showEditBudgetDrawer}
        onChangeOpen={isOpen => {
          if (!isOpen) setEditBudget(null);
          setShowEditBudgetDrawer(isOpen);
        }}
        budget={editBudget}
      />
    </React.Fragment>
  );
};
