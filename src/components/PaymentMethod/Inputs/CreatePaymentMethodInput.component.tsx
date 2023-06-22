import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePaymentMethodInfo } from '@/components/PaymentMethod/Cards';
import { useFetchPaymentMethods } from '@/hooks';
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Box,
    CircularProgress,
    SxProps,
    TextField,
    Theme,
    Typography,
    createFilterOptions,
} from '@mui/material';

export type PaymentMethodInputOption = {
    label: string;
    value: number | string;
    shouldCreate?: boolean;
};

export interface CreatePaymentMenthodInputProps {
    defaultValue?: PaymentMethodInputOption | null;
    onChange: (event: React.SyntheticEvent<Element, Event>, value: PaymentMethodInputOption | null) => void;
    sx?: SxProps<Theme>;
}

const filter = createFilterOptions<PaymentMethodInputOption>();
const labelSeperator = '•';

export const CreatePaymentMethodInput: React.FC<CreatePaymentMenthodInputProps> = ({
    defaultValue = undefined,
    onChange,
    sx,
}) => {
    const id = React.useId();
    const navigate = useNavigate();
    const { loading, paymentMethods, error } = useFetchPaymentMethods();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...sx,
                }}
            >
                <CircularProgress size="small" />
            </Box>
        );
    }
    if (!loading && paymentMethods.length < 1) return <CreatePaymentMethodInfo sx={sx} />;
    if (!loading && paymentMethods.length === 0 && error) {
        return (
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                <Typography>{String(error)}</Typography>
            </Alert>
        );
    }
    if (!loading && error) console.error('CreatePaymentMethodInput: ' + error);
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
            defaultValue={defaultValue}
            renderInput={(props) => <TextField {...props} label="Payment Method" />}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            sx={sx}
        />
    );
};
