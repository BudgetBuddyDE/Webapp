import { Alert, AlertProps, AlertTitle, AlertTitleProps } from '@mui/material';
import React from 'react';

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
