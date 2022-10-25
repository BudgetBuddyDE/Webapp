import { useContext, useEffect, useState } from 'react';
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
  Chip,
  Button,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/inputs/search-input.component';
import type { ISubscription } from '../types/subscription.type';
import { CircularProgress } from '../components/progress.component';
import { StoreContext } from '../context/store.context';
import { SubscriptionService } from '../services/subscription.service';
import { determineNextExecution } from '../utils/determineNextExecution';
import { NoResults } from '../components/no-results.component';
import { CreateSubscription } from '../components/create-forms/create-subscription.component';
import { EditSubscription } from '../components/edit-forms/edit-subscription.component';
import { ShowFilterButton } from '../components/show-filter.component';
import { filterSubscriptions } from '../utils/filter';

export const Subscriptions = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, filter, subscriptions, setSubscriptions } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = useState('');
  const [shownSubscriptions, setShownSubscriptions] =
    useState<readonly ISubscription[]>(subscriptions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editSubscription, setEditSubscription] = useState<ISubscription | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      const data = await SubscriptionService.deleteSubscriptionById(id);
      if (data === null) throw new Error('No subscription deleted');
      setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
      showSnackbar({ message: `Subscription ${data[0].receiver} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete transaction`,
        action: <Button onClick={() => handleDelete(id)}>Retry</Button>,
      });
    }
  };

  useEffect(() => setShownSubscriptions(subscriptions), [subscriptions]);

  useEffect(() => {
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
                              <Chip label={row.categories.name} variant="outlined" />
                            </TableCell>
                            <TableCell>{row.receiver}</TableCell>
                            <TableCell>
                              {row.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip label={row.paymentMethods.name} variant="outlined" />
                            </TableCell>
                            <TableCell>{row.description || 'No Information'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit" placement="top">
                                <IconButton onClick={() => setEditSubscription(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton onClick={() => handleDelete(row.id)}>
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

      {/* Add Subscription */}
      <CreateSubscription open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      {/* Edit Subscription */}
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
