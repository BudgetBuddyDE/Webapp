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
  EditSubscription,
  Linkify,
  NoResults,
  PageHeader,
  PaymentMethodChip,
  SearchInput,
  ShowFilterButton,
} from '../components';
import Card from '../components/Base/card.component';
import { SnackbarContext, StoreContext } from '../context';
import { Subscription } from '../models';
import { determineNextExecution, filterSubscriptions } from '../utils';

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
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <ShowFilterButton />
                <SearchInput onSearch={handleOnSearch} />
                <Tooltip title="Add Subscription">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
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
                                    onClick={() => setEditSubscription(row)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                  <IconButton color="primary" onClick={() => handleDelete(row)}>
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
              <Card.Footer>
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownSubscriptions.length}
                    page={page}
                    onPageChange={handlePageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </React.Fragment>
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
