import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import {
    Alert,
    AlertTitle,
    Autocomplete,
    CircularProgress,
    type SxProps,
    TextField,
    type Theme,
    Typography,
    createFilterOptions,
} from '@mui/material';
import { StyledAutocompleteOption } from '../Inputs/StyledAutocompleteOption.component';
import { CreatePaymentMethodAlert } from './CreatePaymentMethodAlert.component';

export type PaymentMethodInputOption = {
    label: string;
    value: number | string;
    shouldCreate?: boolean;
};

export type PaymentMethodAutocompleteProps = {
    defaultValue?: PaymentMethodInputOption | null;
    onChange: (event: React.SyntheticEvent<Element, Event>, value: PaymentMethodInputOption | null) => void;
    sx?: SxProps<Theme>;
};

const filter = createFilterOptions<PaymentMethodInputOption>();
const labelSeperator = '•';

export const PaymentMethodAutocomplete: React.FC<PaymentMethodAutocompleteProps> = ({
    defaultValue = undefined,
    onChange,
    sx,
}) => {
    const id = React.useId();
    const navigate = useNavigate();
    const { loading: loadingPaymentMethods, paymentMethods, error } = useFetchPaymentMethods();

    if (!loadingPaymentMethods && paymentMethods.length === 0 && !error) {
        if (error) {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    <Typography>{String(error)}</Typography>
                </Alert>
            );
        } else return <CreatePaymentMethodAlert sx={sx} />;
    } else if (!loadingPaymentMethods && error) console.error('PaymentMethodAutocomplete: ' + error);
    return (
        <Autocomplete
            id={id + '-create-payment-method'}
            options={paymentMethods.map((item) => ({
                label: `${item.name} ${labelSeperator} ${item.provider}`,
                value: item.id,
            }))}
            onChange={(event, value) => {
                if (!value) return;
                const paymentMethodExists = paymentMethods.some(
                    (pm) => pm.name === value.label.split(labelSeperator)[0].trimEnd()
                );
                if (paymentMethodExists) return onChange(event, value);
                navigate('/payment-methods', {
                    state: { create: true, paymentMethod: { name: value.label.split('"')[1] } },
                });
            }}
            filterOptions={(options, state) => {
                if (state.inputValue.length < 1) return options;
                const filtered = filter(options, state);
                const match = filtered.some((option) =>
                    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                );
                return match ? filtered : [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }];
            }}
            renderOption={(props, option, { selected }) => (
                <StyledAutocompleteOption {...props} selected={selected}>
                    {option.label}
                </StyledAutocompleteOption>
            )}
            defaultValue={defaultValue}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Payment Method"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loadingPaymentMethods && <CircularProgress color="inherit" size={20} />}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            disabled={loadingPaymentMethods}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            loading={loadingPaymentMethods}
            sx={sx}
        />
    );
};
