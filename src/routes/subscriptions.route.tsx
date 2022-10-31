import * as React from 'react';
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
  Typography,
  Button,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/inputs/search-input.component';
import { CircularProgress } from '../components/progress.component';
import { StoreContext } from '../context/store.context';
import { determineNextExecution } from '../utils/determineNextExecution';
import { NoResults } from '../components/no-results.component';
import { CreateSubscription } from '../components/create-forms/create-subscription.component';
import { EditSubscription } from '../components/edit-forms/edit-subscription.component';
import { ShowFilterButton } from '../components/show-filter.component';
import { filterSubscriptions } from '../utils/filter';
import { Subscription } from '../models/subscription.model';
import { CategoryChip, PaymentMethodChip } from '../components/chip.component';

export const Subscriptions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, filter, subscriptions, setSubscriptions } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = React.useState('');
  const [shownSubscriptions, setShownSubscriptions] =
    React.useState<readonly Subscription[]>(subscriptions);
  const [, startTransition] = React.useTransition();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editSubscription, setEditSubscription] = React.useState<Subscription | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (subscription: Subscription) => {
    try {
      const deletedSubscriptions = await subscription.delete();
      if (!deletedSubscriptions || deletedSubscriptions.length < 1)
        throw new Error('No subscription deleted');
      startTransition(() => {
        setSubscriptions((prev) => prev.filter(({ id }) => id !== subscription.id));
      });
      showSnackbar({ message: `Subscription ${subscription.receiver} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete transaction`,
        action: <Button onClick={() => handleDelete(subscription)}>Retry</Button>,
      });
    }
  };

  React.useEffect(() => setShownSubscriptions(subscriptions), [subscriptions]);

  React.useEffect(() => {
    setShownSubscriptions(filterSubscriptions(keyword, filter, subscriptions));
  }, [keyword, filter, subscriptions]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Subscriptions" description="You got Disney+?" />

      <Grid item xs={12} md={12}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your monthly subscriptions</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ShowFilterButton />
              <SearchInput onSearch={handleOnSearch} />
              <Tooltip title="Add Subscription">
                <IconButton aria-label="add-subscription" onClick={() => setShowAddForm(true)}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : subscriptions.length > 0 ? (
            <>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Subscriptions Table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Next execution</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Information</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shownSubscriptions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="bold">
                                {determineNextExecution(row.execute_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <CategoryChip category={row.categories} />
                            </TableCell>
                            <TableCell>{row.receiver}</TableCell>
                            <TableCell>
                              {row.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </TableCell>
                            <TableCell>
                              <PaymentMethodChip paymentMethod={row.paymentMethods} />
                            </TableCell>
                            <TableCell>{row.description || 'No Information'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit" placement="top">
                                <IconButton onClick={() => setEditSubscription(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton onClick={() => handleDelete(row)}>
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
                  count={shownSubscriptions.length}
                  page={page}
                  onPageChange={handlePageChange}
                  labelRowsPerPage="Rows:"
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No subscriptions found" />
          )}
        </Card>
      </Grid>

      <CreateSubscription open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditSubscription
        open={editSubscription !== null}
        setOpen={(show) => {
          if (!show) setEditSubscription(null);
        }}
        subscription={editSubscription}
      />
    </Grid>
  );
};
