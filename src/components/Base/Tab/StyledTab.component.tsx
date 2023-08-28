import { Tab, alpha, styled } from '@mui/material';

export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 0,
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: theme.shape.borderRadius * 0.75 + 'px',
  },
}));
