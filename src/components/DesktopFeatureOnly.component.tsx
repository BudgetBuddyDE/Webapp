import {Typography, type TypographyProps} from '@mui/material';
import React from 'react';

import {ActionPaper, type TActionPaperProps} from './Base';

export type TDesktopFeatureOnlyProps = TActionPaperProps & {
  typographyProps?: TypographyProps;
};

export const DesktopFeatureOnly: React.FC<TDesktopFeatureOnlyProps> = ({typographyProps, ...actionPaperProps}) => {
  return (
    <ActionPaper
      {...actionPaperProps}
      sx={{
        p: 2,
        ...actionPaperProps.sx,
      }}>
      <Typography variant={'h2'} textAlign={'center'} {...typographyProps}>
        This feature is desktop only
      </Typography>
    </ActionPaper>
  );
};
