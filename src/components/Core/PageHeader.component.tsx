import React from 'react';
import { Grid, Typography } from '@mui/material';

export type PageHeaderProps = {
    title: string;
    description?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
    return (
        <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" sx={{ m: 0 }}>
                {title}
            </Typography>
            {description && (
                <Typography variant="h6" fontWeight="bold" sx={{ m: 0 }}>
                    {description}
                </Typography>
            )}
        </Grid>
    );
};
