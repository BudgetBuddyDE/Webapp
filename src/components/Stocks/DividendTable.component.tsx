import React from 'react';
import { Chip, TableCell, TableRow, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Table } from '../Base/Table';
import { type TDividendDetails } from './types';
import { AppConfig } from '@/app.config';
import { StockPrice } from './StockPrice.component';
import { useFetchStockPositions } from './useFetchStockPositions.hook';
import { StockService } from './Stock.service';

export type TDividendTableProps = {
  dividends: TDividendDetails[];
};

export const DividendTable: React.FC<TDividendTableProps> = ({ dividends }) => {
  const { loading: loadingStockPositions, positions: stockPositions } = useFetchStockPositions();

  const futureDividends = React.useMemo(() => {
    return StockService.transformDividendDetails(dividends);
  }, [dividends]);

  return (
    <Table<(typeof futureDividends)[0]>
      data={futureDividends}
      title="Dividends"
      headerCells={['Company', 'Ex-Date', 'Payment-Date', 'Price', 'Total']}
      renderHeaderCell={(headerCell) => (
        <TableCell
          key={headerCell.replaceAll(' ', '_').toLowerCase()}
          size={AppConfig.table.cellSize}
        >
          <Typography fontWeight="bolder">{headerCell}</Typography>
        </TableCell>
      )}
      renderRow={(data) => {
        const matchingPositions = stockPositions.filter(
          (position) => position.isin === data.companyInfo?.security.isin
        );
        // matchingPosition = Array(matchingPositions).at(-1);
        const totalQuantity = matchingPositions.reduce((prev, cur) => prev + cur.quantity, 0);
        return (
          <TableRow key={data.key}>
            <TableCell>
              <Typography>{data.companyInfo?.name}</Typography>
              <Chip label={data.companyInfo?.security.isin} size="small" sx={{ mr: 1 }} />
              <Chip label={data.companyInfo?.security.wkn} size="small" />
            </TableCell>
            <TableCell>
              <Typography>{format(data.dividend.exDate, 'dd.MM.yy')}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{format(data.dividend.paymentDate, 'dd.MM.yy')}</Typography>
            </TableCell>
            <TableCell>
              <StockPrice price={data.dividend.price} currency={data.dividend.currency} />
            </TableCell>
            <TableCell>
              <Typography variant="caption">{totalQuantity}x</Typography>
              <StockPrice
                price={totalQuantity * data.dividend.price}
                currency={data.dividend.currency}
              />
            </TableCell>
          </TableRow>
        );
      }}
      isLoading={loadingStockPositions}
    />
  );
};
