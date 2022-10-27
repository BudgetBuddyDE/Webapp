import { useRef, useContext, useState } from 'react';
import {
  Box,
  Avatar,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import Card from './card.component';
import { AuthContext } from '../context/auth.context';
import { SnackbarContext } from '../context/snackbar.context';
import { useStateCallback } from '../hooks/useStateCallback.hook';
import { format } from 'date-fns';
import { CategoryService } from '../services/category.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { BudgetService } from '../services/budget.service';
import { ProfileService } from '../services/profile.service';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';

export type TExportType = 'json' | 'csv';

const EXPORT_TYPES = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
];

export const UserProfile = () => {
  const downloadButtonRef = useRef<HTMLAnchorElement | null>(null);
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [exportType, setExportType] = useState(EXPORT_TYPES[0].value);
  const [preparingDownload, setPreparingDownload] = useState(false);
  const [downloadData, setDownloadData] = useStateCallback<
    | {
        budget: any[] | string;
        categories: any[] | string;
        paymentMethods: any[] | string;
        profile: any[] | string;
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
        const [budget, categories, paymentMethods, profiles, subscriptions, transactions] =
          await Promise.all([
            // @ts-ignore
            BudgetService.export(exportType),
            // @ts-ignore
            CategoryService.export(exportType),
            // @ts-ignore
            PaymentMethodService.export(exportType),
            // @ts-ignore
            ProfileService.export(session!.user!.id, exportType),
            // @ts-ignore
            SubscriptionService.export(exportType),
            // @ts-ignore
            TransactionService.export(exportType),
          ]);

        switch (exportType) {
          case 'json':
            setDownloadData(
              {
                budget: budget,
                categories: categories,
                paymentMethods: paymentMethods,
                profile: profiles,
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
                  `budget_buddy_${session?.user?.email}_${format(
                    new Date(),
                    'dd.MM.yy'
                  )}.${exportType}`
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
                profile: profiles,
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
                    `budget_buddy_${category}_${session?.user?.email}_${format(
                      new Date(),
                      'dd.MM.yy'
                    )}.${exportType}`
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
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Profile</Card.Title>
        </Box>
      </Card.Header>
      <Card.Body>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Avatar variant="rounded" sx={{ width: '4rem', height: '4rem', mx: 'auto' }}>
            {session &&
              session.user &&
              session.user.email &&
              session.user.email.substring(0, 2).toUpperCase()}
          </Avatar>

          <TextField
            disabled
            id="profile-uuid"
            name="profile-uuid"
            label="UUID"
            defaultValue={session?.user?.id}
            sx={{ mt: 2 }}
          />

          <TextField
            disabled
            id="profile-email"
            name="profile-email"
            label="E-Mail"
            defaultValue={session?.user?.email}
            sx={{ mt: 2 }}
          />

          <Divider sx={{ mt: 2 }} />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="profile-export-type-label">Export data</InputLabel>
            <Select
              id="profile-export-type"
              labelId="profile-export-type-label"
              label="Export data"
              value={exportType}
              onChange={(event) => setExportType(event.target.value)}
            >
              {EXPORT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          disabled={preparingDownload}
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleDataExport}
        >
          {preparingDownload && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Start export
        </Button>

        <a aria-hidden="true" ref={downloadButtonRef} style={{ display: 'none' }}>
          File Download Button
        </a>
      </Card.Body>
    </Card>
  );
};