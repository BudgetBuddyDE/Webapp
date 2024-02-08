import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { Grid, InputAdornment, TextField } from '@mui/material';
import React from 'react';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { useScreenSize, type TEntityDrawerState } from '@/hooks';
import { SearchStock, StockExchanges, type TSearchStockOption, type TStockPosition } from './index';
import { StockExchangeAutocomplete } from './StockExchangeAutocomplete.component';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StockService } from './Stock.service';

export type TAddStockPositionDrawerPayload = TStockPosition;

export type TAddStockPositionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TAddStockPositionDrawerPayload>;

interface IAddStockPositionDrawerHandler {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'exchange',
    value: string | number
  ) => void;
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
  const { session } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    boughtAt: new Date(),
  });

  const handler: IAddStockPositionDrawerHandler = {
    onClose() {
      onClose();
      setForm({});
      setDrawerState({ type: 'RESET' });
    },
    onDateChange(date) {
      if (!date) return;
      setForm((prev) => ({ ...prev, boughtAt: date }));
    },
    onAutocompleteChange(_event, key, value) {
      setForm((prev) => ({ ...prev, [key]: value }));
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
        console.log('form', form);

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
      boughtAt: payload.boughtAt,
      exchange: payload.exchange.exchange,
      buyIn: payload.buyIn,
      amount: payload.amount,
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

        <Grid item xs={12}>
          <SearchStock onChange={handler.onSelectAsset} />
        </Grid>

        <Grid item xs={12} md={12}>
          <StockExchangeAutocomplete
            onChange={(event, value) =>
              handler.onAutocompleteChange(event, 'exchange', String(value?.exchange))
            }
            defaultValue={
              payload?.exchange
                ? StockService.getStockExchangeInputOptionFromList(
                    payload?.exchange,
                    StockExchanges
                  )
                : undefined
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="amount"
            variant="outlined"
            type="number"
            label="Amount"
            name="amount"
            fullWidth
            onChange={handler.onInputChange}
            value={form.amount}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            id="buy-in"
            variant="outlined"
            type="number"
            label="Buy in"
            name="buyIn"
            fullWidth
            onChange={handler.onInputChange}
            value={form.buyIn}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{payload?.currency ?? 'EUR'}</InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={12}>
          {form.buyIn && form.amount && (
            <TextField
              variant="outlined"
              label="Volume"
              fullWidth
              value={Number(form.amount) * Number(form.buyIn)}
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
