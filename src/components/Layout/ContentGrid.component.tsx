import {Grid, type GridProps} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';

import {PageHeader, TPageHeaderProps} from './PageHeader.component';

export type TContentGrid = React.PropsWithChildren<TPageHeaderProps & GridProps>;

export const ContentGrid: React.FC<TContentGrid> = ({title, description, children, ...gridProps}) => {
  return (
    <Grid container spacing={AppConfig.baseSpacing} {...gridProps}>
      <PageHeader title={title} description={description} />
      {children}
    </Grid>
  );
};
