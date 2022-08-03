import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { PageHeader } from '../components/page-header.component';
import Card from '../components/card.component';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { SearchInput } from '../components/search-input.component';
import TablePagination from '@mui/material/TablePagination';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import { IPaymentMethod } from '../types/transaction.interface';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

export const PaymentMethods = () => {
  const { session } = useContext(AuthContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [shownPaymentMethods, setShownPaymentMethods] =
    useState<readonly IPaymentMethod[]>(paymentMethods);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => setShownPaymentMethods(paymentMethods), [paymentMethods]);

  useEffect(() => {
    if (keyword === '') setShownPaymentMethods(paymentMethods);
    setShownPaymentMethods(
      paymentMethods.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
      )
    );
  }, [keyword]);

  useEffect(() => {
    getPaymentMethods()
      .then((data) => {
        if (data) {
          setPaymentMethods(data);
        } else setPaymentMethods([]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [session]);

  async function getPaymentMethods(): Promise<IPaymentMethod[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IPaymentMethod>('paymentMethods').select('*');
      if (error) rej(error);
      res(data);
    });
  }

  return (
    <Grid container spacing={3}>
      <PageHeader title="Payment Methods" description="How are u paying today, sir?" />

      <Grid item xs={12} md={12} lg={12}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Payment Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <SearchInput sx={{ mr: '.5rem' }} onSearch={handleOnSearch} />
              <Tooltip title="Add Payment Method">
                <IconButton aria-label="add-payment-method">
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="Payment Methods Table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shownPaymentMethods
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.provider}</TableCell>
                        <TableCell>{row.address}</TableCell>
                        <TableCell>{row.description || 'No Description'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card.Body>
          <Card.Footer>
            {/* TODO: Add pagination */}
            <TablePagination
              component="div"
              count={shownPaymentMethods.length}
              page={page}
              onPageChange={handlePageChange}
              labelRowsPerPage="Rows:"
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card.Footer>
        </Card>
      </Grid>
    </Grid>
  );
};
