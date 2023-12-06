import React from 'react';
import { Box, Typography, useTheme, type BoxProps } from '@mui/material';

export type TNoResultsProps = {
  text?: string;
} & Pick<BoxProps, 'sx'>;

export const NoResults: React.FC<TNoResultsProps> = ({ sx, text = 'No items found' }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: theme.palette.action.disabledBackground,
        borderRadius: `${theme.shape.borderRadius}px`,
        ...sx,
      }}
    >
      <Typography textAlign="center">{text}</Typography>
    </Box>
  );
};
