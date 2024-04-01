import React from 'react';
import {Box, Typography, useTheme, type BoxProps} from '@mui/material';
import {Icon} from '../Icon.component';

export type TNoResultsProps = {
  text?: string;
  icon?: JSX.Element;
} & Pick<BoxProps, 'sx'>;

export const NoResults: React.FC<TNoResultsProps> = ({sx, icon, text = 'No items found'}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: theme.palette.action.disabledBackground,
        borderRadius: `${theme.shape.borderRadius}px`,
        ...sx,
      }}>
      <Typography textAlign="center">
        {icon && <Icon icon={icon} sx={{mx: 'auto', mb: 1}} />}
        {text}
      </Typography>
    </Box>
  );
};
