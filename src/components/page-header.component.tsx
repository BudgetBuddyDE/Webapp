import { FC } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export const PageHeader: FC<{ title: string; description?: string }> = ({ title, description }) => {
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
