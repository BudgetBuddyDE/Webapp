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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import {
  ActionPaper,
  Card,
  CircularProgress,
  CreatePaymentMethod,
  EditPaymentMethod,
  Linkify,
  NoResults,
  PageHeader,
  PieChart,
  PieChartData,
  SearchInput,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { PaymentMethod } from '../models';

const rowsPerPageOptions = [10, 25, 50, 100];

export const PaymentMethods = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactions, subscriptions, paymentMethods, setPaymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<PaymentMethod | null>(null);
  const [chartContent, setChartContent] = React.useState<'TRANSACTIONS' | 'SUBSCRIPTIONS'>(
    'TRANSACTIONS'
  );

  const handler: {
    onSearch: (keyword: string) => void;
    paginator: {
      onPageChange: (event: unknown, newPage: number) => void;
      onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
    paymentMethod: {
      onDelete: (paymentMethod: PaymentMethod) => void;
    };
  } = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    paginator: {
      onPageChange(event, newPage) {
        setPage(newPage);
      },
      onChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      },
    },
    paymentMethod: {
      async onDelete(paymentMethod) {
        try {
          const deletedPaymentMethods = await paymentMethod.delete();
          if (!deletedPaymentMethods || deletedPaymentMethods.length < 1)
            throw new Error('No payment-method deleted');
          startTransition(() => {
            setPaymentMethods((prev) => prev.filter(({ id }) => id !== paymentMethod.id));
          });
          showSnackbar({ message: `Payment Method ${paymentMethod.name} deleted` });
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: `Could'nt delete payment method`,
            action: (
              <Button onClick={() => handler.paymentMethod.onDelete(paymentMethod)}>Retry</Button>
            ),
          });
        }
      },
    },
  };

  const shownPaymentMethods: PaymentMethod[] = React.useMemo(() => {
    if (keyword === '') return paymentMethods;
    return paymentMethods.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
    );
  }, [keyword, paymentMethods]);

  const paymentMethodsUsedInTransactions = React.useMemo(() => {
    if (paymentMethods.length < 1 || transactions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      count: transactions.reduce((prev, cur) => prev + (cur.paymentMethods.id === id ? 1 : 0), 0),
    }));
  }, [paymentMethods, transactions]);

  const paymentMethodsUsedInSubscriptions = React.useMemo(() => {
    if (paymentMethods.length < 1 || subscriptions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      count: subscriptions.reduce((prev, cur) => prev + (cur.paymentMethods.id === id ? 1 : 0), 0),
    }));
  }, [paymentMethods, subscriptions]);

  const countedChartData: PieChartData[] = React.useMemo(() => {
    return (
      chartContent === 'TRANSACTIONS'
        ? paymentMethodsUsedInTransactions
        : paymentMethodsUsedInSubscriptions
    ).map(({ name, count }) => ({
      label: name,
      value: count,
    }));
  }, [chartContent, paymentMethodsUsedInTransactions, paymentMethodsUsedInSubscriptions]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Payment Methods" description="How are u paying today, sir?" />

      <Grid item xs={12} md={9} lg={8} xl={9} order={{ xs: 2, md: 1 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Payment Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Payment Method">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : paymentMethods.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Payment Methods Table">
                    <TableHead>
                      <TableRow>
                        {['Name', 'Provider', 'Address', 'Description', ''].map((cell, index) => (
                          <TableCell key={index}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shownPaymentMethods
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
                              <Typography>{row.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.provider}</Linkify>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.address}</Linkify>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.description ?? 'No description'}</Linkify>
                            </TableCell>
                            <TableCell align="right">
                              <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                <Tooltip title="Edit" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => setEditPaymentMethod(row)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handler.paymentMethod.onDelete(row)}
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
              <Card.Footer>
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownPaymentMethods.length}
                    page={page}
                    onPageChange={handler.paginator.onPageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handler.paginator.onChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No payment-methods found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={3} lg={4} xl={3} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Counted</Card.Title>
              <Card.Subtitle>How did u pay?</Card.Subtitle>
            </Box>

            <Card.HeaderActions>
              <ActionPaper>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  value={chartContent}
                  onChange={(event: React.BaseSyntheticEvent) =>
                    setChartContent(event.target.value)
                  }
                  exclusive
                >
                  <ToggleButton value={'TRANSACTIONS'}>Transactions</ToggleButton>
                  <ToggleButton value={'SUBSCRIPTIONS'}>Subscriptions</ToggleButton>
                </ToggleButtonGroup>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body sx={{ mt: 2 }}>
            <ParentSize>
              {({ width }) => <PieChart width={width} height={width} data={countedChartData} />}
            </ParentSize>
          </Card.Body>
        </Card>
      </Grid>

      <CreatePaymentMethod open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditPaymentMethod
        open={editPaymentMethod !== null}
        setOpen={(show) => {
          if (!show) setEditPaymentMethod(null);
        }}
        paymentMethod={editPaymentMethod}
      />
    </Grid>
  );
};
