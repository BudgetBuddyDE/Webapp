import { Grid, Typography } from '@mui/material';
import React from 'react';

export const PageHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => {
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
