import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { Grid, InputAdornment, TextField } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { useScreenSize, type TEntityDrawerState } from '@/hooks';

import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StockService } from './Stock.service';
import { ZUpdatePositionPayload, type TUpdatePositionPayload } from '@budgetbuddyde/types';
import {
  type TSelectStockExchangeOption,
  SelectStockExchange,
  StockExchangeOptions,
} from './SelectStockExchange.component';
import { transformBalance } from '@/utils';
import { useFetchStockPositions } from './hooks/useFetchStockPositions.hook';

export type TEditStockPositionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TUpdatePositionPayload>;

interface IEditStockPositionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onExchangeChange: (value: TSelectStockExchangeOption | null) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditStockPositionDrawer: React.FC<TEditStockPositionDrawerProps> = ({
  shown,
  payload,
  onClose,
}) => {
  const screenSize = useScreenSize();
  const { session, authOptions } = useAuthContext();
  const { refresh: refreshStockPositions } = useFetchStockPositions();
  const { showSnackbar } = useSnackbarContext();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({});

  const handler: IEditStockPositionDrawerHandler = {
    onClose() {
      onClose();
      setForm({});
      setDrawerState({ type: 'RESET' });
    },
    onDateChange(date) {
      if (!date) return;
      setForm((prev) => ({ ...prev, bought_at: date }));
    },
    onExchangeChange(value) {
      if (!value) return;
      setForm((prev) => ({ ...prev, exchange: value.ticker }));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session || !payload) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        const parsedForm = ZUpdatePositionPayload.safeParse({
          ...form,
          buy_in: transformBalance(form.buy_in + ''),
          quantity: transformBalance(form.quantity + ''),
          owner: session.uuid,
          currency: 'EUR',
          isin: payload.isin,
          id: payload.id,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const requestPayload: TUpdatePositionPayload = parsedForm.data;

        const [positions, error] = await StockService.updatePositions(
          [requestPayload],
          authOptions
        );
        if (error) {
          setDrawerState({ type: 'ERROR', error });
          return;
        }
        if (!positions || positions.length < 1) {
          setDrawerState({ type: 'ERROR', error: new Error('Error updating position') });
          return;
        }

        React.startTransition(() => {
          refreshStockPositions();
        });
        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        showSnackbar({ message: `Changed saved` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useEffect(() => {
    if (!payload) return;
    setForm({
      bought_at: payload.bought_at,
      exchange: payload.exchange,
      buy_in: payload.buy_in,
      quantity: payload.quantity,
    });
  }, [payload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Update position"
      onClose={() => {
        onClose();
        setForm({});
        setDrawerState({ type: 'RESET' });
      }}
      closeOnBackdropClick
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {screenSize === 'small' ? (
              <MobileDatePicker
                label="Bought at"
                inputFormat="dd.MM.yy"
                value={form.bought_at}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField fullWidth {...params} required />}
              />
            ) : (
              <DesktopDatePicker
                label="Bought at"
                inputFormat="dd.MM.yy"
                value={form.bought_at}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField fullWidth {...params} required />}
              />
            )}
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={12}>
          <SelectStockExchange
            onChange={handler.onExchangeChange}
            defaultValue={
              payload?.exchange
                ? StockService.getStockExchangeInputOptionFromList(
                    payload?.exchange,
                    StockExchangeOptions
                  )
                : undefined
            }
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="quantity"
            variant="outlined"
            label="Amount"
            name="quantity"
            fullWidth
            onChange={handler.onInputChange}
            value={form.quantity}
            InputProps={{ inputMode: 'numeric' }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="buy_in"
            variant="outlined"
            label="Buy in"
            name="buy_in"
            fullWidth
            onChange={handler.onInputChange}
            value={form.buy_in}
            required
            InputProps={{
              inputMode: 'numeric',
              endAdornment: <InputAdornment position="start">{'EUR'}</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          {form.buy_in && form.quantity && (
            <TextField
              variant="outlined"
              label="Volume"
              fullWidth
              value={Number(form.quantity) * Number(form.buy_in)}
              InputProps={{
                endAdornment: <InputAdornment position="start">{'EUR'}</InputAdornment>,
              }}
              disabled
            />
          )}
        </Grid>
      </Grid>
    </FormDrawer>
  );
};
