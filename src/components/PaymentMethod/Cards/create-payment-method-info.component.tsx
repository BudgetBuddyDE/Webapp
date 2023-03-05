import { Alert, AlertProps, AlertTitle, AlertTitleProps, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface CreatePaymentMethodInfoProps extends AlertProps {
  alerTitle?: AlertTitleProps;
}

export const CreatePaymentMethodInfo: React.FC<CreatePaymentMethodInfoProps> = (props) => {
  const navigate = useNavigate();
  return (
    <Alert severity="info" {...props}>
      <AlertTitle {...props.alerTitle}>Info</AlertTitle>
      To be able to create a transaction you have to create a payment-method under{' '}
      <strong>
        Payment Methods {'>'}{' '}
        <Button size="small" color="info" onClick={() => navigate('/payment-methods', { state: { create: true } })}>
          Create Payment Method
        </Button>
      </strong>{' '}
      before.{' '}
    </Alert>
  );
};
