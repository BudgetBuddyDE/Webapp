import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { type TEntityDrawerState, useScreenSize } from '@/hooks';
import {
  Alert,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { TransactionService, useFetchTransactions } from '.';
import { CategoryAutocomplete, getCategoryFromList, useFetchCategories } from '../Category';
import {
  FileUpload,
  FileUploadPreview,
  ReceiverAutocomplete,
  type TFileUploadProps,
} from '@/components/Base';
import {
  PaymentMethodAutocomplete,
  getPaymentMethodFromList,
  useFetchPaymentMethods,
} from '../PaymentMethod';
import {
  ZUpdateTransactionPayload,
  type TUpdateTransactionPayload,
  type TTransactionFile,
} from '@budgetbuddyde/types';
import { transformBalance } from '@/utils/transformBalance.util';
import { FileService } from '@/services/File.service';
import { AppConfig } from '@/app.config';

interface IEditTransactionDrawerHandler extends Pick<TFileUploadProps, 'onFileUpload'> {
  onClose: () => void;
  onDateChange: (date: Date | null) => void;
  onAutocompleteChange: (
    event: React.SyntheticEvent<Element, Event>,
    key: 'categoryId' | 'paymentMethodId',
    value: string | number
  ) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onReceiverChange: (value: string | number) => void;
  onFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type TEditTransactionDrawerProps = {
  onClose: () => void;
} & TEntityDrawerState<TUpdateTransactionPayload>;

export const EditTransactionDrawer: React.FC<TEditTransactionDrawerProps> = ({
  shown,
  payload,
  onClose,
}) => {
  const screenSize = useScreenSize();
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const {
    refresh: refreshTransactions,
    transactions,
    loading: loadingTransactions,
  } = useFetchTransactions();
  const { categories } = useFetchCategories();
  const { paymentMethods } = useFetchPaymentMethods();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  // const [uploadedFilesPreview, setUploadedFilesPreview] = React.useState<
  //   (Omit<TTransactionFile, 'createdAt' | 'uuid' | 'location'> & {
  //     buffer: string | ArrayBuffer | null;
  //     test: string;
  //   })[]
  // >([]);
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({
    date: new Date(),
  });

  const attachedTransactionFiles: TTransactionFile[] = React.useMemo(() => {
    if (loadingTransactions || !payload) return [];
    const transaction = transactions.find(
      (transaction) => transaction.id === payload.transactionId
    );
    return transaction?.attachedFiles ?? [];
  }, [loadingTransactions, transactions, payload]);

  const handler: IEditTransactionDrawerHandler = {
    onClose() {
      onClose();
      setForm({ processedAt: new Date() });
      setDrawerState({ type: 'RESET' });
    },
    onDateChange(value: string | number | Date | null, _keyboardInputValue?: string | undefined) {
      if (!value) return;
      setForm((prev) => ({ ...prev, processedAt: value }));
    },
    onAutocompleteChange: (_event, key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onReceiverChange(value) {
      setForm((prev) => ({ ...prev, receiver: String(value) }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session || !payload) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        const parsedForm = ZUpdateTransactionPayload.safeParse({
          ...form,
          transactionId: payload.transactionId,
          transferAmount: transformBalance(String(form.transferAmount)),
          // attachedFiles: uploadedFiles.map((file) =>
          //   TransactionService.transformTFileToCreatePayload(
          //     file,
          //     payload.transactionId,
          //     authOptions
          //   )
          // ),
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const requestPayload: TUpdateTransactionPayload = parsedForm.data;
        const [updatedTransaction, error] = await TransactionService.update(
          requestPayload,
          authOptions
        );
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!updatedTransaction) {
          setDrawerState({ type: 'ERROR', error: new Error("Couldn't save the transaction") });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        handler.onClose();
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({ message: `Saved the applied changes` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
    async onFileUpload(files) {
      if (!payload) return;
      const filesArray = Array.from(files);
      if (filesArray.length > 5) {
        return showSnackbar({ message: 'You can only upload 4 files at once' });
      }

      const acceptedFiles = filesArray.filter((file) =>
        AppConfig.allowedFileTypes.includes(file.type)
      );

      if (acceptedFiles.length !== filesArray.length) {
        const blockedAmount = filesArray.length - acceptedFiles.length;
        return showSnackbar({
          message: `Only images are allowed! ${blockedAmount} ${
            blockedAmount > 1 ? 'files' : 'file'
          } ${blockedAmount > 1 ? "we're" : 'was'} blocked!`,
        });
      }
      const [uploadedFiles, error] = await FileService.attachFilesToTransaction(
        payload.transactionId,
        acceptedFiles,
        authOptions
      );
      if (error) {
        return showSnackbar({ message: error.message });
      }

      const amount = uploadedFiles.length;
      React.startTransition(() => {
        refreshTransactions().then(() =>
          showSnackbar({
            message: `${amount} ${amount > 1 ? 'files' : 'file'} ${
              amount > 1 ? "we're" : 'was'
            } uploaded!`,
          })
        );
      });

      // let previewFiles: typeof uploadedFilesPreview = [];
      // acceptedFiles.forEach((file) => {
      //   const reader = new FileReader();
      //   const r1 = new FileReader();
      //   reader.onloadend = () => {
      //     r1.onloadend = () => {
      //       previewFiles.push({
      //         fileName: file.name,
      //         fileSize: file.size,
      //         mimeType: file.type,
      //         buffer: reader.result,
      //         test: r1.result?.toString() ?? '',
      //       });
      //     };
      //   };
      //   reader.readAsDataURL(file);
      //   r1.readAsText(file);
      // });
      // setUploadedFilesPreview(previewFiles);
    },
  };

  React.useLayoutEffect(() => {
    if (!payload) return setForm({ processedAt: new Date() });
    const { categoryId, description, paymentMethodId, processedAt, receiver, transferAmount } =
      payload;
    setForm({
      processedAt: processedAt,
      receiver: receiver,
      categoryId: categoryId,
      paymentMethodId: paymentMethodId,
      transferAmount: transferAmount,
      description: description ?? '',
    });
    return () => {
      setForm({});
      // setUploadedFilesPreview([]);
    };
  }, [payload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Update Transaction"
      onClose={handler.onClose}
      closeOnBackdropClick
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {screenSize === 'small' ? (
          <MobileDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processedAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
          />
        ) : (
          <DesktopDatePicker
            label="Date"
            inputFormat="dd.MM.yy"
            value={form.processedAt}
            onChange={handler.onDateChange}
            renderInput={(params) => <TextField sx={FormStyle} {...params} required />}
          />
        )}
      </LocalizationProvider>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <CategoryAutocomplete
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'categoryId', Number(value?.value))
          }
          defaultValue={payload ? getCategoryFromList(payload.categoryId, categories) : undefined}
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />

        <PaymentMethodAutocomplete
          onChange={(event, value) =>
            handler.onAutocompleteChange(event, 'paymentMethodId', Number(value?.value))
          }
          defaultValue={
            payload ? getPaymentMethodFromList(payload.paymentMethodId, paymentMethods) : undefined
          }
          sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
          required
        />
      </Box>

      <ReceiverAutocomplete
        sx={FormStyle}
        id="receiver"
        label="Receiver"
        options={TransactionService.getUniqueReceivers(transactions).map((receiver) => ({
          label: receiver,
          value: receiver,
        }))}
        defaultValue={payload?.receiver}
        onValueChange={(value) => handler.onReceiverChange(String(value))}
        required
      />

      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount">Amount</InputLabel>
        <OutlinedInput
          id="transferAmount"
          label="Amount"
          name="transferAmount"
          inputProps={{ inputMode: 'numeric' }}
          onChange={handler.onInputChange}
          value={form.transferAmount}
          defaultValue={payload?.transferAmount}
          startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
      </FormControl>

      <TextField
        id="description"
        variant="outlined"
        label="Description"
        name="description"
        sx={FormStyle}
        multiline
        rows={2}
        onChange={handler.onInputChange}
        value={form.description}
        defaultValue={payload?.description ?? ''}
      />

      {/* upload */}
      <Grid container spacing={2} columns={10}>
        <Grid item xs={12}>
          <Alert severity="warning">
            Files will be automatically attached to the transaction after uploading them. Currently
            there is no way to delete a file from a transaction.
          </Alert>
        </Grid>

        <Grid item xs={2}>
          <FileUpload sx={{ width: '100%' }} onFileUpload={handler.onFileUpload} multiple />
        </Grid>
        {attachedTransactionFiles.map((file) => (
          <Grid item key={file.uuid} xs={2}>
            <FileUploadPreview
              {...file}
              buffer={null}
              location={FileService.getAuthentificatedFileLink(file.location, authOptions)}
            />
          </Grid>
        ))}

        {/* {uploadedFilesPreview.map((file, index) => (
          <Grid item key={index} xs={2}>
            <FileUploadPreview
              {...file}
              onDelete={(file) =>
                setUploadedFilesPreview((prev) => prev.filter((p) => p.fileName !== file.fileName))
              }
            />
          </Grid>
        ))} */}
      </Grid>
    </FormDrawer>
  );
};
