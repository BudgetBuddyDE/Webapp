import React from 'react';
import { Grid, type GridProps } from '@mui/material';
import { PageHeader, TPageHeaderProps } from './PageHeader.component';

export type TContentGrid = React.PropsWithChildren<TPageHeaderProps & GridProps>;

export const ContentGrid: React.FC<TContentGrid> = ({
  title,
  description,
  children,
  ...gridProps
}) => {
  return (
    <Grid container spacing={3} {...gridProps}>
      <PageHeader title={title} description={description} />
      {children}
    </Grid>
  );
};
