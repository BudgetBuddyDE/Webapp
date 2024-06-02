import {type TCreateCategoryPayload, ZCreateCategoryPayload} from '@budgetbuddyde/types';
import {AddRounded, DeleteRounded} from '@mui/icons-material';
import {Box, Button, Grid, IconButton, Stack, TextField} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {RecordModel} from 'pocketbase';
import React from 'react';
import {z} from 'zod';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {FullScreenDialog, type TFullScreenDialogProps} from '@/components/Base';
import {CategoryService, type TCategoryDrawerValues, useFetchCategories} from '@/components/Category';
import {useSnackbarContext} from '@/components/Snackbar';
import {useKeyPress, useScreenSize} from '@/hooks';

import {DesktopFeatureOnly} from '../DesktopFeatureOnly/DesktopFeatureOnly.component';

export type TCreateMultipleTransactionsDialogProps = Omit<TFullScreenDialogProps, 'title'>;

type TRow = TCategoryDrawerValues & {
  tempId: number;
};

const DEFAULT_VALUE: () => TRow = () => ({
  tempId: Date.now(),
  name: '',
  description: '',
});

export const CreateMultipleCategoriesDialog: React.FC<TCreateMultipleTransactionsDialogProps> = ({...dialogProps}) => {
  const screenSize = useScreenSize();
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshCategories} = useFetchCategories();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [form, setForm] = React.useState<TRow[]>([DEFAULT_VALUE()]);

  const handler = {
    close: () => {
      setForm([DEFAULT_VALUE()]);
      dialogProps.onClose();
    },
    addRow: () => setForm(prev => [...prev, DEFAULT_VALUE()]),
    removeRow: (id: number) => setForm(prev => prev.filter(item => item.tempId !== id)),
    changeName: (idx: number, value: string) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].name = value;
        return newForm;
      });
    },
    changeDescription: (idx: number, value: string) => {
      setForm(prev => {
        const newForm = [...prev];
        newForm[idx].description = value;
        return newForm;
      });
    },
    onSubmit: async () => {
      try {
        const parsedForm = z.array(ZCreateCategoryPayload).safeParse(
          form.map(row => ({
            name: row.name,
            description: row.description,
            owner: sessionUser?.id,
          })),
        );
        if (!parsedForm.success) {
          throw parsedForm.error;
        }
        const payload: TCreateCategoryPayload[] = parsedForm.data;
        const submittedPromises = await Promise.allSettled(payload.map(CategoryService.createCategory));
        const createdCategorie: RecordModel[] = submittedPromises
          .map(promise => (promise.status == 'fulfilled' ? promise.value : null))
          .filter(value => value !== null) as RecordModel[];

        if (createdCategorie.length === 0) {
          throw new Error('No categories were created');
        }

        handler.close();
        React.startTransition(() => {
          refreshCategories();
        });
        showSnackbar({
          message:
            createdCategorie.length === 1
              ? `Created category #${createdCategorie[0].id}`
              : `Created ${createdCategorie.length} categories`,
        });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: 'Error while submitting the forms',
          action: (
            <Button size="small" onClick={handler.onSubmit}>
              Retry
            </Button>
          ),
        });
      }
    },
  };

  useKeyPress(
    ['s'],
    e => {
      e.preventDefault();
      handler.onSubmit();
    },
    null,
    true,
  );

  return (
    <FullScreenDialog
      ref={dialogRef}
      title="Create Categories"
      wrapInDialogContent={screenSize !== 'small'}
      {...dialogProps}
      dialogContentProps={{sx: {p: 0}}}
      dialogActionsProps={
        screenSize !== 'small'
          ? {
              sx: {justifyContent: 'unset'},
              children: (
                <Stack
                  direction="row"
                  spacing={AppConfig.baseSpacing}
                  sx={{width: '100%', justifyContent: 'space-between'}}>
                  <Button startIcon={<AddRounded />} onClick={handler.addRow}>
                    Add row
                  </Button>
                  <Box>
                    <Button onClick={handler.close} sx={{mr: 1}}>
                      Cancel
                    </Button>
                    <Button onClick={handler.onSubmit} variant="contained" color="primary">
                      Save
                    </Button>
                  </Box>
                </Stack>
              ),
            }
          : undefined
      }>
      {screenSize !== 'small' ? (
        <form onSubmit={handler.onSubmit}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={AppConfig.baseSpacing}>
              {form.map((row, idx) => (
                <Grid key={row.tempId} container item md={12} spacing={AppConfig.baseSpacing}>
                  {idx !== 0 && (
                    <Grid item md={0.55}>
                      <IconButton
                        onClick={() => handler.removeRow(row.tempId)}
                        size="large"
                        sx={{width: '54px', height: '54px'}}>
                        <DeleteRounded />
                      </IconButton>
                    </Grid>
                  )}
                  <Grid item md={idx !== 0 ? 2.45 : 3}>
                    <TextField
                      label="Name"
                      value={row.name}
                      onChange={event => handler.changeName(idx, event.target.value)}
                      fullWidth
                      multiline
                    />
                  </Grid>
                  <Grid item md={6}>
                    <TextField
                      label="Description"
                      value={row.description}
                      onChange={event => handler.changeDescription(idx, event.target.value)}
                      fullWidth
                      multiline
                    />
                  </Grid>
                  <Grid item md={3}>
                    <TextField
                      label="Created by"
                      value={sessionUser?.id}
                      onChange={event => handler.changeDescription(idx, event.target.value)}
                      disabled
                      fullWidth
                      multiline
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </LocalizationProvider>
        </form>
      ) : (
        <DesktopFeatureOnly
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            p: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}
    </FullScreenDialog>
  );
};
