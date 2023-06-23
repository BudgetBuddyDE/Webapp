import React from 'react';
import type { AlertProps, AlertTitleProps } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';

export interface CreateCategoryInfoProps extends AlertProps {
    alerTitle?: AlertTitleProps;
}

export const CreateCategoryInfo: React.FC<CreateCategoryInfoProps> = (props) => {
    return (
        <Alert severity="info" {...props}>
            <AlertTitle {...props.alerTitle}>Info</AlertTitle>
            To be able to create a transaction you have to create a category under{' '}
            <strong>Categories {'>'} Add Category</strong> before.{' '}
        </Alert>
    );
};
