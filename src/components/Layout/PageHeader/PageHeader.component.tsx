import {Grid2 as Grid, type Grid2Props as GridProps, Typography} from '@mui/material';
import React from 'react';

export type TPageHeaderProps = {
  title: string;
  description?: string;
} & GridProps;

export const PageHeader: React.FC<TPageHeaderProps> = ({title, description, ...gridProps}) => {
  return (
    <Grid size={{xs: 12}} {...gridProps}>
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
