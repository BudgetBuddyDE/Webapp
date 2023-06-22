import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { AuthContext, SnackbarContext } from '../../context';
import { useStateCallback } from '../../hooks';
import {
  BudgetService,
  CategoryService,
  PaymentMethodService,
  SubscriptionService,
  TransactionService,
} from '../../services';

export type ExportType = 'json' | 'csv';

export const EXPORT_TYPES = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
] as { label: string; value: ExportType }[];

export type ExportProfileDataProps = {};

export const ExportProfileData: React.FC<ExportProfileDataProps> = ({}) => {
  const downloadButtonRef = React.useRef<HTMLAnchorElement | null>(null);
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [exportType, setExportType] = React.useState(EXPORT_TYPES[0].value);
  const [preparingDownload, setPreparingDownload] = React.useState(false);
  const [downloadData, setDownloadData] = useStateCallback<
    | {
        budget: any[] | string;
        categories: any[] | string;
        paymentMethods: any[] | string;
        subscriptions: any[] | string;
        transactions: any[] | string;
      }
    | {}
  >({});

  const afterFileDownload = () => {
    showSnackbar({ message: 'Data export successfull' });
  };

  const handleDataExport = async () => {
    try {
      setPreparingDownload(true);
      if (downloadButtonRef) {
        const [budget, categories, paymentMethods, subscriptions, transactions] = await Promise.all([
          BudgetService.export(exportType),
          CategoryService.export(exportType),
          PaymentMethodService.export(exportType),
          SubscriptionService.export(exportType),
          TransactionService.export(exportType),
        ]);

        switch (exportType) {
          case 'json':
            setDownloadData(
              {
                budget: budget,
                categories: categories,
                paymentMethods: paymentMethods,
                subscriptions: subscriptions,
                transactions: transactions,
              },
              (data) => {
                downloadButtonRef.current?.setAttribute(
                  'href',
                  `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
                );
                downloadButtonRef.current?.setAttribute(
                  'download',
                  `budget_buddy_${session?.user?.email}_${format(new Date(), 'dd.MM.yy')}.${exportType}`
                );
                downloadButtonRef.current?.click(); // Trigger file download
                afterFileDownload();
              }
            );
            break;

          case 'csv':
            setDownloadData(
              {
                budget: budget,
                categories: categories,
                paymentMethods: paymentMethods,
                subscriptions: subscriptions,
                transactions: transactions,
              },
              (data) => {
                Object.keys(data).forEach((category: typeof downloadData, index, list) => {
                  downloadButtonRef.current?.setAttribute(
                    'href',
                    // @ts-ignore
                    `data:text/json;charset=utf-8,${encodeURIComponent(data[category])}`
                  );
                  downloadButtonRef.current?.setAttribute(
                    'download',
                    `budget_buddy_${category}_${session?.user?.email}_${format(new Date(), 'dd.MM.yy')}.${exportType}`
                  );
                  downloadButtonRef.current?.click(); // Trigger file download
                  if (index + 1 === list.length) afterFileDownload();
                });
              }
            );
            break;
        }
      }
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: 'Data export failed',
        action: <Button onClick={handleDataExport}>Retry</Button>,
      });
    } finally {
      setPreparingDownload(false);
    }
  };

  return (
    <React.Fragment>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="profile-export-type-label">Export data</InputLabel>
        <Select
          id="profile-export-type"
          labelId="profile-export-type-label"
          label="Export data"
          value={exportType}
          onChange={(event) => setExportType(event.target.value as ExportType)}
        >
          {EXPORT_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button disabled={preparingDownload} variant="text" sx={{ mt: 2 }} onClick={handleDataExport}>
        {preparingDownload && <CircularProgress size={20} sx={{ mr: 1 }} />}
        Start export
      </Button>
      <a aria-hidden="true" ref={downloadButtonRef} style={{ display: 'none' }}>
        File Download Button
      </a>
    </React.Fragment>
  );
};
