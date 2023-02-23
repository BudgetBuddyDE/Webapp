import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ActionPaper,
  CategoryChip,
  CircularProgress,
  CreateSubscription,
  EarningsByCategory,
  EditSubscription,
  Linkify,
  NoResults,
  PageHeader,
  PaymentMethodChip,
  SearchInput,
  ShowFilterButton,
  UsedByPaymentMethod,
} from '../components';
import Card from '../components/Base/card.component';
import { SnackbarContext, StoreContext } from '../context';
import { Subscription } from '../models';
import { determineNextExecution, filterSubscriptions } from '../utils';

interface SubscriptionsHandler {
  onSearch: (keyword: string) => void;
  pagination: {
    onPageChange: (event: unknown, newPage: number) => void;
    onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  subscription: {
    onDelete: (subscription: Subscription) => void;
    onEdit: (subscription: Subscription) => void;
    onShowAddForm: () => void;
  };
}

export const Subscriptions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const {
    loading,
    filter,
    subscriptions,
    setSubscriptions,
    categories,
    paymentMethods,
    transactions,
  } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = React.useState('');
  const [, startTransition] = React.useTransition();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editSubscription, setEditSubscription] = React.useState<Subscription | null>(null);

  const handler: SubscriptionsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    pagination: {
      onPageChange(_event, newPage) {
        setPage(newPage);
      },
      onChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      },
    },
    subscription: {
      async onDelete(subscription) {
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
            action: (
              <Button onClick={() => handler.subscription.onDelete(subscription)}>Retry</Button>
            ),
          });
        }
      },
      onShowAddForm() {
        setShowAddForm(true);
      },
      onEdit(subscription) {
        setEditSubscription(subscription);
      },
    },
  };

  const shownSubscriptions: Subscription[] = React.useMemo(() => {
    return filterSubscriptions(keyword, filter, subscriptions);
  }, [subscriptions, keyword, filter]);

  const currentPageSubscriptions: Subscription[] = React.useMemo(() => {
    return shownSubscriptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownSubscriptions, page, rowsPerPage]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Subscriptions" description="You got Disney+?" />

      <Grid item xs={12} md={12}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your monthly subscriptions</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <ShowFilterButton />
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Subscription">
                  <IconButton color="primary" onClick={() => handler.subscription.onShowAddForm()}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : subscriptions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Subscriptions Table">
                    <TableHead>
                      <TableRow>
                        {[
                          'Next execution',
                          'Category',
                          'Receiver',
                          'Amount',
                          'Payment Method',
                          'Information',
                          '',
                        ].map((cell, index) => (
                          <TableCell key={index}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPageSubscriptions.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="bolder">
                              {determineNextExecution(row.execute_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <CategoryChip category={row.categories} />
                          </TableCell>
                          <TableCell>
                            <Linkify>{row.receiver}</Linkify>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {row.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <PaymentMethodChip paymentMethod={row.paymentMethods} />
                          </TableCell>
                          <TableCell>
                            <Linkify>{row.description || 'No Information'}</Linkify>
                          </TableCell>
                          <TableCell align="right">
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  color="primary"
                                  onClick={() => handler.subscription.onEdit(row)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  color="primary"
                                  onClick={() => handler.subscription.onDelete(row)}
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
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownSubscriptions.length}
                    page={page}
                    onPageChange={handler.pagination.onPageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handler.pagination.onChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No subscriptions found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={3} lg={3} xl={3}>
        {!loading && <EarningsByCategory categories={categories} transactions={transactions} />}
      </Grid>

      <Grid item xs={12} md={3} lg={3} xl={3}>
        {!loading && (
          <UsedByPaymentMethod
            paymentMethods={paymentMethods}
            transactions={transactions}
            subscriptions={subscriptions}
          />
        )}
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
