import { Box, BoxProps, Typography } from '@mui/material';
import React from 'react';

export type TabPanelProps = {
  containerProps?: BoxProps;
  /** tab-pane index */
  index: number | string;
  /** current selected tab-pane index */
  value: number | string;
  children?: React.ReactNode;
};

export const TabPanel: React.FC<TabPanelProps> = ({ containerProps, index, value, children }) => {
  const id = React.useId();
  return (
    <Box
      role="tabpanell"
      hidden={value !== index}
      id={`${id}-simple-tabpanell-${index}`}
      aria-labelledby={`${id}-simple-tab-${index}`}
      {...containerProps}
    >
      {value === index && children}
    </Box>
  );
};
