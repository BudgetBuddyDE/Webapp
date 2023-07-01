import { styled } from '@mui/material';

export const KeyboardShortcut = styled('kbd')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    padding: '0 2px',
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.09))',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${Number(theme.shape.borderRadius) / 2}px`,
    fontSize: '75%',
}));
