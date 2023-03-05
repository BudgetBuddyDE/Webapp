import { Alert, AlertProps, AlertTitle, AlertTitleProps, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface CreateCategoryInfoProps extends AlertProps {
  alerTitle?: AlertTitleProps;
}

export const CreateCategoryInfo: React.FC<CreateCategoryInfoProps> = (props) => {
  const navigate = useNavigate();
  return (
    <Alert severity="info" {...props}>
      <AlertTitle {...props.alerTitle}>Info</AlertTitle>
      To be able to create a transaction you have to create a category under{' '}
      <strong>
        Categories {'>'}{' '}
        <Button size="small" color="info" onClick={() => navigate('/categories', { state: { create: true } })}>
          Create category
        </Button>
      </strong>{' '}
      before.{' '}
    </Alert>
  );
};
