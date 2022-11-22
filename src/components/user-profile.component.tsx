import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { useContext, useRef, useState } from 'react';
import { AuthContext } from '../context/auth.context';
import { SnackbarContext } from '../context/snackbar.context';
import { useStateCallback } from '../hooks/useStateCallback.hook';
import { BudgetService } from '../services/budget.service';
import { CategoryService } from '../services/category.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';
import { UserService } from '../services/user.service';
import Card from './card.component';
import { ProfileAvatarWithUpload } from './profile-avatar.component';

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
  const [saving, setSaving] = useState(false);
  const [newUsername, setNewUsername] = useState('');
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

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const { error } = await UserService.update({
        data: {
          username: newUsername,
        },
      });
      if (error) throw error;
      showSnackbar({
        message: 'Username updated',
      });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: error as string,
        action: <Button onClick={() => handleProfileSave()}>Retry</Button>,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    try {
      if (!session || !session.user) throw new Error('No user provided');
      if (files) {
        const file = files[0];
        if (!['jpeg', 'jpg', 'png'].some((type) => file.type.includes(type)))
          throw new Error('You can only upload png or jpg files');
        const { data, error } = await UserService.uploadAvatar(session.user, files[0]);
        if (error) throw error;
        if (!data) throw new Error('No image got uploaded');
        const updateUser = await UserService.update({
          data: {
            avatar: `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${data?.Key}`,
          },
        });
        if (updateUser.error) throw updateUser.error;
        showSnackbar({
          message:
            'Your avatar has been uploaded. It may take a moment for the changes to be applied',
        });
      }
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: typeof error === 'string' ? error : JSON.stringify(error),
        action: <Button onClick={() => handleAvatarUpload(files)}>Retry</Button>,
      });
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
          {session && session.user && (
            <ProfileAvatarWithUpload
              sx={{ width: '6rem', height: '6rem', mx: 'auto' }}
              user={session.user}
              onUpload={handleAvatarUpload}
            />
          )}

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

          <TextField
            id="profile-username"
            name="profile-username"
            label="Username"
            defaultValue={session?.user?.user_metadata.username}
            onChange={(event) => setNewUsername(event.target.value)}
            sx={{ mt: 2 }}
          />

          <Box>
            <Button
              disabled={saving}
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleProfileSave}
            >
              {saving && <CircularProgress size={20} sx={{ mr: 1 }} />}
              Save
            </Button>
          </Box>

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
