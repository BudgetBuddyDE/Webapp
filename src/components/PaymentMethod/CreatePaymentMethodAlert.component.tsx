import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import type { AlertProps, AlertTitleProps } from '@mui/material';

export type CreatePaymentMethodAlertProps = AlertProps & {
    alerTitle?: AlertTitleProps;
};

export const CreatePaymentMethodAlert: React.FC<CreatePaymentMethodAlertProps> = (props) => {
    return (
        <Alert severity="info" {...props}>
            <AlertTitle {...props.alerTitle}>Info</AlertTitle>
            To be able to create a transaction you have to create a payment-method under{' '}
            <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
        </Alert>
    );
};
