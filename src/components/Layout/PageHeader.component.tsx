import React from 'react';
import {Grid, type GridProps, Typography} from '@mui/material';

export type TPageHeaderProps = {
  title: string;
  description?: string;
} & GridProps;

export const PageHeader: React.FC<TPageHeaderProps> = ({title, description, ...gridProps}) => {
  return (
    <Grid item xs={12} {...gridProps}>
      <Typography variant="h5" fontWeight="bold" sx={{m: 0}}>
        {title}
      </Typography>
      {description && (
        <Typography variant="h6" fontWeight="bold" sx={{m: 0}}>
          {description}
        </Typography>
      )}
    </Grid>
  );
};
