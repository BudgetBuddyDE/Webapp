import React from 'react';
import { Grid, InputAdornment, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { useScreenSize, type TEntityDrawerState } from '@/hooks';
import { ZOpenPositionPayload, type TOpenPositionPayload } from '@budgetbuddyde/types';
import { SearchStock, type TSearchStockOption } from './SearchStock.component';
import {
  SelectStockExchange,
  type TSelectStockExchangeOption,
} from './SelectStockExchange.component';
import { StockService } from './Stock.service';
import { useStockStore } from './Stock.store';
import { transformBalance } from '@/utils';

export type TAddStockPositionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TOpenPositionPayload>;

interface IAddStockPositionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onExchangeChange: (value: TSelectStockExchangeOption | null) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectAsset: (selectedAsset: TSearchStockOption | null) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const AddStockPositionDrawer: React.FC<TAddStockPositionDrawerProps> = ({
  shown,
  payload,
  onClose,
}) => {
  const screenSize = useScreenSize();
  const { set: setStockPositions } = useStockStore();
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    bought_at: new Date(),
  });

  const handler: IAddStockPositionDrawerHandler = {
    onClose() {
      onClose();
      setForm({ bought_at: new Date() });
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
    onSelectAsset(selectedAsset) {
      if (!selectedAsset) return;
      setForm((prev) => ({ ...prev, isin: selectedAsset.isin }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        const parsedForm = ZOpenPositionPayload.safeParse({
          ...form,
          buy_in: transformBalance(form.buy_in as string),
          quantity: transformBalance(form.quantity as string),
          owner: session.uuid,
          currency: 'EUR',
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const requestPayload: TOpenPositionPayload = parsedForm.data;

        const [positions, error] = await StockService.openPositions([requestPayload], authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error });
          return;
        }
        if (!positions || positions.length < 1) {
          setDrawerState({ type: 'ERROR', error: new Error('Error opening position') });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        showSnackbar({ message: `Position saved` });
        React.startTransition(() => {
          setStockPositions(positions);
        });
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
      heading="Add position"
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
                value={form.boughtAt}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField fullWidth {...params} required />}
              />
            ) : (
              <DesktopDatePicker
                label="Bought at"
                inputFormat="dd.MM.yy"
                value={form.boughtAt}
                onChange={handler.onDateChange}
                renderInput={(params) => <TextField fullWidth {...params} required />}
              />
            )}
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={12}>
          <SearchStock onChange={handler.onSelectAsset} />
        </Grid>

        <Grid item xs={12} md={12}>
          <SelectStockExchange onChange={handler.onExchangeChange} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="quantity"
            variant="outlined"
            label="Amount"
            name="quantity"
            fullWidth
            onChange={handler.onInputChange}
            value={form.amount}
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
            value={form.buyIn}
            required
            InputProps={{
              inputMode: 'numeric',
              endAdornment: (
                <InputAdornment position="start">{payload?.currency ?? 'EUR'}</InputAdornment>
              ),
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
                endAdornment: (
                  <InputAdornment position="start">{payload?.currency ?? 'EUR'}</InputAdornment>
                ),
              }}
              disabled
            />
          )}
        </Grid>
      </Grid>
    </FormDrawer>
  );
};
