import { Box, SxProps, Theme, Typography } from '@mui/material';
import { FC } from 'react';

export interface INoResultsProps {
  sx?: SxProps<Theme>;
  text?: string;
}

export const NoResults: FC<INoResultsProps> = ({ sx, text = 'No items found' }) => {
  return (
    <Box
      sx={{
        p: 1.5,
        backgroundColor: (theme) => theme.palette.action.disabledBackground,
        borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        ...sx,
      }}
    >
      <Typography textAlign="center">{text}</Typography>
    </Box>
  );
};
