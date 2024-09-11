import {type Components, type Theme} from '@mui/material/styles';

export const gridCustomizations: Components<Theme> = {
  MuiGrid: {
    styleOverrides: {
      item: {
        height: 'fit-content',
      },
    },
  },
  MuiGrid2: {
    styleOverrides: {
      root: {
        height: 'fit-content',
      },
    },
  },
};
